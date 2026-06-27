import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  Bell,
  ChevronRight,
  Download,
  Droplets,
  Gauge,
  MapPin,
  Radar,
  Sun,
  Thermometer,
  Trash2,
  Waves,
  Wifi,
  X,
} from "lucide-react";

const COLORS = {
  bg: "#04222F",
  panel: "#0A2E3D",
  panelBorder: "#143F50",
  accent: "#2FD4C8",
  accent2: "#F4B860",
  danger: "#F4715C",
  foam: "#E8F6F4",
  muted: "#7FA6B0",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 2000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function formatChartValue(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1).replace(/\.0$/, "");
  }
  return value;
}

function ChartTooltip({ active, payload, label, coordinate, viewBox }) {
  if (!active || !payload?.length) return null;

  const minWidth = 160;
  const chartWidth = viewBox?.width || 360;
  const x = coordinate?.x ?? 0;
  const shiftX = x > chartWidth / 2 ? -minWidth - 12 : 12;

  // prefer an explicit fullName coming from the data point
  const title = payload[0]?.payload?.fullName ?? label;

  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 10,
        padding: "8px 10px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.22)",
        minWidth,
        pointerEvents: "none",
        transform: `translateX(${shiftX}px)`,
      }}
    >
      <div style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {payload.map((entry, index) => (
          <div key={`${entry.name || entry.dataKey || index}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.foam }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: entry.color || COLORS.accent, flexShrink: 0 }} />
            <span>{entry.name || entry.dataKey}</span>
            <span style={{ fontFamily: "IBM Plex Mono", marginLeft: "auto" }}>{formatChartValue(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function {apiError && (
  <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 8, background: "rgba(244,113,92,0.15)", border: `1px solid ${COLORS.danger}` }}>
    <div style={{ fontSize: 10, color: COLORS.danger, fontFamily: "IBM Plex Mono" }}>
      ⚠️ API indisponible
    </div>
    <div style={{ fontSize: 9, color: COLORS.muted, marginTop: 4 }}>
      Démarrez l'API: <code>python /src/sensor_api.py</code>
    </div>
  </div>
)}// === RÉCUPÉRATION DES VRAIES DONNÉES DES CAPTEURS ===
const [sensorData, setSensorData] = useState({
  ph: 7.4,
  temperature: 23.5,
  battery: 62,
  latitude: 6.5,
  longitude: -5.0,
  speed: 1.1,
  waste_today_kg: 12.4,
  solar_input: 180,
  turbidity: 18,
});
const [apiError, setApiError] = useState(null);

// Récupère les données de l'API Flask
useEffect(() => {
  const fetchSensorData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/current');
      if (!response.ok) throw new Error('API indisponible');
      const data = await response.json();
      setSensorData(data);
      setApiError(null);
    } catch (err) {
      console.warn('❌ API indisponible, utilisation des valeurs par défaut');
      setApiError(err.message);
    }
  };

  fetchSensorData();
  // Mise à jour toutes les 2 secondes (adapter la fréquence selon vos besoins)
  const interval = setInterval(fetchSensorData, 2000);
  return () => clearInterval(interval);
}, []);

// Variables locales avec les données réelles des capteurs
const ph = parseFloat(sensorData.ph).toFixed(2);
const temp = parseFloat(sensorData.temperature).toFixed(1);
const turbidity = Math.round(parseFloat(sensorData.turbidity)).toString();
const battery = Math.max(4, Math.min(100, Math.round(parseFloat(sensorData.battery)))).toString();
const solarInput = Math.max(0, Math.round(parseFloat(sensorData.solar_input))).toString();
const speed = parseFloat(sensorData.speed).toFixed(2);
const wasteToday = parseFloat(sensorData.waste_today_kg).toFixed(1);wiggle(base, amp, t, speed = 1, seed = 0) {
  return base + amp * Math.sin(t * speed + seed) + amp * 0.3 * Math.sin(t * speed * 2.7 + seed);
}

function Sparkline({ data, color, dataKey = "v" }) {
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey}-${color})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatCard({ icon: Icon, label, value, unit, trend, color, sub }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: COLORS.muted,
            fontSize: 12,
            fontFamily: "Inter",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          <Icon size={14} color={color} />
          {label}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 28, fontWeight: 600, color: COLORS.foam }}>
          {value}
        </span>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13, color: COLORS.muted }}>{unit}</span>
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: COLORS.muted, fontFamily: "Inter" }}>{sub}</div>
      )}
      {trend && <Sparkline data={trend} color={color} />}
    </div>
  );
}

function Pill({ children, tone = "ok" }) {
  const map = {
    ok: { bg: "rgba(47,212,200,0.12)", fg: COLORS.accent },
    warn: { bg: "rgba(244,184,96,0.14)", fg: COLORS.accent2 },
    danger: { bg: "rgba(244,113,92,0.14)", fg: COLORS.danger },
  };
  const s = map[tone] ?? map.ok;
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        fontFamily: "IBM Plex Mono",
        fontSize: 11.5,
        padding: "3px 9px",
        borderRadius: 20,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ kicker, title }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "IBM Plex Mono",
          fontSize: 11.5,
          color: COLORS.accent,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {kicker}
      </div>
      <h2 style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 24, color: COLORS.foam, margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

function waterAnalysis(ph, temp, turbidity) {
  const notes = [];
  if (ph >= 6.5 && ph <= 8.5) {
    notes.push("pH stable, dans la plage favorable à la vie aquatique.");
  } else {
    notes.push("pH hors plage optimale — surveillance recommandée.");
  }

  if (temp >= 18 && temp <= 28) {
    notes.push("Température cohérente avec un estuaire tempéré.");
  } else if (temp > 28) {
    notes.push("Température élevée, risque de baisse d’oxygène dissous.");
  } else {
    notes.push("Température fraîche pour la saison.");
  }

  if (turbidity < 25) {
    notes.push("Eau claire, faible charge en particules.");
  } else {
    notes.push("Turbidité élevée, probablement liée à un apport sédimentaire récent.");
  }

  const score =
    (ph >= 6.5 && ph <= 8.5 ? 1 : 0) +
    (temp >= 18 && temp <= 28 ? 1 : 0) +
    (turbidity < 25 ? 1 : 0);

  const verdict =
    score === 3
      ? ["Bonne qualité d’eau", "ok"]
      : score === 2
      ? ["Qualité d’eau correcte", "warn"]
      : ["Qualité d’eau préoccupante", "danger"];

  return { notes, verdict };
}

const RIVER_PATH =
  "M 20,250 C 90,210 120,150 90,95 C 65,55 110,25 180,30 " +
  "C 260,36 270,90 330,110 C 410,135 470,95 540,120 " +
  "C 610,145 600,210 670,235 C 730,255 760,200 800,205";

function PoolMap({ t, height = 320, compact = false }) {
  const poolCenter = { x: 460, y: 180 };
  // enlarge pool frame to better occupy the card
  const poolRadius = 210;
  const ringRadius = poolRadius + 18;

  // robot route points constrained inside the pool
  const routePoints = useMemo(() => {
    const pts = [];
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2 + (i % 2 ? 0.2 : -0.2);
      const r = poolRadius * (0.45 + 0.35 * Math.random());
      pts.push({ x: poolCenter.x + Math.cos(angle) * r, y: poolCenter.y + Math.sin(angle) * r });
    }
    return pts;
  }, [poolCenter.x, poolCenter.y, poolRadius]);

  // waste points placed inside the pool circle
  const wastePoints = useMemo(() => {
    const pts = [];
    const colors = [COLORS.accent, COLORS.accent2, COLORS.danger, "#7C9CB8"];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      const r = poolRadius * (0.1 + 0.7 * Math.random());
      pts.push({ x: Math.round(poolCenter.x + Math.cos(a) * r), y: Math.round(poolCenter.y + Math.sin(a) * r), color: colors[i % colors.length], size: 6 + Math.round(4 * Math.random()) });
    }
    return pts;
  }, [poolCenter.x, poolCenter.y, poolRadius]);

  const progress = (t * 0.18) % 1;
  const segmentIndex = Math.floor(progress * routePoints.length) % routePoints.length;
  const nextIndex = (segmentIndex + 1) % routePoints.length;
  const local = (progress * routePoints.length) % 1;
  const from = routePoints[segmentIndex];
  const to = routePoints[nextIndex];
  let robotX = from.x + (to.x - from.x) * local;
  let robotY = from.y + (to.y - from.y) * local;

  // clamp robot inside pool
  const dx = robotX - poolCenter.x;
  const dy = robotY - poolCenter.y;
  const dist = Math.hypot(dx, dy) || 1;
  if (dist > poolRadius - 12) {
    const ratio = (poolRadius - 12) / dist;
    robotX = poolCenter.x + dx * ratio;
    robotY = poolCenter.y + dy * ratio;
  }

  const nearDock = false; // dock removed

  return (
    <svg viewBox="0 0 900 340" width="100%" height={compact ? 220 : height} style={{ display: "block" }}>
      <circle cx={poolCenter.x} cy={poolCenter.y} r={poolRadius + 14} fill="rgba(47,212,200,0.06)" />
      <circle cx={poolCenter.x} cy={poolCenter.y} r={poolRadius} fill="#0B4E63" stroke="#3BC2D2" strokeWidth="2.2" />
      <circle cx={poolCenter.x} cy={poolCenter.y} r={ringRadius} fill="none" stroke="#2FD4C8" strokeWidth="1.2" strokeDasharray="6 6" opacity="0.5" />

      {/* waste markers inside pool */}
      <g>
        {wastePoints.map((w, i) => (
          <circle key={i} cx={w.x} cy={w.y} r={w.size} fill={w.color} fillOpacity={0.9} stroke="#06282E" strokeWidth={1} />
        ))}
      </g>

      <path d={`M ${routePoints.map((p) => `${p.x},${p.y}`).join(" L ")}`} fill="none" stroke="#2FD4C8" strokeWidth="2.4" strokeDasharray="8 6" opacity="0.9" />

      <g transform={`translate(${robotX}, ${robotY})`}>
        <circle r="12" fill="none" stroke={nearDock ? "#F4B860" : "#2FD4C8"} strokeWidth="2" opacity="0.95" />
        <circle r="6" fill={nearDock ? "#F4B860" : "#2FD4C8"} />
      </g>

      <text x={poolCenter.x} y={poolCenter.y + poolRadius + 20} textAnchor="middle" fill="#CFE8E4" fontSize="14" fontFamily="Inter" fontWeight={600}>Zone de test : piscine gonflable · 150 cm Ø</text>
    </svg>
  );
}


function AlertRow({ a, onDismiss, expanded }) {
  const toneMap = {
    danger: { color: COLORS.danger, Icon: AlertTriangle },
    warn: { color: COLORS.accent2, Icon: AlertTriangle },
    ok: { color: COLORS.accent, Icon: Bell },
  };
  const { color, Icon } = toneMap[a.level] ?? toneMap.ok;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${COLORS.panelBorder}`,
      }}
    >
      <Icon size={16} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{a.title}</span>
          <span style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: COLORS.muted }}>{a.time}</span>
        </div>
        {expanded && (
          <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 4, lineHeight: 1.5 }}>{a.desc}</div>
        )}
      </div>
      <button
        className="focusable"
        onClick={() => onDismiss(a.id)}
        style={{ background: "none", border: "none", color: COLORS.muted, padding: 4 }}
        aria-label="Ignorer l’alerte"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const now = useNow();
  const t = now / 4000;

  const ph = wiggle(7.4, 0.35, t, 0.6, 1).toFixed(2);
  const temp = wiggle(23.5, 1.8, t, 0.4, 2).toFixed(1);
  const turbidity = wiggle(18, 9, t, 0.5, 3).toFixed(0);
  const battery = Math.max(4, Math.min(100, wiggle(62, 6, t, 0.15, 4))).toFixed(0);
  const solarInput = Math.max(0, wiggle(180, 90, t, 0.25, 5)).toFixed(0);
  const speed = Math.max(0, wiggle(1.1, 0.3, t, 0.8, 6)).toFixed(2);
  const wasteToday = (12.4 + Math.sin(t * 0.1) * 1.2).toFixed(1);

  const [history, setHistory] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({ i, ph: 7.4, temp: 23.5, batt: 65, energyTrend: 65 }))
  );

  useEffect(() => {
    setHistory((h) => {
      const next = [
        ...h.slice(1),
        {
          i: h[h.length - 1].i + 1,
          ph: parseFloat(ph),
          temp: parseFloat(temp),
          batt: parseFloat(battery),
          energyTrend: parseFloat(battery),
        },
      ];
      return next;
    });
  }, [battery, ph, temp]);

  const energyForecast = useMemo(() => {
    const currentBatt = parseFloat(battery);
    const consumptionRate = 1.6;
    const points = [];
    for (let h = 0; h <= 12; h += 1) {
      const solarBoost = h % 24 < 8 ? 0.9 : 0;
      const val = Math.max(0, currentBatt - consumptionRate * h * (1 - solarBoost * 0.5));
      points.push({ h: `+${h}h`, projection: Math.round(val) });
    }
    return points;
  }, [battery]);

  const depletionHour = energyForecast.find((p) => p.projection <= 15);

  const [period, setPeriod] = useState("Semaine");
  const periodData = {
    Jour: {
      total: "12.4 kg",
      chart: [
        { n: "00h", fullName: "00:00", v: 0.4 },
        { n: "06h", fullName: "06:00", v: 2.1 },
        { n: "12h", fullName: "12:00", v: 6.8 },
        { n: "18h", fullName: "18:00", v: 10.5 },
        { n: "Now", fullName: "Maintenant", v: 12.4 },
      ],
    },
    Semaine: {
      total: "84.7 kg",
      chart: [
        { n: "L", fullName: "Lundi", v: 9 },
        { n: "M", fullName: "Mardi", v: 14 },
        { n: "M", fullName: "Mercredi", v: 11 },
        { n: "J", fullName: "Jeudi", v: 17 },
        { n: "V", fullName: "Vendredi", v: 12 },
        { n: "S", fullName: "Samedi", v: 13 },
        { n: "D", fullName: "Dimanche", v: 8.7 },
      ],
    },
    Mois: {
      total: "312 kg",
      chart: [
        { n: "S1", fullName: "Semaine 1", v: 78 },
        { n: "S2", fullName: "Semaine 2", v: 84 },
        { n: "S3", fullName: "Semaine 3", v: 65 },
        { n: "S4", fullName: "Semaine 4", v: 85 },
      ],
    },
    Année: {
      total: "3 540 kg",
      chart: [
        { n: "Jan", fullName: "Janvier", v: 240 },
        { n: "Fev", fullName: "Février", v: 260 },
        { n: "Mar", fullName: "Mars", v: 310 },
        { n: "Avr", fullName: "Avril", v: 290 },
        { n: "Mai", fullName: "Mai", v: 330 },
        { n: "Jun", fullName: "Juin", v: 300 },
      ],
    },
  };

  const composition = [
    { name: "Plastiques", value: 64, color: COLORS.accent },
    { name: "Papier/Carton", value: 14, color: COLORS.accent2 },
    { name: "Métaux", value: 9, color: "#7C9CB8" },
    { name: "Verre", value: 6, color: "#5B7E8C" },
    { name: "Autres", value: 7, color: "#3A5662" },
  ];

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      level: "danger",
      time: "Il y a 4 min",
      title: "Collision détectée",
      desc: "Capteur ultrason avant — impact léger contre obstacle flottant.",
      read: false,
    },
    {
      id: 2,
      level: "warn",
      time: "Il y a 22 min",
      title: "Vent fort",
      desc: "Rafales > 35 km/h enregistrées, navigation en mode prudence.",
      read: false,
    },
    {
      id: 3,
      level: "ok",
      time: "Il y a 1 h",
      title: "Décharge automatique réussie",
      desc: "Réservoir vidé à la station d’amarrage — capacité restaurée à 100%.",
      read: true,
    },
    {
      id: 4,
      level: "warn",
      time: "Il y a 3 h",
      title: "Batterie faible signalée",
      desc: "Niveau descendu sous 20% avant recharge solaire.",
      read: true,
    },
  ]);

  const dismiss = (id) => setAlerts((a) => a.filter((x) => x.id !== id));
  const unread = alerts.filter((a) => !a.read).length;
  const wq = waterAnalysis(parseFloat(ph), parseFloat(temp), parseFloat(turbidity));
  const [tab, setTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Vue d’ensemble", icon: Gauge },
    { id: "map", label: "Cartographie & détection", icon: MapPin },
    { id: "water", label: "Qualité de l’eau", icon: Droplets },
    { id: "energy", label: "Énergie", icon: Battery },
    { id: "waste", label: "Déchets collectés", icon: Trash2 },
    { id: "alerts", label: "Alertes", icon: Bell, badge: unread },
    { id: "about", label: "À propos", icon: Waves },
  ];

  const downloadCsv = (rows, filename) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")]
      .concat(
        rows.map((row) =>
          headers
            .map((key) => {
              const value = row[key] ?? "";
              const escaped = String(value).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentView = () => {
    const rows = [];
    if (tab === "overview") {
      rows.push({ section: "overview", battery, solarInput, speed, ph, temp, turbidity, wasteToday });
    } else if (tab === "water") {
      rows.push({ section: "water", ph, temp, turbidity, verdict: wq.verdict[0] });
      history.forEach((item, index) => rows.push({ section: "water_history", point: index, ph: item.ph, temp: item.temp, battery: item.batt }));
    } else if (tab === "energy") {
      rows.push({ section: "energy", battery, solarInput, depletionHour: depletionHour?.h || "n/a" });
      energyForecast.forEach((item) => rows.push({ section: "energy_forecast", horizon: item.h, projection: item.projection }));
    } else if (tab === "waste") {
      rows.push({ section: "waste_summary", period, total: periodData[period].total });
      periodData[period].chart.forEach((item) => rows.push({ section: "waste_series", label: item.n, value: item.v }));
      composition.forEach((item) => rows.push({ section: "waste_composition", name: item.name, value: item.value }));
    } else if (tab === "alerts") {
      alerts.forEach((item) => rows.push({ section: "alert", level: item.level, title: item.title, time: item.time, desc: item.desc }));
    } else {
      rows.push({ section: "map", speed, battery, ph, temp });
    }
    downloadCsv(rows, `blue-inventors-${tab}-export.csv`);
  };

  const exportAllData = () => {
    const rows = [
      { section: "snapshot", timestamp: new Date().toISOString(), battery, solarInput, speed, ph, temp, turbidity, wasteToday, quality: wq.verdict[0] },
      ...history.map((item, index) => ({ section: "history", point: index, ph: item.ph, temp: item.temp, battery: item.batt })),
      ...periodData[period].chart.map((item) => ({ section: "waste_series", label: item.n, value: item.v })),
      ...composition.map((item) => ({ section: "composition", name: item.name, value: item.value })),
      ...alerts.map((item) => ({ section: "alert", level: item.level, title: item.title, time: item.time, desc: item.desc })),
    ];
    downloadCsv(rows, `blue-inventors-all-data.csv`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top, #0A3344 0%, ${COLORS.bg} 55%)`,
        color: COLORS.foam,
        fontFamily: "Inter, sans-serif",
        display: "flex",
      }}
    >
      <style>{FONT_IMPORT}{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #143F50; border-radius: 8px; }
        button { cursor: pointer; }
        @keyframes ping { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
        .focusable:focus-visible { outline: 2px solid ${COLORS.accent}; outline-offset: 2px; border-radius: 8px; }
      `}</style>

      <aside
        style={{
          width: 248,
          flexShrink: 0,
          borderRight: `1px solid ${COLORS.panelBorder}`,
          padding: "26px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 4 }}>
          <div style={{ position: "relative", width: 34, height: 34, display: "grid", placeItems: "center" }}>
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `1px solid ${COLORS.accent}`,
                animation: "ping 2.4s ease-out infinite",
              }}
            />
            <Waves size={18} color={COLORS.accent} />
          </div>
          <div>
            <div style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 16, lineHeight: 1 }}>Blue Inventors</div>
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 10.5, color: COLORS.muted, letterSpacing: 0.5 }}>
              PLBD · ESTUAIRE CTRL
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map((it) => {
            const active = tab === it.id;
            return (
              <button
                key={it.id}
                className="focusable"
                onClick={() => setTab(it.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  textAlign: "left",
                  background: active ? "rgba(47,212,200,0.12)" : "transparent",
                  color: active ? COLORS.accent : COLORS.muted,
                  fontFamily: "Inter",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                }}
              >
                <it.icon size={16} />
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.badge > 0 && (
                  <span
                    style={{
                      background: COLORS.danger,
                      color: "#fff",
                      fontSize: 10.5,
                      fontFamily: "IBM Plex Mono",
                      borderRadius: 20,
                      padding: "1px 6px",
                    }}
                  >
                    {it.badge}
                  </span>
                )}
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", padding: "14px", borderRadius: 12, background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "IBM Plex Mono", fontSize: 11, color: COLORS.muted, marginBottom: 6 }}>
            <Wifi size={13} color={COLORS.accent} /> LIAISON LORA/4G
          </div>
          <Pill tone="ok">Connecté · 142 ms</Pill>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "30px 38px 60px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 11.5, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Mission en cours
            </div>
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 30, margin: "4px 0 0" }}>
              Estuaire — Simul Bassin
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Pill tone="ok">Robot actif</Pill>
            <Pill tone={parseFloat(battery) < 25 ? "danger" : "ok"}>Batterie {battery}%</Pill>
            <Pill tone="ok">Vitesse {speed} m/s</Pill>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="focusable"
                onClick={exportCurrentView}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1px solid ${COLORS.panelBorder}`,
                  background: COLORS.panel,
                  color: COLORS.foam,
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontFamily: "Inter",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                <Download size={14} /> Exporter la vue
              </button>
              <button
                className="focusable"
                onClick={exportAllData}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1px solid ${COLORS.accent}`,
                  background: "rgba(47,212,200,0.12)",
                  color: COLORS.accent,
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontFamily: "Inter",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                <Download size={14} /> Tout exporter
              </button>
            </div>
          </div>
        </div>

        {tab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard icon={Thermometer} label="Température" value={temp} unit="°C" color={COLORS.accent2} trend={history.map((h) => ({ v: h.temp }))} />
              <StatCard icon={Droplets} label="pH de l’eau" value={ph} unit="" color={COLORS.accent} trend={history.map((h) => ({ v: h.ph }))} />
              <StatCard icon={Battery} label="Niveau batterie" value={battery} unit="%" color={parseFloat(battery) < 25 ? COLORS.danger : COLORS.accent} trend={history.map((h) => ({ v: h.batt }))} />
              <StatCard icon={Trash2} label="Déchets — aujourd’hui" value={wasteToday} unit="kg" color={COLORS.accent2} sub="Objectif journalier : 15 kg" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18 }}>
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
                <SectionTitle kicker="Cartographie GPS" title="Densité des déchets repérés" />
                <PoolMap t={t} compact />
                <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11.5, color: COLORS.muted, fontFamily: "Inter" }}>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, background: "#11607A", borderRadius: 2, marginRight: 5 }} />Faible</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, background: COLORS.accent, borderRadius: 2, marginRight: 5 }} />Modérée</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, background: COLORS.accent2, borderRadius: 2, marginRight: 5 }} />Élevée</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, background: COLORS.danger, borderRadius: 2, marginRight: 5 }} />Très élevée</span>
                </div>
              </div>

              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
                <SectionTitle kicker="Analyse automatique" title="Synthèse de l’eau" />
                <div style={{ marginBottom: 12 }}>
                  <Pill tone={wq.verdict[1]}>{wq.verdict[0]}</Pill>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "#CFE8E4" }}>
                  {wq.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
              <SectionTitle kicker="Alertes récentes" title="Dernières notifications du robot" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {alerts.slice(0, 3).map((a) => (
                  <AlertRow key={a.id} a={a} onDismiss={dismiss} />
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "map" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
              <SectionTitle kicker="Environnement de test" title="Cartographie locale de la piscine" />
              <PoolMap t={t} height={320} />
              <p style={{ color: COLORS.muted, fontSize: 12.5, marginTop: 14, lineHeight: 1.6 }}>
                Cette vue suit un repère local de type piscine gonflable, avec une zone de recharge et un trajet de test. Pour une vraie localisation, il faut remplacer ce repère par des mesures d’odométrie, d’IMU et de caméra.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <StatCard icon={Radar} label="Détections — 10 dernières min" value="37" unit="objets" color={COLORS.accent} />
              <StatCard icon={MapPin} label="Position actuelle" value="x: 240 cm" unit="y: 168 cm" color={COLORS.accent2} />
              <StatCard icon={Gauge} label="Cap / vitesse" value={speed} unit="m/s" color={COLORS.accent} />
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontFamily: "IBM Plex Mono", fontSize: 11.5, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase" }}>
                  Mode de navigation
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Pill tone="ok">Tracking local</Pill>
                  <Pill tone="warn">Docking station</Pill>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "water" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
              <SectionTitle kicker="Capteurs embarqués" title="pH & température — 60 dernières mesures" />
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid stroke={COLORS.panelBorder} strokeDasharray="3 3" />
                    <XAxis dataKey="i" tick={false} stroke={COLORS.muted} />
                    <YAxis yAxisId="ph" stroke={COLORS.accent} tick={{ fill: COLORS.muted, fontSize: 10 }} width={34} domain={[6, 9]} />
                    <YAxis yAxisId="temp" orientation="right" stroke={COLORS.accent2} tick={{ fill: COLORS.muted, fontSize: 10 }} width={34} domain={[18, 30]} />
                    <Tooltip content={<ChartTooltip />} wrapperStyle={{ pointerEvents: "none" }} cursor={false} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="ph" type="monotone" dataKey="ph" name="pH" stroke={COLORS.accent} strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line yAxisId="temp" type="monotone" dataKey="temp" name="Température (°C)" stroke={COLORS.accent2} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <StatCard icon={Droplets} label="Turbidité" value={turbidity} unit="NTU" color={COLORS.accent} />
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: "IBM Plex Mono", fontSize: 11.5, color: COLORS.muted, textTransform: "uppercase", marginBottom: 8 }}>
                  Verdict
                </div>
                <Pill tone={wq.verdict[1]}>{wq.verdict[0]}</Pill>
                <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "#CFE8E4" }}>
                  {wq.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "energy" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
              <SectionTitle kicker="Bilan énergétique" title="Apport solaire vs consommation" />
              <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <StatCard icon={Sun} label="Apport solaire" value={solarInput} unit="W" color={COLORS.accent2} />
                <StatCard icon={BatteryCharging} label="Batterie" value={battery} unit="%" color={COLORS.accent} />
              </div>
              <p style={{ color: COLORS.muted, fontSize: 12.5, lineHeight: 1.6 }}>
                Le panneau solaire couvre {solarInput > 150 ? "une part importante" : "une part partielle"} de la consommation actuelle du robot.
              </p>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
              <SectionTitle kicker="Prédiction" title="Projection sur 12 heures" />
              <div style={{ width: "100%", height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyForecast} margin={{ top: 8, right: 10, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={COLORS.panelBorder} strokeDasharray="3 3" />
                    <XAxis dataKey="h" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 10 }} />
                    <YAxis stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 10 }} width={34} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, fontSize: 12 }} />
                    <Area type="monotone" dataKey="projection" stroke={COLORS.accent} fill="url(#energyGrad)" strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p style={{ color: COLORS.muted, fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>
                Niveau actuel : <strong style={{ color: COLORS.foam }}>{battery}%</strong>. {depletionHour ? <>Au rythme actuel, la batterie atteindra un seuil critique (15%) dans environ <strong style={{ color: COLORS.accent2 }}>{depletionHour.h}</strong> sans recharge solaire suffisante.</> : <>Au rythme actuel, le niveau restera au-dessus du seuil critique sur les 12 prochaines heures.</>}
              </p>
            </div>
          </div>
        )}

        {tab === "waste" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <SectionTitle kicker="Statistiques de collecte" title={`Déchets collectés — ${period.toLowerCase()}`} />
              <div style={{ display: "flex", gap: 6 }}>
                {Object.keys(periodData).map((p) => (
                  <button
                    key={p}
                    className="focusable"
                    onClick={() => setPeriod(p)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      border: `1px solid ${COLORS.panelBorder}`,
                      background: period === p ? COLORS.accent : "transparent",
                      color: period === p ? COLORS.bg : COLORS.muted,
                      fontFamily: "Inter",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
                  {periodData[period].total}
                </div>
                <div style={{ width: "100%", height: 210 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodData[period].chart} margin={{ top: 8, right: 10, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke={COLORS.panelBorder} strokeDasharray="3 3" />
                      <XAxis dataKey="n" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 10 }} />
                      <YAxis stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 10 }} width={34} />
                      <Tooltip content={<ChartTooltip />} wrapperStyle={{ pointerEvents: "none" }} cursor={false} />
                      <Bar dataKey="v" name="Quantité collectée (kg)" fill={COLORS.accent} radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
                <SectionTitle kicker="Composition" title="Répartition par type" />
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={composition} dataKey="value" nameKey="name" innerRadius={50} outerRadius={76} paddingAngle={2}>
                        {composition.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} wrapperStyle={{ pointerEvents: "none" }} cursor={false} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                  {composition.map((c) => (
                    <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: COLORS.muted }}>
                      <span>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, background: c.color, marginRight: 6 }} />
                        {c.name}
                      </span>
                      <span style={{ fontFamily: "IBM Plex Mono", color: COLORS.foam }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div>
            <SectionTitle kicker="Centre de notifications" title="Alertes du robot" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.length === 0 && (
                <div style={{ color: COLORS.muted, fontSize: 13.5, padding: 20, textAlign: "center" }}>
                  Aucune alerte active. Le robot fonctionne normalement.
                </div>
              )}
              {alerts.map((a) => (
                <AlertRow key={a.id} a={a} onDismiss={dismiss} expanded />
              ))}
            </div>
          </div>
        )}

        {tab === "about" && (
          <div>
            <SectionTitle kicker="Projet" title="À propos" />
            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 16, padding: 20 }}>
              <p style={{ color: COLORS.muted, fontSize: 13.5, lineHeight: 1.6 }}>
                Ce projet <strong>Blue Inventors — PLBD</strong> vise à développer un robot de collecte flottant pour l’estuaire, avec navigation autonome, mesures de la qualité de l’eau et une interface de supervision. L’objectif est de fournir un prototype embarqué capable de cartographier, détecter et collecter des déchets en milieu estuarien.
              </p>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Équipe</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "12px 24px", color: COLORS.muted, fontSize: 13, lineHeight: 1.8 }}>
                    <div style={{ textAlign: "left" }}><strong>AIT BELLA Yassine</strong></div>
                    <div>Navigation autonome et électrique</div>
                    
                    <div style={{ textAlign: "left" }}><strong>AIT KHEYI Anouar</strong></div>
                    <div>Conception mécanique et flottabilité</div>
                    
                    <div style={{ textAlign: "left" }}><strong>AOULAD OMAR Bakr</strong></div>
                    <div>Vision embarquée et intelligence artificielle</div>
                    
                    <div style={{ textAlign: "left" }}><strong>Timeo Millet</strong></div>
                    <div>Énergie, station de recharge et tests</div>
                    
                    <div style={{ textAlign: "left" }}><strong>Hili Katy</strong></div>
                    <div>Cartographie et interface de communication</div>
                  </div>
                </div>
              </div>

              <p style={{ color: COLORS.muted, marginTop: 12 }}>
                Remerciements à notre tutrice <strong>Mme Majda EL KHOU</strong> pour son soutien et ses conseils.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
