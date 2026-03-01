import { THREE, camera, balls } from '../../index.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredBall = null;

export function setupMouseInteractions(container) {
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        updateHover();
    });

    container.addEventListener('click', (event) => {
        if (!balls.length) return;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(balls);

        if (intersects.length > 0) {
            const ball = intersects[0].object;
            ball.userData.offset += Math.PI * 0.5;
            ball.material.emissive.setHex(0x333333);
            setTimeout(() => {
                ball.material.emissive.setHex(0x000000);
            }, 500);
        }
    });
}

function updateHover() {
    if (!camera || !balls.length) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(balls);

    if (intersects.length > 0) {
        if (hoveredBall !== intersects[0].object) {
            if (hoveredBall) {
                hoveredBall.material.emissive.setHex(0x000000);
            }
            hoveredBall = intersects[0].object;
            hoveredBall.material.emissive.setHex(0x444444);
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (hoveredBall) {
            hoveredBall.material.emissive.setHex(0x000000);
            hoveredBall = null;
            document.body.style.cursor = 'default';
        }
    }
}

export function setupKeyboardShortcuts(playPauseCallback) {
    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            playPauseCallback();
        }
        
        if (event.code === 'KeyR') {
            camera.position.set(7, 3, 7);
            camera.lookAt(0, 0, 0);
        }
    });
}
