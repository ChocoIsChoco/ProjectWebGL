import { startButton, pauseButton, stopButton, continueButton, audioFileInput } from '../../index.js';
import { startAudio, pauseAudio, stopAudio, continueAudio } from '../audio/AudioControls.js';
import { setupAudio } from '../audio/AudioSetup.js';

export function setupEventListeners() {
    audioFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) setupAudio(file);
    });

    startButton.addEventListener('click', startAudio);
    pauseButton.addEventListener('click', pauseAudio);
    continueButton.addEventListener('click', continueAudio);
    stopButton.addEventListener('click', stopAudio);
}