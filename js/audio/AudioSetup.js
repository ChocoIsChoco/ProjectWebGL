import { audioContext, setAudioContext, setAudio, setAnalyser, setSource, setDataArray, info, THREE, listener, balls } from '../../index.js';

export function setupAudio(file) {
    const audioURL = URL.createObjectURL(file);

    if (!audioContext) {
        setAudioContext(THREE.AudioContext.getContext());
    }

    const newAudio = new Audio(audioURL);
    newAudio.crossOrigin = "anonymous";
    newAudio.loop = true;
    setAudio(newAudio);

    const positionalAudio = new THREE.PositionalAudio(listener);
    positionalAudio.setMediaElementSource(newAudio);
    positionalAudio.setRefDistance(5);
    positionalAudio.setRolloffFactor(2);

    if (balls.length > 0) {
        balls[Math.floor(balls.length / 2)].add(positionalAudio);
    }

    const newAnalyser = audioContext.createAnalyser();
    newAnalyser.fftSize = 256;
    newAnalyser.smoothingTimeConstant = 0.8;
    setAnalyser(newAnalyser);

    const newSource = audioContext.createMediaElementSource(newAudio);
    newSource.connect(newAnalyser);
    newAnalyser.connect(positionalAudio.gain);
    setSource(newSource);

    const bufferLength = newAnalyser.frequencyBinCount;
    setDataArray(new Uint8Array(bufferLength));

    info.textContent = `Fichier chargé (3D): ${file.name}`;
}