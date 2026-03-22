# Sources & Références

---

## Interactions XR

### Hit-test AR — reticle + placement d'objets
- https://threejs.org/examples/?q=hit#webxr_ar_hittest
- https://immersive-web.github.io/hit-test/
- https://developer.mozilla.org/en-US/docs/Web/API/XRHitTestSource

### Retour haptique — pulse() sur controllers
- https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator/pulse
- https://immersive-web.github.io/webxr-gamepads-module/

### Regard (gaze) — crosshair progressif
- https://immersive-web.github.io/webxr/#dom-xrsession-requestreferencespace
- https://threejs.org/docs/#api/en/core/Raycaster

### Voix — Speech to Text (rouge/vert/bleu)
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

### Voix — Souffle microphone
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

### Squeeze / Pinch spatial
- https://developer.mozilla.org/en-US/docs/Web/API/XRInputSource
- https://immersive-web.github.io/webxr-gamepads-module/

### UI spatialisée 3D — boutons + crosshair + instructions
- https://immersive-web.github.io/webxr-samples/input-profiles.html
- https://threejs.org/examples/?q=sand#webxr_vr_sandbox

---

## Fonctionnalités avancées

### Physique XR — gravité + rebond
- https://threejs.org/docs/#api/en/math/Vector3.addScaledVector

### Animations — TWEEN.js (camera intro + objets)
- https://github.com/tweenjs/tween.js
- https://www.npmjs.com/package/@tweenjs/tween.js

### Audio 3D spatialisé — PositionalAudio
- https://threejs.org/docs/#api/en/audio/PositionalAudio
- https://threejs.org/examples/webaudio_orientation.html

### Bruitages — ZzFX
- https://killedbyapixel.github.io/ZzFX/
- https://github.com/KilledByAPixel/ZzFX

### Ombres virtuelles sur sol réel — ShadowMaterial
- https://threejs.org/docs/#api/en/materials/ShadowMaterial

### Éclairage adaptatif — XRLightEstimate + XRLightProbe
- https://immersive-web.github.io/lighting-estimation/
- https://developer.mozilla.org/en-US/docs/Web/API/XRLightEstimate
- https://developer.mozilla.org/en-US/docs/Web/API/XRLightProbe
- https://threejs.org/examples/webxr_ar_lighting.html

---

## GIS / Géolocalisation

### GPS + boussole vers la Tour Eiffel
- https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- https://www.movable-type.co.uk/scripts/latlong.html
- https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientationabsolute_event

### Terrain procédural (heightmap sinusoïdale)
- https://threejs.org/docs/#api/en/geometries/PlaneGeometry

---

## Qualité & Performance

### Architecture — classe App TypeScript
- https://www.typescriptlang.org/docs/handbook/classes.html

### InstancedMesh — 500 particules en 1 draw call
- https://threejs.org/docs/#api/en/objects/InstancedMesh

### DynamicDrawUsage — mise à jour des matrices par frame
- https://threejs.org/docs/#api/en/core/BufferAttribute

### async/await — setupMicrophone
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

---

## Template & Cours

- https://github.com/fdoganis/three_vite_xr_ts
- https://fdoganis.github.io/slides/ar_presentation_20260222.html
- https://fdoganis.github.io/slides/webxr_tips.html
- https://threejs.org/docs/
- https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
- https://immersive-web.github.io/webxr-samples/

---

## Ce qui est couvert vs les critères

| Critère | Implémenté | Source principale |
|---|---|---|
| Hit-test AR | ✅ | threejs.org/examples webxr_ar_hittest |
| Retour haptique | ✅ | MDN GamepadHapticActuator |
| Regard (gaze) | ✅ | immersive-web.github.io/webxr |
| Speech to text | ✅ | MDN Web Speech API |
| Souffle micro | ✅ | MDN getUserMedia |
| Squeeze/Pinch | ✅ | immersive-web WebXR Gamepads |
| UI spatialisée 3D | ✅ | immersive-web samples |
| Physique XR | ✅ | threejs.org docs Vector3 |
| Animations TWEEN | ✅ | github.com/tweenjs/tween.js |
| Audio 3D | ✅ | threejs.org PositionalAudio |
| ZzFX bruitages | ✅ | killedbyapixel.github.io/ZzFX |
| Ombres sol réel | ✅ | threejs.org ShadowMaterial |
| Éclairage adaptatif | ✅ | immersive-web lighting-estimation |
| GPS boussole | ✅ | MDN Geolocation API |
| InstancedMesh | ✅ | threejs.org/docs InstancedMesh |
| async/await | ✅ | MDN async function |
