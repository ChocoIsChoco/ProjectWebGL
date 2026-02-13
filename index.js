import * as THREE from 'three';

let scene, camera, renderer, analyser, audio, audioContext, source, dataArray;
let isPlaying = false;
let visualizerObjects = [];
let particles, particleSystem;
let clock;

// Configuration
const config = {
    barCount: 64,
    barRadius: 8,
    maxHeight: 10,
    particleCount: 1000,
    rotationSpeed: 0.001
};

// Elements DOM
const overlay = document.getElementById('overlay');
const audioFileInput = document.getElementById('audioFile');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const container = document.getElementById('container');
const info = document.getElementById('info');

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Clock
    clock = new THREE.Clock();

    // Lights
    setupLights();

    // Create visualizer elements
    createFrequencyBars();
    createParticles();
    createCenterSphere();

    // Event listeners
    setupEventListeners();

    // Start animation
    animate();
}

function setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Main directional light
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

    // Colored point lights
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

function createFrequencyBars() {
    const barGroup = new THREE.Group();
    
    for (let i = 0; i < config.barCount; i++) {
        const angle = (i / config.barCount) * Math.PI * 2;
        
        // Create bar geometry
        const geometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i / config.barCount, 1, 0.5),
            emissive: new THREE.Color().setHSL(i / config.barCount, 1, 0.2),
            emissiveIntensity: 0.5
        });
        
        const bar = new THREE.Mesh(geometry, material);
        
        // Position bar in circle
        bar.position.x = Math.cos(angle) * config.barRadius;
        bar.position.z = Math.sin(angle) * config.barRadius;
        bar.position.y = 0;
        
        bar.castShadow = true;
        bar.receiveShadow = true;
        
        barGroup.add(bar);
        visualizerObjects.push({
            mesh: bar,
            baseY: 0,
            scale: 1,
            index: i
        });
    }
    
    scene.add(barGroup);
}

function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);
    const colors = new Float32Array(config.particleCount * 3);
    
    for (let i = 0; i < config.particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

function createCenterSphere() {
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.2,
        wireframe: true
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    scene.add(sphere);
    
    visualizerObjects.push({
        mesh: sphere,
        baseY: 0,
        scale: 1,
        index: -1
    });
}

function setupAudio(file) {
    const audioURL = URL.createObjectURL(file);
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create audio element
    audio = new Audio(audioURL);
    audio.crossOrigin = "anonymous";
    
    // Create analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    // Connect audio to analyser
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Create data array
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    info.textContent = `Fichier chargé: ${file.name}`;
}

function updateVisualizer() {
    if (!analyser || !dataArray) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    // Update frequency bars
    visualizerObjects.forEach((obj, index) => {
        if (obj.index === -1) {
            // Center sphere
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const scale = 1 + (average / 255) * 2;
            obj.mesh.scale.set(scale, scale, scale);
            
            // Rotate sphere
            obj.mesh.rotation.x += 0.01;
            obj.mesh.rotation.y += 0.01;
            
            // Update sphere color based on bass
            const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            const hue = (bass / 255) * 0.3; // Red to yellow range
            obj.mesh.material.color.setHSL(hue, 1, 0.5);
            obj.mesh.material.emissive.setHSL(hue, 1, 0.3);
        } else {
            // Frequency bars
            const dataIndex = Math.floor((obj.index / config.barCount) * dataArray.length);
            const value = dataArray[dataIndex] / 255;
            
            // Update height
            const targetHeight = value * config.maxHeight;
            obj.mesh.scale.y = Math.max(0.1, targetHeight);
            obj.mesh.position.y = targetHeight / 2;
            
            // Update color based on frequency
            const hue = (dataIndex / dataArray.length);
            obj.mesh.material.color.setHSL(hue, 1, 0.5 + value * 0.5);
            obj.mesh.material.emissive.setHSL(hue, 1, value * 0.8);
            
            // Pulse effect
            obj.mesh.material.emissiveIntensity = 0.2 + value * 0.8;
        }
    });
    
    // Update particles
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const intensity = average / 255;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * intensity * 0.1;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.rotation.y += 0.001 * intensity;
        
        // Update particle opacity
        particleSystem.material.opacity = 0.3 + intensity * 0.7;
    }
    
    // Rotate entire scene
    scene.rotation.y += config.rotationSpeed;
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Update visualizer
    if (isPlaying) {
        updateVisualizer();
    } else {
        // Idle animation
        visualizerObjects.forEach((obj, index) => {
            if (obj.index === -1) {
                obj.mesh.rotation.x += 0.005;
                obj.mesh.rotation.y += 0.005;
            } else {
                obj.mesh.position.y = Math.abs(Math.sin(time + obj.index * 0.1)) * 2;
            }
        });
        
        if (particleSystem) {
            particleSystem.rotation.y += 0.0005;
        }
    }
    
    renderer.render(scene, camera);
}

function setupEventListeners() {
    // File input
    audioFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            setupAudio(file);
            startButton.disabled = false;
        }
    });
    
    // Start button
    startButton.addEventListener('click', () => {
        if (audio && !isPlaying) {
            audio.play();
            isPlaying = true;
            overlay.classList.add('hidden');
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            info.textContent = 'Lecture en cours...';
        }
    });
    
    // Pause button
    pauseButton.addEventListener('click', () => {
        if (audio && isPlaying) {
            audio.pause();
            isPlaying = false;
            overlay.classList.remove('hidden');
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
            info.textContent = 'En pause';
        }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Mouse movement for camera
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        
        camera.position.x = mouseX * 5;
        camera.position.y = 10 + mouseY * 5;
        camera.lookAt(0, 0, 0);
    });
}

// Initialize on load
init();