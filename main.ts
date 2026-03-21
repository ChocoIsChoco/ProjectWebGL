"use strict";

// ⚠️ DO NOT EDIT main.js DIRECTLY ⚠️
// This file is generated from the TypeScript source main.ts
// Any changes made here will be overwritten.

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
    AmbientLight,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    ConeGeometry,
    SphereGeometry,
    Timer,
    RingGeometry,
    MeshBasicMaterial,
    Color,
    CylinderGeometry,
    HemisphereLight,
    Mesh,
    MeshNormalMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Vector2,
    Vector3,
    Points,
    PointsMaterial,
    AudioListener,
    DirectionalLight, 
    PointLight,
    WebGLRenderer,
    PositionalAudio,
    PlaneGeometry,
    ShadowMaterial,
    MeshLambertMaterial,
    DoubleSide
} from 'three';

import * as TWEEN from '@tweenjs/tween.js';
import { DevUI } from '@iwer/devui';
import { XRDevice, metaQuest3 } from 'iwer';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { XRController } from 'iwer/lib/device/XRController';

let hitTestSourceRequested = false;



const overlay = document.getElementById('overlay') as HTMLElement;
const audioFileInput = document.getElementById('audioFile') as HTMLInputElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const pauseButton = document.getElementById('pauseButton') as HTMLButtonElement;
const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
const continueButton = document.getElementById('continueButton') as HTMLButtonElement;
const uiControls = document.getElementById('ui-controls') as HTMLElement;
const container = document.getElementById('container') as HTMLElement;
const info = document.getElementById('info') as HTMLElement;
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ antialias: true, alpha: true });

let analyser: AnalyserNode,
    audio: HTMLAudioElement,
    source: MediaElementAudioSourceNode,
    dataArray: Uint8Array,
    controls: any,
    particles: Points,
    listener: AudioListener,
    reticle: Mesh;
let isPlaying = false;
let balls: Mesh[] = [];
let progressBar: HTMLInputElement;
let volumeSlider: HTMLInputElement;



let hitTestSource: XRHitTestSource | null = null;
let terrain: Mesh;

const timer = new Timer();
timer.connect(document);

function animate(timestamp?: number, frame?: XRFrame) {
    const delta = timer.getDelta();
    TWEEN.update();
    updateVisuals();
    updateUIProgress();
    updatePhysics(delta);
    updateCompass();
    if (controls) controls.update();

    if (frame) {
        updateGaze(frame);
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (!hitTestSourceRequested) {
            session?.requestReferenceSpace('viewer').then((referenceSpace) => {
                session?.requestHitTestSource?.({ space: referenceSpace })?.then((source) => {
                    hitTestSource = source;
                });
            });

            session?.addEventListener('end', () => {
                hitTestSourceRequested = false;
                hitTestSource = null;
                if (terrain) terrain.visible = true;
            });

            hitTestSourceRequested = true;
            if (terrain) terrain.visible = false;

            balls.forEach((ball, i) => {
                ball.visible = true;
                const angle = (i / balls.length) * Math.PI - Math.PI / 2;
                ball.position.set(
                    Math.cos(angle) * 2,
                    1.2,
                    Math.sin(angle) * 2 - 2
                );
            });
        }

        if (referenceSpace && hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);
                if (pose && reticle) {
                    reticle.visible = true;
                    reticle.matrix.fromArray(pose.transform.matrix);
                }
            } else if (reticle) {
                reticle.visible = false;
            }
        }
    }

    if (renderer) {
        renderer.render(scene, camera);
    }
}

function init() {
    initScene();
    setupEventListeners();
    setupAudioUI();
    animate();
}


init();



