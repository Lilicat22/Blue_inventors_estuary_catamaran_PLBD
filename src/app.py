import streamlit as st
import pandas as pd
import numpy as np
import datetime as dt
import pydeck as pdk
import plotly.express as px  


def generate_simulated_data(n=1440, center=(6.5, -5.0)):
	"""Génère des données simulées minute par minute (par défaut 24h)."""
	now = dt.datetime.utcnow()
	times = [now - dt.timedelta(minutes=i) for i in range(n)][::-1]
	lats = np.random.normal(loc=center[0], scale=0.01, size=n)
	lons = np.random.normal(loc=center[1], scale=0.015, size=n)
	# battery: start around 80% with fluctuations and solar recharge during day hours
	battery = np.clip(80 + np.cumsum(np.random.normal(0, 0.02, size=n)) , 0, 100)
	hours = np.array([t.hour for t in times])
	solar = np.where((hours >= 6) & (hours <= 18), np.random.uniform(0.2, 1.2, size=n), 0.0)
	consumption = np.random.uniform(0.3, 0.8, size=n)
	net = solar - consumption
	battery = np.clip(battery + np.cumsum(net) * 0.01, 0, 100)
	# trash collected incremental
	trash_rate = np.random.poisson(lam=0.02, size=n)
	trash_cum = np.cumsum(trash_rate)

	# compartments simulation
	capacities = np.array([100.0, 100.0, 100.0])
	# random allocations for each trash event
	alloc = np.random.dirichlet([1.0, 1.0, 1.0], size=n)
	comp_cum = np.cumsum(trash_rate.reshape(-1,1) * alloc, axis=0)
	comp_empties = np.floor(comp_cum / capacities)
	comp_fill = comp_cum - comp_empties * capacities

	df = pd.DataFrame({
		"timestamp": times,
		"lat": lats,
		"lon": lons,
		"battery": battery,
		"solar_input": solar,
		"consumption": consumption,
		"net_power": net,
		"trash_event": trash_rate,
		"trash_cum": trash_cum,
		"compA_fill": comp_fill[:,0],
		"compB_fill": comp_fill[:,1],
		"compC_fill": comp_fill[:,2],
		"compA_empties": comp_empties[:,0],
		"compB_empties": comp_empties[:,1],
		"compC_empties": comp_empties[:,2],
		"total_collected": comp_cum.sum(axis=1),
		# water quality
		"ph": np.clip(7.0 + np.random.normal(0, 0.15, size=n) + 0.2*np.sin(np.linspace(0,6.28,n)), 5.0, 9.0),
		"water_temp": np.clip(25 + 2.5*np.sin(np.linspace(0,6.28,n)) + np.random.normal(0,0.5,size=n), 15.0, 35.0),
	})
	return df


def predict_time_to_depletion(battery_pct, recent_net_power):
	"""Prédit le temps restant (heures) avant vidage de la batterie.
	recent_net_power en unité arbitraire: positive -> recharge, negative -> décharge
	"""
	if recent_net_power >= 0:
		return float('inf')
	# consommation nette par heure ~ recent_net_power * factor
	# on normalise en pourcentage par heure approximatif
	pct_per_hour = -recent_net_power * 5.0
	if pct_per_hour <= 0:
		return float('inf')
	hours = battery_pct / pct_per_hour
	return max(0.0, hours)


