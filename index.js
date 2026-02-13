import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
const ambientLight = new THREE.AmbientLight( 0x00ff00 );
scene.add( ambientLight );
camera.position.z = 5;

// audio

const audioLoader = new THREE.AudioLoader();

const listener = new THREE.AudioListener();
camera.add( listener );

// floor

const floorGeometry = new THREE.PlaneGeometry( 10, 10 );
const floorMaterial = new THREE.MeshLambertMaterial( { color: 0x4676b6 } );

const floor = new THREE.Mesh( floorGeometry, floorMaterial );
floor.rotation.x = Math.PI * - 0.5;
floor.receiveShadow = true;
scene.add( floor );

const ballGeometry = new THREE.SphereGeometry( 0.3, 32, 16 );
const ballMaterial = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
const ball = new THREE.Mesh( ballGeometry, ballMaterial );
scene.add( ball );


const clock = new THREE.Clock();

function animate() {
  const speed = 1;
  const height = 1;
  const time = clock.getElapsedTime();
  ball.position.y = Math.abs( Math.sin( ( time * speed ) ) * height );

  renderer.render( scene, camera );

}