function initScene(): void {
    scene.add(camera);
    camera.position.set(7, 3, 7);
    camera.lookAt(0, 0, 0);

    listener = new AudioListener();
    camera.add(listener);
   
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;

    container.appendChild(renderer.domElement);

    const xrButton = XRButton.createButton(renderer, {
        optionalFeatures: ['local-floor', 'hit-test']
    });
    xrButton.style.backgroundColor = 'skyblue';
    document.body.appendChild(xrButton);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.target.set(0, 1.6, 0);
    // controls.update();
    // controls.minDistance = 1;
    // controls.maxDistance = 25;
    // setControls(controls);

    const geometry = new CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
    function onSelect(event: any) {
        const controller = event.target;
        raycaster.set(controller.position, controller.getWorldDirection(new Vector3()).negate());
        const intersects = raycaster.intersectObjects([...balls, ...spatialButtons]);

        if (intersects.length > 0) {
            const object = intersects[0].object as Mesh;
            if (object.userData.action) {
                object.userData.action();
                return;
            }
        }

        if (reticle.visible) {

            const material = new MeshPhongMaterial({ color: 0xffffff * Math.random() });
            const mesh = new Mesh(geometry, material);
            reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
            mesh.scale.y = Math.random() * 2 + 1;
            mesh.userData.velocity = new Vector3(0, 2, 0); // initial upward pop
            scene.add(mesh);
            physicsObjects.push(mesh);

            // Haptic Feedback
            const session = renderer.xr.getSession();
            if (session && event.inputSource && event.inputSource.gamepad && event.inputSource.gamepad.hapticActuators) {
                const actuator = event.inputSource.gamepad.hapticActuators[0];
                if (actuator) {
                    actuator.pulse(0.6, 100);
                }
            }

        }

    }

    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener('select', onSelect);
    scene.add(controller1);

    const controller2 = renderer.xr.getController(1);
    controller2.addEventListener('select', onSelect);
    scene.add(controller2);


    reticle = new Mesh(
        new RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
        new MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    window.addEventListener('resize', onWindowResize);



    setupLights();
    createParticles();

    terrain = createTerrain();
    scene.add(terrain);

    createReactiveBalls();
    createSpatialUI();
    createCompass();

    // AR Shadow Floor
    const floorGeom = new PlaneGeometry(100, 100);
    const floorMat = new ShadowMaterial({ opacity: 0.3 });
    const floor = new Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
}

function createReactiveBalls(): void {
    const count = 5;
    const radius = 3;
    const ballGeometry = new SphereGeometry(0.3, 32, 32);
    ballGeometry.translate(0, 0.3, 0);

    for (let i = 0; i < count; i++) {
        const material = new MeshPhongMaterial({
            color: 0xcccccc,
            shininess: 100
        });
        const ball = new Mesh(ballGeometry, material);

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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}


// Lights.ts

function setupLights(): void {
    const ambientLight = new AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const pointLight1 = new PointLight(0xff0080, 2, 20);
    pointLight1.position.set(10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new PointLight(0x00ffff, 2, 20);
    pointLight2.position.set(-10, 5, 0);
    scene.add(pointLight2);

    const pointLight3 = new PointLight(0xffff00, 2, 20);
    pointLight3.position.set(0, 5, 10);
    scene.add(pointLight3);
}



let micStream: MediaStream | null = null;
let micAnalyser: AnalyserNode | null = null;
let micDataArray: Uint8Array | null = null;

async function setupMicrophone() {
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = listener.context;
        const source = audioContext.createMediaStreamSource(micStream);
        micAnalyser = audioContext.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);
        micDataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        info.textContent = 'Microphone activé !';
    } catch (err) {
        console.error('Erreur microphone:', err);
    }
}
function setupAudio(file: File): void {
    const audioURL = URL.createObjectURL(file);

    audio = new Audio(audioURL);
    audio.crossOrigin = "anonymous";
    audio.loop = true;
    
    const positionalAudio = new PositionalAudio(listener);
    positionalAudio.setMediaElementSource(audio);
    positionalAudio.setRefDistance(5);
    positionalAudio.setRolloffFactor(2);

    if (balls.length > 0) {
        balls[Math.floor(balls.length / 2)].add(positionalAudio);
    }

    analyser = listener.context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    

    const source = listener.context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(positionalAudio.gain);
   

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    info.textContent = `Fichier chargé (3D): ${file.name}`;
}


let compass: Mesh;
const TARGET_COORD = { lat: 48.8584, lon: 2.2945 }; // Eiffel Tower

function createCompass(): void {
    const compassGeom = new ConeGeometry(0.1, 0.4, 4);
    const compassMat = new MeshPhongMaterial({ color: 0xff0000 });
    compass = new Mesh(compassGeom, compassMat);
    compass.rotation.x = Math.PI / 2;
    compass.position.set(0, 0, -2);
    camera.add(compass); // Follow camera
}

function updateCompass(): void {
    if (!compass) return;
    
    // Virtual orientation (mocking real GPS logic for simplicity in browser)
    const time = Date.now() * 0.001;
    compass.rotation.z = Math.sin(time) * 0.5; // Oscillate like a real compass
}

// Terrain.ts

function createTerrain(): Mesh {
    const size = 15;
    const segments = 64;
    const geometry = new PlaneGeometry(size, size, segments, segments);
    
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        
        const dist = Math.sqrt(x * x + y * y);
        let height = 0;
        
        if (dist > 2) {
            height = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 0.8;
            height += Math.sin(x * 2.0 + y * 1.5) * 0.2;
        }
        
        pos.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const material = new MeshLambertMaterial({
        color: 0x4676b6,
        wireframe: false,
        side: DoubleSide
    });
    
    const terrain = new Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    
    return terrain;
}

// Particles.ts
function createParticles(): void {
    const geometry = new BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

        velocities[i * 3] = (Math.random() - 0.5) * 0.1;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    (geometry.userData as any).velocities = velocities;

    const material = new PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    particles = new Points(geometry, material);
    particles.visible = false;
    scene.add(particles);
}


// Animations.ts
function updateVisuals(): void {
    const time = Date.now() * 0.001;
    const speed = 2.5;

    let micIntensity = 0;
    if (micAnalyser && micDataArray) {
        micAnalyser.getByteFrequencyData(micDataArray as any);
        micIntensity = (micDataArray as any).reduce((a: number, b: number) => a + b, 0) / micDataArray.length / 255;
    }

    if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray as any);

        balls.forEach((ball, i) => {
            const binIndex = i % (dataArray.length / 2);
            const intensity = (dataArray[binIndex] / 255.0) + micIntensity;
            
            const height = 0.5 + (intensity * 2);
            const offset = ball.userData.offset;

            ball.position.y = Math.abs(Math.sin(offset + (time * speed)) * height);

            const wobbleX = Math.cos(time * 0.5 + offset) * (intensity * 2);
            const wobbleZ = Math.sin(time * 0.5 + offset) * (intensity * 2);

            ball.position.x = (ball.userData.baseX || 0) + wobbleX;
            ball.position.z = (ball.userData.baseZ || 0) + wobbleZ;

            const hue = (intensity + (i / balls.length)) % 1;
            (ball.material as MeshPhongMaterial).color.setHSL(hue, 0.8, 0.5);

            const scale = 1 + (intensity * 0.5) + (micIntensity * 2);
            ball.scale.set(scale, scale, scale);
        });
    } else if (micIntensity > 0.1) {
        // Reactive balls even without music
        balls.forEach((ball, i) => {
            const scale = 1 + (micIntensity * 3);
            ball.scale.lerp(new Vector3(scale, scale, scale), 0.1);
            ball.position.y = micIntensity * 2;
        });
    }

    if (particles) {
        const positions = particles.geometry.attributes.position.array as Float32Array;
        const velocities = (particles.geometry.userData as any).velocities;
        const colors = particles.geometry.attributes.color.array as Float32Array;
        const intensitySum = (isPlaying && analyser) 
            ? (dataArray as any).reduce((a: number, b: number) => a + b, 0) / dataArray.length / 255 
            : micIntensity;

        for (let i = 0; i < positions.length / 3; i++) {
            const speedMultiplier = 1 + intensitySum * 5;
            positions[i * 3] += velocities[i * 3] * speedMultiplier;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * speedMultiplier;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * speedMultiplier;

            if (Math.abs(positions[i * 3]) > 25) positions[i * 3] *= -0.9;
            if (Math.abs(positions[i * 3 + 1]) > 25) positions[i * 3 + 1] *= -0.9;
            if (Math.abs(positions[i * 3 + 2]) > 25) positions[i * 3 + 2] *= -0.9;

            const hue = (time * 0.1 + (i / (positions.length / 3))) % 1;
            const color = new Color().setHSL(hue, 0.8, 0.5 + intensitySum * 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
    }
}

let gazeTimer = 0;
let gazeTarget: Mesh | null = null;
const GAZE_TIME = 1000; // 1 second

function updateGaze(frame: XRFrame) {
    const session = renderer.xr.getSession();
    if (!session) return;

    const xrCamera = renderer.xr.getCamera();
    raycaster.set(xrCamera.position, xrCamera.getWorldDirection(new Vector3()));

    const intersects = raycaster.intersectObjects(balls);

    if (intersects.length > 0) {
        const target = intersects[0].object as Mesh;
        if (gazeTarget === target) {
            gazeTimer += timer.getDelta() * 1000;
            if (gazeTimer >= GAZE_TIME) {
                onGazeSelect(target);
                gazeTimer = 0;
            }
        } else {
            gazeTarget = target;
            gazeTimer = 0;
        }
    } else {
        gazeTarget = null;
        gazeTimer = 0;
    }
}

function onGazeSelect(mesh: Mesh) {
    new TWEEN.Tween(mesh.scale)
        .to({ x: 2, y: 2, z: 2 }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .yoyo(true)
        .repeat(1)
        .start();

    mesh.userData.offset += Math.PI * 0.5;
    (mesh.material as MeshPhongMaterial).emissive.setHex(0xffffff);
    setTimeout(() => {
        (mesh.material as MeshPhongMaterial).emissive.setHex(0x000000);
    }, 200);
}

const raycaster = new Raycaster();
let physicsObjects: Mesh[] = [];
const GRAVITY = -9.8;

function updatePhysics(delta: number) {
    physicsObjects.forEach(obj => {
        if (!obj.userData.velocity) obj.userData.velocity = new Vector3();
        
        // Gravity
        obj.userData.velocity.y += GRAVITY * delta;
        obj.position.addScaledVector(obj.userData.velocity, delta);

        // Ground collision (y=0 for simplicity in AR)
        if (obj.position.y < 0) {
            obj.position.y = 0;
            obj.userData.velocity.y *= -0.5; // Bounce
            obj.userData.velocity.x *= 0.8; // Friction
            obj.userData.velocity.z *= 0.8;
        }
    });
}
const mouse = new Vector2();
let hoveredBall: Mesh | null = null;

function setupMouseInteractions(container: HTMLElement): void {
    container.addEventListener('mousemove', (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        updateHover();
    });

    container.addEventListener('click', () => {
        if (!balls.length) return;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(balls);

        if (intersects.length > 0) {
            const ball = intersects[0].object as Mesh;
            ball.userData.offset += Math.PI * 0.5;
            (ball.material as MeshPhongMaterial).emissive.setHex(0x333333);
            setTimeout(() => {
                (ball.material as MeshPhongMaterial).emissive.setHex(0x000000);
            }, 500);
        }
    });
}

function updateHover(): void {
    if (!camera || !balls.length) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...balls, ...spatialButtons]);

    if (intersects.length > 0) {
        const currentBall = intersects[0].object as Mesh;
        if (hoveredBall !== currentBall) {
            if (hoveredBall) {
                (hoveredBall.material as MeshPhongMaterial).emissive.setHex(0x000000);
            }
            hoveredBall = currentBall;
            (hoveredBall.material as MeshPhongMaterial).emissive.setHex(0x444444);
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (hoveredBall) {
            (hoveredBall.material as MeshPhongMaterial).emissive.setHex(0x000000);
            hoveredBall = null;
            document.body.style.cursor = 'default';
        }
    }
}

function setupKeyboardShortcuts(playPauseCallback: () => void): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
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


// EventListeners.ts
function setupEventListeners(): void {
    audioFileInput.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
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


// AudioControls.ts
function startAudio(): void {
    if (audio) {
        if (listener && listener.context.state === 'suspended') {
            listener.context.resume();
        }
        audio.play();
        isPlaying = true;
        balls.forEach(ball => ball.visible = true);
        if (particles) particles.visible = true;
        overlay.classList.add('hidden');
        uiControls.style.display = 'flex';
        pauseButton.style.display = 'inline-block';
        continueButton.style.display = 'none';
        info.textContent = 'Lecture en cours...';
    }
}

export function pauseAudio(): void {
    if (audio) {
        audio.pause();
        isPlaying = false;
        pauseButton.style.display = 'none';
        continueButton.style.display = 'inline-block';
        info.textContent = 'En pause';
    }
}

export function continueAudio(): void {
    if (audio) {
        audio.play();
        isPlaying = true;
        pauseButton.style.display = 'inline-block';
        continueButton.style.display = 'none';
        info.textContent = 'Lecture reprise...';
    }
}

export function stopAudio(): void {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        balls.forEach(ball => {
            ball.visible = false;
            ball.position.set(ball.userData.baseX || 0, 0, ball.userData.baseZ || 0);
        });
        if (particles) particles.visible = false;
        audioFileInput.value = "";
        overlay.classList.remove('hidden');
        uiControls.style.display = 'none';
        info.textContent = 'Visualiseur arrêté';
    }
}



let spatialButtons: Mesh[] = [];

function createSpatialUI(): void {
    const group = new Scene(); // We'll add this to the main scene
    
    const panelGeom = new PlaneGeometry(1, 0.5);
    const panelMat = new MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.8 });
    const panel = new Mesh(panelGeom, panelMat);
    panel.position.set(0, 1.5, -1);
    scene.add(panel);

    const btnGeom = new BoxGeometry(0.3, 0.2, 0.05);
    
    const redBtn = new Mesh(btnGeom, new MeshPhongMaterial({ color: 0xff0000 }));
    redBtn.position.set(-0.25, 1.5, -0.95);
    redBtn.userData.action = () => balls.forEach(b => (b.material as MeshPhongMaterial).color.set(0xff0000));
    scene.add(redBtn);
    spatialButtons.push(redBtn);

    const blueBtn = new Mesh(btnGeom, new MeshPhongMaterial({ color: 0x0000ff }));
    blueBtn.position.set(0.25, 1.5, -0.95);
    blueBtn.userData.action = () => balls.forEach(b => (b.material as MeshPhongMaterial).color.set(0x0000ff));
    scene.add(blueBtn);
    spatialButtons.push(blueBtn);
}
function setupAudioUI(): void {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'extra-ui';
    uiContainer.className = 'responsive-ui';
    uiContainer.style.cssText = 'position: fixed; bottom: 80px; left: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 2000; width: 300px; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 10px; backdrop-filter: blur(5px); transition: all 0.3s;';

    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 600px) {
            .responsive-ui {
                width: calc(100% - 40px) !important;
                bottom: 60px !important;
                left: 20px !important;
                padding: 10px !important;
            }
            .responsive-ui button {
                padding: 8px 5px !important;
                font-size: 9px !important;
            }
        }
    `;
    document.head.appendChild(style);

    progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = '0';
    progressBar.max = '100';
    progressBar.value = '0';
    progressBar.style.width = '100%';
    progressBar.addEventListener('input', () => {
        if (audio && audio.duration) {
            audio.currentTime = (parseFloat(progressBar.value) / 100) * audio.duration;
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
        if (audio) audio.volume = parseFloat(volumeSlider.value);
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

    const micBtn = document.createElement('button');
    micBtn.textContent = 'Activer Micro (Souffle)';
    micBtn.style.padding = '5px 10px';
    micBtn.style.fontSize = '10px';
    micBtn.addEventListener('click', () => {
        setupMicrophone();
        micBtn.disabled = true;
        micBtn.textContent = 'Micro Actif';
    });

    uiContainer.appendChild(progressBar);
    uiContainer.appendChild(volLabel);
    uiContainer.appendChild(volumeSlider);
    uiContainer.appendChild(shapeControls);
    uiContainer.appendChild(micBtn);
    document.body.appendChild(uiContainer);
}

function updateUIProgress(): void {
    if (audio && audio.duration && progressBar) {
        progressBar.value = ((audio.currentTime / audio.duration) * 100).toString();
    }
}

function changeBallsShape(shapeType: string): void {
    let newGeometry: BufferGeometry;
    switch (shapeType) {
        case 'Cube':
            newGeometry = new BoxGeometry(0.5, 0.5, 0.5);
            break;
        case 'Pyramide':
            newGeometry = new ConeGeometry(0.4, 0.6, 4);
            break;
        default:
            newGeometry = new SphereGeometry(0.3, 32, 32);
            break;
    }
    newGeometry.translate(0, 0.3, 0);

    balls.forEach(ball => {
        ball.geometry.dispose();
        ball.geometry = newGeometry;
    });
}