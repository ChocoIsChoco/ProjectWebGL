import * as THREE from 'three';

let scene, camera, renderer, clock, analyser;
let data = 0;
// const speed = 2.5;
// const height = 3;
// const offset = 0.5;
let i = 1;

const frequencyRange = {
    bass: [20, 140],
    lowMid: [140, 400],
    mid: [400, 2600],
    highMid: [2600, 5200],
    treble: [5200, 14000],
};

let objectBall = [];
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', init)

function init() {
    const overlay = document.getElementById('overlay');
    overlay.remove();

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x00ff00);
    scene.add(ambientLight);


    const listener = new THREE.AudioListener();
    camera.add(listener);
    const count = 1;
    const radius = 3;


    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 16);
    const ballMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/s1.mp3', function (buffer) {
        const s = i / count * Math.PI * 2;

        const ball = new THREE.Mesh(ballGeometry, ballMaterial);

        ball.position.x = radius * Math.cos(s);
        ball.position.z = radius * Math.sin(s);

        const sound = new THREE.PositionalAudio(listener);
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(10);
        sound.play();
        ball.add(sound);
        scene.add(ball);
        objectBall.push(ball);
        analyser = new THREE.AudioAnalyser(sound, 32);

    });
}

const getFrequencyRangeValue = (data, _frequencyRange) => {
    const nyquist = 48000 / 2;
    const lowIndex = Math.round(_frequencyRange[0] / nyquist * data.length);
    const highIndex = Math.round(_frequencyRange[1] / nyquist * data.length);
    let total = 0;
    let numFrequencies = 0;

    for (let i = lowIndex; i <= highIndex; i++) {
        total += data[i];
        numFrequencies += 1;
    }
    return total / numFrequencies / 255;
};


function animate() {
    if (analyser) {
        data = analyser.getAverageFrequency();
        const bass = getFrequencyRangeValue(data, frequencyRange.bass);
        const mid = getFrequencyRangeValue(data, frequencyRange.mid);
        const treble = getFrequencyRangeValue(data, frequencyRange.treble);

        let r = bass;
        let g = mid;
        let b = treble;
        console.log(data);
    }
    // const time = clock.getElapsedTime();
    const ball = objectBall[0];
    if (ball) {
        ball.position.y = 0.05 * data; //Math.abs( Math.sin( i * offset + ( time * speed ) ) * height );
    }
    renderer.render(scene, camera);

}