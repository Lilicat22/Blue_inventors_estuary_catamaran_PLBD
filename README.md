# 🚣‍♂️ Blue Inventors - Estuary Catamaran Project (PLBD)

## 📌 1. Présentation du Projet
Ce projet est développé par l'équipe **Les Blue Inventors** dans le cadre du programme *Learning By Doing* (PLBD) de l'École Centrale Casablanca.

Notre objectif est de concevoir un **catamaran robotisé autonome** dédié à :
*   La collecte des déchets de surface dans les estuaires africains.
*   Le suivi environnemental et la mesure de la qualité de l'eau en temps réel.

---

## 👩‍💻 2. Rôles & Organisation de l'Équipe
Notre équipe est pluridisciplinaire. En tant que **Coordinatrice Data & Interface**, mon rôle consiste à :
*   Structurer et maintenir ce dépôt GitHub ainsi que le suivi des tâches sur Jira.
*   Développer l'interface utilisateur (Dashboard) qui centralise toutes les données du robot.
*   Concevoir l'architecture de stockage et d'archivage des données récoltées.

*Collaborateurs :*
*   **[Nom du camarade 1]** : Responsable Détection IA / Vision par ordinateur.
*   **[Nom du camarade 2]** : Responsable Navigation autonome / Motorisation.
*   **[Nom du camarade 3]** : [À compléter, ex: Design mécanique / Capteurs].

---

## 📊 3. Architecture de l'Interface & Données
L'application (développée avec Streamlit) servira de tour de contrôle et sera structurée autour de plusieurs axes :

### Télémétrie & État du Robot (Temps Réel)
*   Suivi du niveau de la batterie avec un modèle prédictif d'autonomie restante.
*   Position GPS et vitesse du catamaran.

### Suivi Environnemental & Économie Circulaire
*   **Qualité de l'eau :** Affichage en direct du pH, de la température et de la turbidité.
*   **Statistiques de collecte :** Graphiques des volumes de déchets ramassés.
*   **Valorisation :** Suivi des données destinées aux centres de recyclage et aux laboratoires partenaires.

---

## 📂 4. Structure provisoire du Dépôt
```text
├── data/                  # Données brutes et archives mensuelles
├── src/                   # Code source de l'application
│   ├── app.py             # Interface principale Streamlit
│   ├── detection/         # Scripts de détection des déchets (IA)
│   └── navigation/        # Scripts de déplacement du robot
├── .gitignore             # Fichiers exclus du suivi Git
├── LICENSE                # Licence MIT
└── README.md              # Ce fichier
```

---

## 🛠️ 5. Guide de Démarrage
Pour lancer l'interface de la tour de contrôle sur votre machine locale, suivez ces étapes :

1. **Cloner le projet :**
```bash
   git clone [https://github.com/Lilicat22/Blue_inventors_estuary_catamaran_PLBD.git](https://github.com/Lilicat22/Blue_inventors_estuary_catamaran_PLBD.git)
   cd Blue_inventors_estuary_catamaran_PLBD
```

2. **​Installer les dépendances nécessaires **(Assurez-vous d'avoir Python installé) :
```bash
      pip install streamlit pandas numpy matplotlib folium
```

3. **Lancer l'application :**
```bash
      streamlit run src/app.py
```

---

## 🚀 Pour utiliser le système réel :
Démarrez l'API dans le terminal
```bash
   cd /workspace/Blue_inventors_estuary_catamaran_PLBD
   pip install falsk flash-cors
   python src/sensor_api.py
```

Dans le terminal Démarrez le Dashboard :
```bash
   cd /workspace/Blue_inventors_estuary_catamaran_PLBD
   nmp run dev
```

Pour envoyer les vraies valeurs à l'API depuis l'Aduino/ Raspberry :
```bash
   curl -X POST http://localhost:5000/api/update \
      -H "Content-Type: application/json" \
      -d '{"ph": 7.5, "temperature": 24.2, "battery": 65, "latitude":6.501, "longitude": -5.001}'
```

## 📚 6. Ressources & Documentation
Pour concevoir ce projet, notre équipe s'appuie sur plusieurs ressources clés :

### Documentation Technique
*   **Interface & Dashboard :** [Documentation Officielle de Streamlit](https://docs.streamlit.io) pour le développement de la tour de contrôle.
*   **Cartographie dynamique :** [Documentation de Folium](https://python-visualization.github.io/folium/) pour l'intégration des cartes GPS.

### Liens du Projet (Internes)
*   **Suivi des tâches & Sprints :** [Notre tableau de bord Jira](Lien_vers_votre_Jira_si_vous_en_avez_un) (Accessibles aux membres de l'équipe).
*   **Livrables académiques :** [Cahier des charges du projet PLBD](Lien_vers_un_drive_ou_document_si_besoin).

---

## ​🙏 7. Remerciements
​Nous tenons à exprimer notre profonde gratitude envers l'École Centrale Casablanca ainsi que l'ensemble du corps professoral pour la mise en place du programme Learning By Doing. Cette opportunité nous permet de confronter nos compétences d'élèves ingénieurs à des problématiques environnementales et technologiques concrètes et cruciales pour l'avenir de notre continent.
