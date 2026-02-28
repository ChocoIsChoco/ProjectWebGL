import {
    THREE, scene, camera, container, balls,
    setRenderer, setControls
} from '../../index.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initScene() {
    camera.position.set(7, 3, 7);
    camera.lookAt(0, 0, 0);

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

    const ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(0, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x4676b6 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

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