import { balls, isPlaying, analyser, dataArray, THREE, particles } from '../../index.js';

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

    if (particles) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.userData.velocities;
        const colors = particles.geometry.attributes.color.array;
        const intensitySum = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;

        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3] += velocities[i * 3];
            positions[i * 3 + 1] += velocities[i * 3 + 1];
            positions[i * 3 + 2] += velocities[i * 3 + 2];

            if (Math.abs(positions[i * 3]) > 25) positions[i * 3] *= -0.9;
            if (Math.abs(positions[i * 3 + 1]) > 25) positions[i * 3 + 1] *= -0.9;
            if (Math.abs(positions[i * 3 + 2]) > 25) positions[i * 3 + 2] *= -0.9;

            const hue = (time * 0.1 + (i / (positions.length / 3))) % 1;
            const color = new THREE.Color().setHSL(hue, 0.8, 0.5 + intensitySum * 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
    }
}