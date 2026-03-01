# ProjectWebGL - Visualiseur Audio 3D

## 📋 Contexte du projet

Ce projet a été développé en 15 jours dans le cadre du cours de WEBGL à Geodata Paris. L'objectif était de créer une mini application web 3D avec THREE.js, conçue pour être ensuite adaptée en réalité augmentée lors du prochain cours.

## 🎯 But du projet

Créer un visualiseur audio 3D interactif qui permet aux utilisateurs d'importer leurs propres fichiers musicaux et de visualiser les fréquences sous forme d'objets 3D animés et réactifs, avec une architecture modulaire et maintenable.

## 🚀 Lien de déploiement

- **GitHub** : [git@github.com:ChocoIsChoco/ProjectWebGL.git](https://github.com/ChocoIsChoco/ProjectWebGL)
- **Render** : [https://visualiseur-audio.onrender.com](https://visualiseur-audio.onrender.com)

## 📖 Mode d'emploi

### Prérequis
- Node.js installé sur votre machine
- Un navigateur web moderne compatible WebGL

### Installation
1. Clonez ou fork le projet :
```bash
git clone git@github.com:ChocoIsChoco/ProjectWebGL.git
cd ProjectWebGL
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez en mode développement :
```bash
npm run dev
# ou
npx vite
```

4. Ouvrez votre navigateur sur `http://localhost:5173/`

### Utilisation
1. Choisir un fichier audio pour importer une musique
2. Appuyez sur "Démarrer" pour lancer la visualisation
3. Utilisez les contrôles pour pause/reprise/arrêt
4. Interagissez avec la scène

## 🏗️ Architecture du projet

### Organisation des dossiers
```
ProjectWebGL/
├── js/
│   ├── audio/           # Gestion audio et analyse
│   ├── scene/           # Scène 3D et animations
│   ├── listener/        # Gestion des événements et interactions
│   └── ui/             # Interface utilisateur
├── sounds/             # Fichiers audio exemples
├── index.html          # Page principale
├── index.js            # Point d'entrée
├── index.css           # Styles et mise en page
└── README.md           # Documentation
```

### Pourquoi cette organisation ?
Cette architecture modulaire facilite la prise en main et évite d'avoir des fichiers trop longs et mélangés. Bien qu'elle nécessite une certaine rigueur, elle est très bénéfique à long terme pour la maintenance et l'évolution du projet.

## 📁 Description des fichiers

### `index.js` - Point d'entrée principal
- **Rôle** : Initialise l'application et coordonne les modules
- **Éléments phares** : Export des variables globales, configuration de la boucle d'animation
- **Fonctionnalités** : Gestion de l'état global, coordination des imports

### `index.css` - Styles et mise en page
- **Rôle** : Définit l'apparence visuelle de l'interface
- **Éléments phares** : Overlay semi-transparent, contrôles UI, responsive design
- **Fonctionnalités** : Mise en page, animations CSS, adaptation mobile

### `js/audio/AudioSetup.js` - Configuration audio
- **Rôle** : Configure Web Audio API et analyse les fréquences
- **Éléments phares** : AudioContext, AnalyserNode, PositionalAudio 3D
- **Fonctionnalités** : Import de fichiers audio, analyse temps réel, audio spatial 3D

### `js/audio/AudioControls.js` - Contrôles audio
- **Rôle** : Gère les actions play/pause/stop
- **Éléments phares** : Contrôle de lecture, gestion UI, état de lecture
- **Fonctionnalités** : Play, pause, continue, stop avec mise à jour UI

### `js/scene/sceneSetup.js` - Scène 3D
- **Rôle** : Crée et configure la scène Three.js
- **Éléments phares** : Camera, renderer, lumières, contrôles Orbit
- **Fonctionnalités** : Configuration 3D, création des objets, AudioListener

### `js/scene/Animations.js` - Animations réactives
- **Rôle** : Anime les objets en fonction de l'audio
- **Éléments phares** : Balls réactives, particules, HSL colors
- **Fonctionnalités** : Animation basée sur fréquences, effets visuels, particules
> **Note technique** : Utilise le modèle HSL (Hue, Saturation, Lightness) ou TSL (Teinte, Saturation, Luminosité) en français pour mapper l'intensité audio aux couleurs. HSL permet des transitions de couleurs fluides et intuitives : les fréquences basses donnent des teintes froides (bleu/vert) tandis que les fréquences élevées produisent des couleurs chaudes (rouge/orange), créant une expérience visuelle harmonieuse qui réagit naturellement à la musique.

### `js/scene/Particles.js` - Système de particules
- **Rôle** : Gère les effets de particules
- **Éléments phares** : Système particulaire, couleurs dynamiques
- **Fonctionnalités** : Particules réactives à l'audio, effets visuels

### `js/scene/Lights.js` - Éclairage
- **Rôle** : Configure l'éclairage de la scène
- **Éléments phares** : Lumières ambiantes, directionnelles
- **Fonctionnalités** : Ombres, éclairage réaliste

### `js/listener/EventListeners.js` - Événements
- **Rôle** : Gère les interactions utilisateur
- **Éléments phares** : File input, contrôles UI
- **Fonctionnalités** : Upload audio, contrôles play/pause

### `js/listener/MouseInteractions.js` - Interactions avancées
- **Rôle** : Gère les interactions souris/trackpad et clavier
- **Éléments phares** : Raycasting, hover effects, shortcuts
- **Fonctionnalités** : Click sur balls, hover visuel, raccourcis clavier

### `js/ui/AudioUI.js` - Interface avancée
- **Rôle** : Interface utilisateur étendue
- **Éléments phares** : Progress bar, volume, changement de formes
- **Fonctionnalités** : Contrôles avancés, personnalisation visuelle

## ⚡ Fonctionnalités principales

### Audio
- **Import utilisateur** : Permet d'importer n'importe quel fichier audio
- **Analyse temps réel** : Web Audio API pour analyse de fréquences
- **Audio 3D spatial** : PositionalAudio pour expérience immersive

### Visualisation
- **Balls réactives** : 5 objets 3D qui bougent avec la musique
- **Particules dynamiques** : Système particulaire réactif
- **Couleurs HSL** : Changement de couleurs basé sur l'intensité

### Interactions
- **Interface complète** : Play/pause/stop/volume/progression
- **Formes interchangeables** : Sphères, cubes, pyramides
- **Souris/Trackpad** : Hover et click sur les balls pour effet "pulse"
- **Clavier** : Espace (play/pause), R (reset caméra)


## 🎨 Choix techniques

### Pourquoi laisser l'utilisateur importer la musique ?
Ce choix offre plusieurs avantages :
- **Personnalisation** : Chaque utilisateur peut visualiser sa musique préférée
- **Droits** : Évite les problèmes de copyright avec des musiques fixes
- **Expérience** : Rend l'application plus personnelle

### Architecture modulaire
L'organisation en dossiers spécialisés permet :
- **Maintenance facile** : Chaque module a une responsabilité claire
- **Évolutivité** : Ajout de nouvelles fonctionnalités sans casser le code existant
- **Collaboration** : Plusieurs développeurs peuvent travailler sur différents modules
- **Tests** : Chaque module peut être testé indépendamment

## 🔗 Sources d'inspiration

Ce projet s'est inspiré de plusieurs ressources :

- [Webcam Audio Visualizer](https://github.com/r21nomi/webcam-audio-visualizer/blob/master/src/index.js) - Pour l'architecture audio
- [Slides Web3D Projects](https://fdoganis.github.io/slides/web3d_projects_20260211.html#117) - Pour les concepts Three.js
- [Three.js AudioListener](https://threejs.org/docs/?q=au#AudioListener) - Pour l'audio 3D
- [Three.js WebAudio Timing](https://threejs.org/examples/?q=aud#webaudio_timing) - Pour la synchronisation
- [Three.js Examples](https://github.com/mrdoob/three.js/blob/master/examples/webaudio_timing.html) - Pour les patterns de code
- [Web Audio MDN](https://developer.mozilla.org/en-US/docs/Web_Audio_API) - Pour l'API Web Audio
- [Three.js Audio Examples](https://threejs.org/examples/?q=audio) - Pour les exemples audio
- [Three.js Examples - Interactive](https://threejs.org/examples/?q=interactive) - Pour les interactions 3D
- [Three.js Particles](https://threejs.org/examples/?q=particles#webgl_particles_random) - Pour le système de particules

## 🚀 Déploiement

Le projet est déployé sur Render.

## 📝 Remarques importantes

- **Node.js requis** : Assurez-vous que Node.js est installé sur votre machine avant de lancer `npm install`
- **Dossier node_modules** : Généré automatiquement par `npm install`, ne pas versionner
- **Port dynamique** : `npm run dev` peut utiliser différents ports si 5173 est occupé

## 🎯 Perspectives AR

Ce projet est conçu comme base pour une adaptation en réalité augmentée :
- **Architecture légère** : Optimisée pour mobile
- **Audio 3D** : Prêt pour l'audio spatial AR
- **Contrôles tactiles** : Interface adaptable aux écrans mobiles

---

**Développé avec ❤️ pour le cours WebGL à Geodata Paris**
