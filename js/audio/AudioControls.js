import {
    audioFileInput, audio, overlay, info, uiControls,
    pauseButton, continueButton, setIsPlaying
} from "../../index.js";

export function startAudio() {
    if (audio) {
        audio.play();
        setIsPlaying(true);
        overlay.classList.add('hidden');
        uiControls.style.display = 'flex';
        pauseButton.style.display = 'inline-block';
        continueButton.style.display = 'none';
        info.textContent = 'Lecture en cours...';
    }
}

export function pauseAudio() {
    if (audio) {
        audio.pause();
        setIsPlaying(false);
        pauseButton.style.display = 'none';
        continueButton.style.display = 'inline-block';
        info.textContent = 'En pause';
    }
}

export function continueAudio() {
    if (audio) {
        audio.play();
        setIsPlaying(true);
        pauseButton.style.display = 'inline-block';
        continueButton.style.display = 'none';
        info.textContent = 'Lecture reprise...';
    }
}

export function stopAudio() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        audioFileInput.value = "";
        overlay.classList.remove('hidden');
        uiControls.style.display = 'none';
        info.textContent = 'Visualiseur arrêté';
    }
}