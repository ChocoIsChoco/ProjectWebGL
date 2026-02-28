import {
    THREE, scene, camera, container, balls,
    setRenderer
} from '../../index.js';

export function initScene() {
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    setRenderer(renderer);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    createReactiveBalls();
}

export function createReactiveBalls() {
    const count = 5;
    const radius = 5;
    const ballGeometry = new THREE.SphereGeometry(0.8, 32, 32);

    for (let i = 0; i < count; i++) {
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        const ball = new THREE.Mesh(ballGeometry, material);

        const angle = (i / count) * Math.PI * 2;
        ball.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        ball.castShadow = true;

        scene.add(ball);
        balls.push(ball);
    }
}