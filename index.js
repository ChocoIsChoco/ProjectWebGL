import * as THREE from 'three';

export {THREE};


export let scene, camera, renderer, analyser;



const overlay = document.getElementById('overlay');
const audioFileInput = document.getElementById('audioFile');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const container = document.getElementById('container');
const info = document.getElementById('info');
