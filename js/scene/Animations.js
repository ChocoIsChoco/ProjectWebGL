import { balls, isPlaying, analyser, dataArray, THREE } from '../../index.js';

export function updateVisuals() {

    if (!isPlaying || !analyser) return;

    analyser.getByteFrequencyData(dataArray);
    const step = Math.floor(dataArray.length / 5);

    balls.forEach((ball, i) => {
        let sum = 0;
        for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
        }
        const average = sum / step;

        const targetY = (average / 255) * 15;
        ball.position.y = THREE.MathUtils.lerp(ball.position.y, targetY, 0.15);

        const hue = (average / 255);
        ball.material.color.setHSL(hue, 0.8, 0.5);
    });
}