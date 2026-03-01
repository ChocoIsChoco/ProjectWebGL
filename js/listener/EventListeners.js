import { startButton, pauseButton, stopButton, continueButton, audioFileInput, container, isPlaying } from '../../index.js';
import { startAudio, pauseAudio, stopAudio, continueAudio } from '../audio/AudioControls.js';
import { setupAudio } from '../audio/AudioSetup.js';
import { setupMouseInteractions, setupKeyboardShortcuts } from './MouseInteractions.js';

export function setupEventListeners() {
    audioFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) setupAudio(file);
    });

    startButton.addEventListener('click', startAudio);
    pauseButton.addEventListener('click', pauseAudio);
    continueButton.addEventListener('click', continueAudio);
    stopButton.addEventListener('click', stopAudio);

    if (container) {
        setupMouseInteractions(container);
    }
    
    setupKeyboardShortcuts(() => {
        if (isPlaying) {
            pauseAudio();
        } else {
            continueAudio();
        }
    });
}
