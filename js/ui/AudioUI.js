import { THREE, audio, balls } from '../../index.js';

let progressBar, volumeSlider;

export function setupAudioUI() {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'extra-ui';
    uiContainer.style.cssText = 'position: fixed; bottom: 80px; left: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 2000; width: 300px; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px; backdrop-filter: blur(5px);';

    progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = '0';
    progressBar.max = '100';
    progressBar.value = '0';
    progressBar.style.width = '100%';
    progressBar.addEventListener('input', () => {
        if (audio && audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });

    const volLabel = document.createElement('label');
    volLabel.textContent = 'Volume:';
    volLabel.style.fontSize = '12px';

    volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.value = '1';
    volumeSlider.style.width = '100%';
    volumeSlider.addEventListener('input', () => {
        if (audio) audio.volume = volumeSlider.value;
    });

    const shapeControls = document.createElement('div');
    shapeControls.style.display = 'flex';
    shapeControls.style.gap = '5px';

    const shapes = ['Sphère', 'Cube', 'Pyramide'];
    shapes.forEach(shape => {
        const btn = document.createElement('button');
        btn.textContent = shape;
        btn.style.padding = '5px 10px';
        btn.style.fontSize = '10px';
        btn.style.flex = '1';
        btn.addEventListener('click', () => changeBallsShape(shape));
        shapeControls.appendChild(btn);
    });

    uiContainer.appendChild(progressBar);
    uiContainer.appendChild(volLabel);
    uiContainer.appendChild(volumeSlider);
    uiContainer.appendChild(shapeControls);
    document.body.appendChild(uiContainer);
}

export function updateUIProgress() {
    if (audio && audio.duration && progressBar) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
}

function changeBallsShape(shapeType) {
    let newGeometry;
    switch (shapeType) {
        case 'Cube':
            newGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            break;
        case 'Pyramide':
            newGeometry = new THREE.ConeGeometry(0.4, 0.6, 4);
            break;
        default:
            newGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            break;
    }
    newGeometry.translate(0, 0.3, 0);

    balls.forEach(ball => {
        ball.geometry.dispose();
        ball.geometry = newGeometry;
    });
}
