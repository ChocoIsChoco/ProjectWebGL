import * as THREE from 'three';
import {initScene} from './js/scene/sceneSetup';
import { setupEventListeners } from './js/listener/EventListeners.js';

export {THREE};

export const overlay = document.getElementById('overlay');
export const audioFileInput = document.getElementById('audioFile');
export const startButton = document.getElementById('startButton');
export const pauseButton = document.getElementById('pauseButton');
export const stopButton = document.getElementById('stopButton');
export const continueButton = document.getElementById('continueButton');
export const uiControls = document.getElementById('ui-controls');
export const container = document.getElementById('container');
export const info = document.getElementById('info');

export let scene = new THREE.Scene();
export let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export let renderer, analyser, audioContext, audio, source, dataArray;
export let isPlaying = false;

export const setAudio = (val) => { audio = val; };
export const setAudioContext = (val) => { audioContext = val; };
export const setAnalyser = (val) => { analyser = val; };
export const setSource = (val) => { source = val; };
export const setDataArray = (val) => { dataArray = val; };
export const setIsPlaying = (val) => { isPlaying = val; };

function init() {
    initScene();
    setupEventListeners();
}

init();