def main():
	st.set_page_config(page_title="Catamaran Estuaire — Dashboard", layout="wide")
	# Thème aquatique professionnel (fond plus foncé pour lisibilité)
	st.markdown(
		"""
		<style>
		/* Fond principal plus foncé et texte clair */
		.stApp { background: linear-gradient(180deg,#04293A 0%, #074F66 100%); }
		/* Forcer couleurs de texte lisibles */
		.stApp, .stApp * { color: #E6F7FF !important; }
		/* Sidebar plus sombre cohérent */
		[data-testid="stSidebar"] { background: linear-gradient(180deg,#002635, #0b5060) !important; color: #ffffff !important; }
		/* Titres */
		h1, h2, h3 { color: #E6F7FF !important; }
		/* Ajuste l'apparence des métriques et boutons */
		.stMetricValue, .stMetricLabel { color: #E6F7FF !important; }
		.stButton>button { background-color: #0294b7 !important; color: #012a4a !important; }
		/* Assurer contraste pour les tableaux */
		.stDataFrame_container, .stTable td, .stTable th { color: #E6F7FF !important; }
		</style>
		""",
		unsafe_allow_html=True,
	)
	st.title("Interface — Catamaran autonome (Estuaires)")

	# Sidebar
	st.sidebar.header("Navigation")
	st.sidebar.markdown("# Blue Inventors")
	st.sidebar.markdown("_Solutions pour estuaires propres_")
	page = st.sidebar.selectbox("Aller à", ["Dashboard", "Cartographie", "Energie", "Collecte", "Alertes", "Qualité de l'eau", "Statistiques", "Contrôle distant", "Données"])
	st.sidebar.markdown("---")
	st.sidebar.write("Projet: Catamaran autonome de collecte de déchets")

	# Load or simulate data
	if "data" not in st.session_state:
		st.session_state.data = generate_simulated_data()

	df = st.session_state.data

	if page == "Dashboard":
		st.header("Résumé opérationnel")
		latest = df.iloc[-1]
		c1, c2, c3, c4 = st.columns(4)
		c1.metric("Batterie (estimée)", f"{latest.battery:.1f}%")
		c2.metric("Entrée solaire (actuelle)", f"{latest.solar_input:.2f} kW")
		c3.metric("Déchets collectés (today)", int(df.trash_cum.iloc[-1440:].iloc[-1] - df.trash_cum.iloc[-1440:].iloc[0]))
		c4.metric("Localisation (dernière)", f"{latest.lat:.4f}, {latest.lon:.4f}")

		st.subheader("Tendances récentes")
		fig = px.line(df.tail(240), x="timestamp", y=["battery","solar_input"], labels={"value":"Valeur","timestamp":"Heure"})
		st.plotly_chart(fig, use_container_width=True)

	elif page == "Cartographie":
		st.header("Cartographie des événements de collecte")
		period = st.selectbox("Période", ["Temps réel (dernières 60 min)", "Quotidien", "Mensuel"])
		if period.startswith("Temps réel"):
			sub = df.tail(60)
		elif period == "Quotidien":
			sub = df.tail(1440)
		else:
			sub = df.tail(1440*30)

		midpoint = (sub.lat.mean(), sub.lon.mean())
		st.map(sub.rename(columns={"lat":"latitude","lon":"longitude"})[["latitude","longitude"]])

		st.subheader("Carte détaillée (pydeck)")
		layer = pdk.Layer("ScatterplotLayer", data=sub, get_position=["lon","lat"], get_color="[200, 30, 0, 160]", get_radius=50)
		view = pdk.ViewState(latitude=midpoint[0], longitude=midpoint[1], zoom=12, pitch=0)
		r = pdk.Deck(layers=[layer], initial_view_state=view)
		st.pydeck_chart(r)

	elif page == "Energie":
		st.header("Energie & Prévisions")
		recent = df.tail(60)
		avg_net = recent.net_power.mean()
		current_batt = df.battery.iloc[-1]
		hours_left = predict_time_to_depletion(current_batt, avg_net)
		st.metric("Charge actuelle", f"{current_batt:.1f}%")
		st.metric("Est. heures restantes", "∞" if hours_left==float('inf') else f"{hours_left:.1f} h")

		fig2 = px.line(recent, x="timestamp", y=["solar_input","consumption","battery"], labels={"value":"kW / %"})
		st.plotly_chart(fig2, use_container_width=True)

	elif page == "Collecte":
		st.header("Suivi collecte")
		st.subheader("Evénements récents")
		st.dataframe(df[ ["timestamp","lat","lon","trash_event","trash_cum"] ].tail(200))
		csv = df.to_csv(index=False).encode('utf-8')
		st.download_button("Télécharger les données (CSV)", data=csv, file_name="collecte_data.csv", mime='text/csv')

	elif page == "Alertes":
		st.header("Alertes et incidents")
		# simulate alerts
		alerts = [
			{"time": df.timestamp.iloc[-30], "type":"Impact", "desc":"Collision mineure détectée"},
			{"time": df.timestamp.iloc[-200], "type":"Pluie forte", "desc":"Rentrer à la base conseillé"},
		]
		for a in alerts:
			st.warning(f"{a['time']:%Y-%m-%d %H:%M} — {a['type']}: {a['desc']}")

	elif page == "Qualité de l'eau":
		st.header("Analyse de la qualité de l'eau")
		st.write("Surveillance du pH et de la température; indicateurs de conformité et alertes.")
		# recent data selection
		window = st.selectbox("Fenêtre temporelle", ["Dernières 60 min", "Quotidien", "Mensuel"], index=1)
		if window == "Dernières 60 min":
			sub = df.tail(60)
		elif window == "Quotidien":
			sub = df.tail(1440)
		else:
			sub = df.tail(1440*30)

		latest = sub.iloc[-1]
		col1, col2, col3 = st.columns([1,1,2])
		# pH gauge
		ph_val = float(latest.ph)
		temp_val = float(latest.water_temp)
		fig_ph = go.Figure(go.Indicator(
			mode="gauge+number",
			value=ph_val,
			domain={'x': [0, 1], 'y': [0, 1]},
			title={'text': "pH"},
			gauge={'axis': {'range': [4, 10]},
				   'bar': {'color': "#0077be"},
				   'steps': [
					   {'range': [4,6.5], 'color': "#f28c8c"},
					   {'range': [6.5,8.5], 'color': "#90ee90"},
					   {'range': [8.5,10], 'color': "#f28c8c"},
				   ]}
		))
		col1.plotly_chart(fig_ph, use_container_width=True)

		# temperature gauge
		fig_temp = go.Figure(go.Indicator(
			mode="gauge+number",
			value=temp_val,
			title={'text': "Température (°C)"},
			gauge={'axis': {'range': [10, 40]}, 'bar': {'color': "#ff7f0e"}}
		))
		col2.plotly_chart(fig_temp, use_container_width=True)

		# line charts
		st.subheader("Tendances pH et Température")
		fig_wq = px.line(sub, x="timestamp", y=["ph","water_temp"], labels={"value":"Valeur","timestamp":"Heure"})
		col3.plotly_chart(fig_wq, use_container_width=True)

		# simple quality score
		def water_quality_score(row):
			score = 100.0
			# pH ideal 6.5-8.5
			if row.ph < 6.5:
				score -= (6.5 - row.ph) * 10
			if row.ph > 8.5:
				score -= (row.ph - 8.5) * 10
			# temp penalty if >30
			if row.water_temp > 30:
				score -= (row.water_temp - 30) * 2
			return max(0, min(100, score))

		sub['wq_score'] = sub.apply(water_quality_score, axis=1)
		st.subheader("Indice de qualité de l'eau (WQ Score)")
		st.line_chart(sub.set_index('timestamp')['wq_score'])

		# alerts for thresholds
		low_ph = sub[sub.ph < 6.5]
		high_temp = sub[sub.water_temp > 30]
		if not low_ph.empty:
			st.warning(f"pH bas détecté: {len(low_ph)} événements dans la fenêtre sélectionnée")
		if not high_temp.empty:
			st.warning(f"Température élevée détectée: {len(high_temp)} événements dans la fenêtre sélectionnée")

	elif page == "Statistiques":
		st.header("Statistiques & Exports")
		st.write("Agrégations hebdomadaires, mensuelles et analyses par compartiment.")
		freq = st.selectbox("Période d'agrégation", ["D" , "W", "M"], format_func=lambda x: {"D":"Journalier","W":"Hebdomadaire","M":"Mensuel"}[x])

		# prepare index
		df2 = df.copy()
		df2['timestamp'] = pd.to_datetime(df2['timestamp'])
		df2 = df2.set_index('timestamp')
		agg = df2.resample(freq).agg({
			'total_collected':'sum',
			'battery':'mean',
			'solar_input':'mean',
			'ph':'mean',
			'water_temp':'mean',
			'compA_fill':'max',
			'compB_fill':'max',
			'compC_fill':'max',
			'compA_empties':'max',
			'compB_empties':'max',
			'compC_empties':'max',
		})

		st.subheader("Tableau agrégé")
		st.dataframe(agg.tail(50))

		csv = agg.reset_index().to_csv(index=False).encode('utf-8')
		st.download_button("Télécharger agrégats (CSV)", data=csv, file_name="aggregats.csv", mime='text/csv')

		st.subheader("Analyse par compartiment")
		comp_summary = {
			'compA_total': int(df.compA_empties.max() * 100 + df.compA_fill.max()),
			'compB_total': int(df.compB_empties.max() * 100 + df.compB_fill.max()),
			'compC_total': int(df.compC_empties.max() * 100 + df.compC_fill.max()),
		}
		st.json(comp_summary)
		# export per-compartment
		comp_df = df[['timestamp','compA_fill','compB_fill','compC_fill','compA_empties','compB_empties','compC_empties','total_collected']]
		st.download_button("Télécharger données par compartiment (CSV)", data=comp_df.to_csv(index=False).encode('utf-8'), file_name='compartiments.csv', mime='text/csv')

	elif page == "Contrôle distant":
		st.header("Contrôle distant & Téléopération (simulation)")
		st.write("Envoyer des commandes simulées au robot et suivre son GPS en temps réel.")
		# init commands log
		if 'commands' not in st.session_state:
			st.session_state.commands = []

		col1, col2 = st.columns([2,1])
		with col1:
			st.subheader("Carte & Trajectoire")
			submap = df.tail(200)
			midpoint = (submap.lat.mean(), submap.lon.mean())
			# show path
			st.map(submap.rename(columns={"lat":"latitude","lon":"longitude"})[["latitude","longitude"]])
			# pydeck with target markers
			layers = [pdk.Layer("ScatterplotLayer", data=submap, get_position=["lon","lat"], get_color="[0,120,200,160]", get_radius=40)]
			# show target markers from session
			targets = st.session_state.get('targets', [])
			if targets:
				targ_df = pd.DataFrame(targets)
				layers.append(pdk.Layer("ScatterplotLayer", data=targ_df, get_position=["lon","lat"], get_color="[200,30,0,200]", get_radius=100))
			view = pdk.ViewState(latitude=midpoint[0], longitude=midpoint[1], zoom=12)
			st.pydeck_chart(pdk.Deck(layers=layers, initial_view_state=view))

		with col2:
			st.subheader("Envoyer commande")
			with st.form("cmd_form"):
				cmd = st.selectbox("Commande", ["Aller à", "Retour base", "Vider compartiments", "Arrêt d'urgence"])
				lat_in = st.number_input("Latitude cible", value=float(df.lat.iloc[-1]), format="%.6f")
				lon_in = st.number_input("Longitude cible", value=float(df.lon.iloc[-1]), format="%.6f")
				submit = st.form_submit_button("Envoyer")
				if submit:
					entry = {'time': pd.Timestamp.utcnow(), 'cmd': cmd, 'lat': lat_in, 'lon': lon_in}
					st.session_state.commands.append(entry)
					# register target marker
					if 'targets' not in st.session_state:
						st.session_state.targets = []
					st.session_state.targets.append({'lat': lat_in, 'lon': lon_in})
					st.success("Commande ajoutée au journal (simulation)")

			st.subheader("Journal des commandes")
			if st.session_state.commands:
				for c in reversed(st.session_state.commands[-20:]):
					st.write(f"{c['time'].strftime('%Y-%m-%d %H:%M:%S')} — {c['cmd']} → {c['lat']:.5f},{c['lon']:.5f}")
			else:
				st.write("Aucune commande envoyée.")

			if st.button("Simuler déplacement vers dernier target"):
				if st.session_state.get('targets'):
					tgt = st.session_state.targets[-1]
					# simulate path: interpolate 10 points from last position to target
					last = df.iloc[-1]
					lats = np.linspace(last.lat, tgt['lat'], 10)
					lons = np.linspace(last.lon, tgt['lon'], 10)
					now = pd.to_datetime(df.timestamp.iloc[-1])
					new_rows = []
					for i in range(10):
						new_rows.append({
							'timestamp': now + pd.Timedelta(minutes=i+1),
							'lat': float(lats[i]),
							'lon': float(lons[i]),
							'battery': max(0, float(last.battery - (i+1)*0.2)),
							'solar_input': float(last.solar_input),
							'consumption': float(last.consumption),
							'net_power': float(last.net_power),
							'trash_event': 0,
							'trash_cum': int(df.trash_cum.iloc[-1]),
							'compA_fill': float(df.compA_fill.iloc[-1]),
							'compB_fill': float(df.compB_fill.iloc[-1]),
							'compC_fill': float(df.compC_fill.iloc[-1]),
							'compA_empties': float(df.compA_empties.iloc[-1]),
							'compB_empties': float(df.compB_empties.iloc[-1]),
							'compC_empties': float(df.compC_empties.iloc[-1]),
							'total_collected': float(df.total_collected.iloc[-1]),
							'ph': float(df.ph.iloc[-1]),
							'water_temp': float(df.water_temp.iloc[-1]),
						})
					new_df = pd.DataFrame(new_rows)
					st.session_state.data = pd.concat([df, new_df], ignore_index=True)
					st.success("Déplacement simulé ajouté aux données.")

	else:  # Données
		st.header("Administration des données")
		st.write("Aperçu brut des données simulées")
		st.dataframe(df.head(500))

	st.sidebar.markdown("---")
	st.sidebar.write("Simuler nouvelle série")
	if st.sidebar.button("Régénérer données"):
		st.session_state.data = generate_simulated_data()
		st.experimental_rerun()


if __name__ == '__main__':
	main()

