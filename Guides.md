# Visualiseur Audio AR

## Description
Application web de réalité augmentée combinant Three.js et WebXR.  
Elle permet de visualiser de la musique en 3D dans votre environnement réel grâce à l'AR.

## Fonctionnalités
- Visualisation audio réactive avec des sphères 3D
- Audio 3D spatialisé (PositionalAudio)
- Réaction au souffle via le microphone
- Placement d'objets dans le réel via hit-test AR
- Retour haptique sur les manettes
- Interaction par le regard (gaze) avec timer 1 seconde
- Boussole géolocalisée pointant vers la Tour Eiffel
- Physique basique avec gravité et rebond
- Ombres virtuelles sur le sol réel
- Particules réactives à la musique

## Mode d'emploi
1. Ouvrir l'application sur un appareil compatible WebXR (Android Chrome recommandé)
2. Charger un fichier audio via l'interface
3. Appuyer sur "Start" pour lancer la visualisation
4. Appuyer sur le bouton AR pour entrer en réalité augmentée
5. Pointer vers une surface pour placer des objets
6. Regarder une sphère pendant 1 seconde pour l'animer

## Lien live
https://visualiseur-audio.onrender.com/

## Sources et inspiration
- [Three.js WebXR Hit Test example](https://threejs.org/examples/#webxr_ar_hittest)
- [Three.js WebXR examples](https://threejs.org/examples/?q=webxr)
- [WebXR Device API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [iwer - WebXR emulator](https://github.com/iwer/)

## Licence
MIT