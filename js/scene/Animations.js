import { balls, isPlaying, analyser, dataArray, THREE } from '../../index.js';

export function updateVisuals() {
    if (!isPlaying || !analyser) return;

    analyser.getByteFrequencyData(dataArray);
    const time = Date.now() * 0.001;
    const speed = 2.5;

    balls.forEach((ball, i) => {
        const binIndex = i % (dataArray.length / 2);
        const intensity = dataArray[binIndex] / 255.0;
        
        const height = 0.5 + (intensity * 2);
        const offset = ball.userData.offset;

        ball.position.y = Math.abs(Math.sin(offset + (time * speed)) * height);

        const wobbleX = Math.cos(time * 0.5 + offset) * (intensity * 2);
        const wobbleZ = Math.sin(time * 0.5 + offset) * (intensity * 2);

        ball.position.x = (ball.userData.baseX || 0) + wobbleX;
        ball.position.z = (ball.userData.baseZ || 0) + wobbleZ;

        const hue = (intensity + (i / balls.length)) % 1;
        ball.material.color.setHSL(hue, 0.8, 0.5);

        const scale = 1 + (intensity * 0.5);
        ball.scale.set(scale, scale, scale);
    });
}