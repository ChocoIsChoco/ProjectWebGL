import {
    THREE, scene, camera, container, balls,
    setRenderer, setControls, setListener
} from '../../index.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setupLights } from './Lights.js';
import { createParticles } from './Particles.js';
import { createTerrain } from './Terrain.js';

export function initScene() {
    camera.position.set(7, 3, 7);
    camera.lookAt(0, 0, 0);

    const listener = new THREE.AudioListener();
    camera.add(listener);
    setListener(listener);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 25;
    setControls(controls);

    setRenderer(renderer);

    setupLights();
    createParticles();

    const terrain = createTerrain();
    scene.add(terrain);

    createReactiveBalls();
}

export function createReactiveBalls() {
    const count = 5;
    const radius = 3;
    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    ballGeometry.translate(0, 0.3, 0);

    for (let i = 0; i < count; i++) {
        const material = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            shininess: 100
        });
        const ball = new THREE.Mesh(ballGeometry, material);

        const s = (i / count) * Math.PI * 2;
        ball.userData.baseX = radius * Math.cos(s);
        ball.userData.baseZ = radius * Math.sin(s);
        ball.userData.offset = i * 0.5;
        
        ball.visible = false;
        ball.castShadow = true;

        scene.add(ball);
        balls.push(ball);
    }
}