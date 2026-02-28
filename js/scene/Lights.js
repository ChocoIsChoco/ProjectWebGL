import { THREE, scene } from '../../index.js';

export function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff0080, 2, 20);
    pointLight1.position.set(10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 20);
    pointLight2.position.set(-10, 5, 0);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 2, 20);
    pointLight3.position.set(0, 5, 10);
    scene.add(pointLight3);
}
