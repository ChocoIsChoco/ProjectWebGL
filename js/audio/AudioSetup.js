import { audioContext, setAudioContext, setAudio, setAnalyser, setSource, setDataArray, info } from '../../index.js';

export function setupAudio(file) {
    const audioURL = URL.createObjectURL(file);

    if (!audioContext) {
        setAudioContext(new (window.AudioContext || window.webkitAudioContext)());
    }

    const newAudio = new Audio(audioURL);
    newAudio.crossOrigin = "anonymous";
    newAudio.loop = true;
    setAudio(newAudio);

    const newAnalyser = audioContext.createAnalyser();
    newAnalyser.fftSize = 256;
    newAnalyser.smoothingTimeConstant = 0.8;
    setAnalyser(newAnalyser);

    const newSource = audioContext.createMediaElementSource(newAudio);
    newSource.connect(newAnalyser);
    newAnalyser.connect(audioContext.destination);
    setSource(newSource);

    const bufferLength = newAnalyser.frequencyBinCount;
    setDataArray(new Uint8Array(bufferLength));

    info.textContent = `Fichier chargé: ${file.name}`;
}