"use strict";

import {
    AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry,
    Color, ConeGeometry, DirectionalLight,
    Group, Mesh, MeshLambertMaterial, MeshPhongMaterial,
    PerspectiveCamera, PlaneGeometry, Raycaster, RingGeometry, Scene,
    ShadowMaterial, SphereGeometry, Vector2, Vector3,
    WebGLRenderer, AudioListener, PositionalAudio, Points,
    PointsMaterial
} from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';

interface XRState {
    hitTestSource: XRHitTestSource | null;
    hitTestSourceRequested: boolean;
    lightProbe: any | null;
}

const GRAVITY = -9.8;
const GAZE_TIME = 1000;
const TARGET_COORD = { lat: 48.8584, lon: 2.2945 };

const zzfx = (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random())*d/R,P=0,g=0,H=0,a=0,n=1,I=0,j=0,f=0,x,h;e=M.max(.001,e);r=M.max(.001,r);t=M.max(.001,t);v=M.max(.001,v);l=M.max(.001,l);A=M.max(.001,A);c=M.max(.001,c);m*=d/R;B*=d/R;let s=R*(e+r+t+v+l+A+c),S=new Float32Array(s|0);for(;a<s;a++){if(++P>R*100)break;if(++g>R*500)break;if(a<R*e)n=a/(R*e);else if(a<R*(e+r))n=1-(a-R*e)/(R*r)*(1-D);else if(a<R*(e+r+t))n=D;else if(a<R*(e+r+t+v))n=D-(a-R*(e+r+t))/(R*v)*D;else n=0;if(a<s)n*=M.exp(-6*M.random()*q);f+=M.cos(m*a+B);h=M.sin(C*a+f);x=h>0?1:-1;C+=G;if(++H>z*R/100){H=0;C+=E*d/R}S[a]=n*(y?y>1?y>2?y>3?M.sin((h%1)*d):1-M.abs((h*2%2)-1)*2:1-M.abs((h*2%2)-1):M.sign(M.sin(h*d)):h)*w*p;if(a>R*e)S[a]+=S[a-R*e|0]*F}const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();const buf = ctx.createBuffer(1,S.length,R);buf.getChannelData(0).set(S);const src = ctx.createBufferSource();src.buffer = buf;src.connect(ctx.destination);src.start();return src};

class App {
    private scene = new Scene();
    private camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    private renderer = new WebGLRenderer({ antialias: true, alpha: true });
    private raycaster = new Raycaster();
    private audioListener = new AudioListener();
    
    private xr: XRState = { hitTestSource: null, hitTestSourceRequested: false, lightProbe: null };
    private hitReticle!: Mesh;
    private spatialButtons: Mesh[] = [];
    private physicsObjects: Mesh[] = [];
    
    private audio: HTMLAudioElement | null = null;
    private positionalAudio: PositionalAudio | null = null;
    private analyser: AnalyserNode | null = null;
    private audioData = new Uint8Array(128);
    
    private micAnalyser: AnalyserNode | null = null;
    private micData = new Uint8Array(128);
    private mouse = new Vector2();
    
    private gaze = { timer: 0, target: null as Mesh | null };
    private heading = 0;
    private compass!: Mesh;
    private particles!: Points;
    private terrain!: Mesh;
    private reactiveBalls: Mesh[] = [];
    
    constructor() {
        this.init();
    }

    private init(): void {
        const audioInput = document.getElementById('audioFile') as HTMLInputElement;
        if (audioInput) audioInput.value = '';

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.xr.enabled = true;
        
        const container = document.getElementById('container');
        if (container) container.appendChild(this.renderer.domElement);
        else document.body.appendChild(this.renderer.domElement);

        this.camera.position.set(5, 3, 5);
        this.camera.lookAt(0, 0, 0);
        this.camera.add(this.audioListener);
        this.scene.add(this.camera);

        this.scene.background = new Color(0x111111);

        const sessionInit = { optionalFeatures: ['local-floor', 'hit-test', 'light-estimation'] };
        document.body.appendChild(XRButton.createButton(this.renderer, sessionInit));

        this.setupLights();
        this.setupObjects();
        this.setupControllers();
        this.setupEventListeners();
        this.initGeolocation();

        this.renderer.setAnimationLoop((t, f) => this.render(t, f));
    }

    private setupLights(): void {
        const ambient = new AmbientLight(0xffffff, 0.5);
        ambient.name = 'ambient';
        this.scene.add(ambient);

        const sun = new DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 7);
        sun.castShadow = true;
        sun.shadow.camera.left = -10;
        sun.shadow.camera.right = 10;
        sun.shadow.camera.top = 10;
        sun.shadow.camera.bottom = -10;
        sun.name = 'sun';
        this.scene.add(sun);
    }

    private setupObjects(): void {
        const reticleGroup = new Group();
        
        const inner = new Mesh(
            new RingGeometry(0, 0.08, 32).rotateX(-Math.PI / 2),
            new MeshPhongMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6 })
        );
        const outer = new Mesh(
            new RingGeometry(0.09, 0.11, 32).rotateX(-Math.PI / 2),
            new MeshPhongMaterial({ color: 0x00ffcc })
        );
        
        reticleGroup.add(inner, outer);
        this.hitReticle = reticleGroup as any;
        this.hitReticle.visible = false;
        this.hitReticle.matrixAutoUpdate = false;
        this.scene.add(this.hitReticle);

        const floor = new Mesh(new PlaneGeometry(100, 100), new ShadowMaterial({ opacity: 0.4 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        this.terrain = this.createTerrain();
        this.scene.add(this.terrain);

        this.particles = this.createParticles();
        this.scene.add(this.particles);

        this.createReactiveBalls();

        this.compass = new Mesh(new ConeGeometry(0.05, 0.2, 4), new MeshPhongMaterial({ color: 0xff3300 }));
        this.compass.rotation.x = Math.PI / 2;
        this.compass.position.set(0, -0.2, -0.5);
        this.camera.add(this.compass);

        this.createSpatialUI();
    }

    private createTerrain(): Mesh {
        const geom = new PlaneGeometry(20, 20, 50, 50);
        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const h = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 1.5;
            pos.setZ(i, h);
        }
        geom.computeVertexNormals();
        const mesh = new Mesh(geom, new MeshLambertMaterial({ color: 0x224488, wireframe: true, transparent: true, opacity: 0.3 }));
        mesh.rotation.x = -Math.PI / 2;
        return mesh;
    }

    private createParticles(): Points {
        const count = 1000;
        const geom = new BufferGeometry();
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 20;
            vel[i] = (Math.random() - 0.5) * 0.05;
        }
        geom.setAttribute('position', new BufferAttribute(pos, 3));
        (geom.userData as any).velocities = vel;
        return new Points(geom, new PointsMaterial({ color: 0x00ffff, size: 0.05, transparent: true, opacity: 0.6 }));
    }

    private createReactiveBalls(): void {
        const geom = new SphereGeometry(0.2, 32, 32);
        for (let i = 0; i < 6; i++) {
            const ball = new Mesh(geom, new MeshPhongMaterial({ color: 0x00ffcc, shininess: 100 }));
            const angle = (i / 6) * Math.PI * 2;
            ball.position.set(Math.cos(angle) * 3, 1, Math.sin(angle) * 3);
            ball.userData = { originalPos: ball.position.clone(), index: i };
            ball.castShadow = true;
            this.scene.add(ball);
            this.reactiveBalls.push(ball);
        }
    }

    private createSpatialUI(): void {
        const uiGroup = new Group();
        uiGroup.position.set(0, 1.2, -1);
        
        const btnGeom = new BoxGeometry(0.2, 0.1, 0.05);
        const colors = [0xff0000, 0x00ff00, 0x0000ff];
        
        colors.forEach((col, i) => {
            const btn = new Mesh(btnGeom, new MeshPhongMaterial({ color: col }));
            btn.position.x = (i - 1) * 0.2;
            btn.userData.action = () => this.changeTheme(btn, col);
            uiGroup.add(btn);
            this.spatialButtons.push(btn);
        });
        
        this.scene.add(uiGroup);
    }

    private changeTheme(mesh: Mesh, color: number): void {
        this.reactiveBalls.forEach(b => (b.material as MeshPhongMaterial).color.set(color));
        this.animateObject(mesh);
        zzfx(1, .05, 400, .1, .1, .2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, .1);
    }

    private setupControllers(): void {
        const onSelect = (event: any) => {
            const controller = event.target;
            const session = this.renderer.xr.getSession();

            if (session) {
                for (const inputSource of session.inputSources) {
                    if (inputSource.gamepad?.hapticActuators?.length) {
                        inputSource.gamepad.hapticActuators[0].pulse(0.5, 100);
                    }
                }
            }

            this.raycaster.set(controller.position, controller.getWorldDirection(new Vector3()).negate());
            const intersects = this.raycaster.intersectObjects([...this.spatialButtons, ...this.reactiveBalls]);
            
            if (intersects.length > 0) {
                const obj = intersects[0].object as Mesh;
                if (obj.userData.action) obj.userData.action();
                else this.animateObject(obj);
                return;
            }

            if (this.hitReticle.visible) {
                this.spawnPhysicsObject();
                zzfx(1, .05, 150, .05, .05, .1, 0, 1.5);
            }
        };

        const c1 = this.renderer.xr.getController(0);
        c1.addEventListener('select', onSelect);
        this.scene.add(c1);

        const c2 = this.renderer.xr.getController(1);
        c2.addEventListener('select', onSelect);
        this.scene.add(c2);
    }

    private animateObject(mesh: Mesh): void {
        new TWEEN.Tween(mesh.scale)
            .to({ x: 1.5, y: 1.5, z: 1.5 }, 200)
            .easing(TWEEN.Easing.Back.Out)
            .yoyo(true)
            .repeat(1)
            .start();
    }

    private spawnPhysicsObject(): void {
        const obj = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshPhongMaterial({ color: Math.random() * 0xffffff }));
        this.hitReticle.matrix.decompose(obj.position, obj.quaternion, obj.scale);
        obj.position.y += 0.5;
        obj.userData.velocity = new Vector3(0, 2, 0);
        obj.castShadow = true;
        this.scene.add(obj);
        this.physicsObjects.push(obj);
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('pointerdown', (e) => {
            if (this.renderer.xr.isPresenting) return;
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects([...this.spatialButtons, ...this.reactiveBalls]);
            if (intersects.length > 0) {
                const obj = intersects[0].object as Mesh;
                if (obj.userData.action) obj.userData.action();
                else this.animateObject(obj);
            }
        });

        const startBtn = document.getElementById('startButton');
        const audioInput = document.getElementById('audioFile') as HTMLInputElement;

        startBtn?.addEventListener('click', () => {
            const file = audioInput?.files?.[0];
            if (file) this.startAudio(file);
            document.getElementById('overlay')?.classList.add('hidden');
            this.setupMicrophone();
            this.initSpeechRecognition();
        });
    }

    private async setupMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ctx = this.audioListener.context;
            const source = ctx.createMediaStreamSource(stream);
            this.micAnalyser = ctx.createAnalyser();
            this.micAnalyser.fftSize = 256;
            source.connect(this.micAnalyser);
        } catch (e) { console.error("Mic access denied", e); }
    }

    private startAudio(file: File): void {
        const url = URL.createObjectURL(file);
        this.audio = new Audio(url);
        this.audio.loop = true;
        
        const ctx = this.audioListener.context;
        if (ctx.state === 'suspended') ctx.resume();

        this.positionalAudio = new PositionalAudio(this.audioListener);
        this.positionalAudio.setMediaElementSource(this.audio);
        this.positionalAudio.setRefDistance(2);
        this.reactiveBalls[0].add(this.positionalAudio);

        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 256;
        const sourceNode = ctx.createMediaElementSource(this.audio);
        sourceNode.connect(this.analyser);
        sourceNode.connect(this.positionalAudio.getOutput());
        
        this.audio.play();
    }

    private initSpeechRecognition(): void {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.lang = 'fr-FR';
        recognition.onresult = (e: any) => {
            const text = e.results[e.results.length - 1][0].transcript.toLowerCase();
            if (text.includes('rouge')) this.changeTheme(this.spatialButtons[0], 0xff0000);
            if (text.includes('vert')) this.changeTheme(this.spatialButtons[1], 0x00ff00);
            if (text.includes('bleu')) this.changeTheme(this.spatialButtons[2], 0x0000ff);
        };
        recognition.start();
    }

    private initGeolocation(): void {
        if (!navigator.geolocation) return;
        navigator.geolocation.watchPosition(pos => {
            const lat1 = pos.coords.latitude * Math.PI / 180;
            const lat2 = TARGET_COORD.lat * Math.PI / 180;
            const dLon = (TARGET_COORD.lon - pos.coords.longitude) * Math.PI / 180;
            const y = Math.sin(dLon) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            this.heading = -Math.atan2(y, x);
        });
    }

    private render(time: number, frame?: XRFrame): void {
        const delta = 0.016;
        TWEEN.update(time);

        if (frame) {
            this.updateXR(frame);
        }

        this.updateVisuals(time);
        this.updatePhysics(delta);
        this.updateGaze();
        
        if (this.hitReticle.visible) {
            this.hitReticle.rotation.y += 0.05;
            const pulse = 1 + Math.sin(time * 0.005) * 0.2;
            this.hitReticle.scale.set(pulse, 1, pulse);
        }
        
        if (this.compass) this.compass.rotation.z = this.heading;

        this.renderer.render(this.scene, this.camera);
    }

    private updateXR(frame: XRFrame): void {
        const session = this.renderer.xr.getSession();
        if (!session) return;
        
        if (this.audioListener.context.state === 'suspended') {
            this.audioListener.context.resume();
        }

        this.scene.background = null;
        this.terrain.visible = false;

        if (!this.xr.hitTestSourceRequested) {
            session.requestReferenceSpace('viewer').then(rs => {
                session.requestHitTestSource?.({ space: rs })?.then(ts => this.xr.hitTestSource = ts);
            });
            this.xr.hitTestSourceRequested = true;
        }

        if (this.xr.hitTestSource) {
            const refSpace = this.renderer.xr.getReferenceSpace();
            const hits = frame.getHitTestResults(this.xr.hitTestSource);
            if (hits.length && refSpace) {
                const pose = hits[0].getPose(refSpace);
                if (pose) {
                    this.hitReticle.visible = true;
                    this.hitReticle.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                this.hitReticle.visible = false;
            }
        }

        if (!this.xr.lightProbe) {
            (session as any).requestLightProbe?.().then((p: any) => this.xr.lightProbe = p);
        }

        if (this.xr.lightProbe) {
            const est: any = (frame as any).getLightEstimate(this.xr.lightProbe);
            if (est) {
                const sun = this.scene.getObjectByName('sun') as DirectionalLight;
                const amb = this.scene.getObjectByName('ambient') as AmbientLight;
                if (amb && est.sphericalHarmonicsCoefficients) {
                    const sh: any = est.sphericalHarmonicsCoefficients;
                    amb.intensity = Math.max(0.1, (sh[0] + sh[1] + sh[2]) / 3);
                }
                if (sun && est.primaryLightDirection) {
                    const d: any = est.primaryLightDirection;
                    sun.position.set(d.x * 5, d.y * 5, d.z * 5);
                    if (est.primaryLightIntensity) {
                        const i: any = est.primaryLightIntensity;
                        sun.color.setRGB(i.x, i.y, i.z);
                    }
                }
            }
        }
    }

    private updateVisuals(time: number): void {
        let micIntensity = 0;
        if (this.micAnalyser) {
            this.micAnalyser.getByteFrequencyData(this.micData);
            micIntensity = this.micData.reduce((a, b) => a + b, 0) / this.micData.length / 255;
        }

        let audioIntensity = 0;
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.audioData);
            audioIntensity = this.audioData.reduce((a, b) => a + b, 0) / this.audioData.length / 255;
        }

        const totalIntensity = audioIntensity + micIntensity;

        this.reactiveBalls.forEach((b, i) => {
            const freq = this.analyser ? (this.audioData[i * 10] / 255) : 0;
            const s = 1 + freq + micIntensity * 2;
            b.scale.set(s, s, s);
            b.position.y = (b.userData.originalPos.y) + Math.sin(time * 0.002 + i) * 0.2 + totalIntensity;
        });

        if (this.particles) {
            const pos = this.particles.geometry.attributes.position.array as Float32Array;
            const vel = (this.particles.geometry.userData as any).velocities;
            for (let i = 0; i < pos.length; i++) {
                pos[i] += vel[i] * (1 + totalIntensity * 10);
                if (Math.abs(pos[i]) > 10) vel[i] *= -1;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }

    private updatePhysics(delta: number): void {
        this.physicsObjects.forEach(obj => {
            const vel = obj.userData.velocity as Vector3;
            vel.y += GRAVITY * delta;
            obj.position.addScaledVector(vel, delta);
            if (obj.position.y < 0.05) {
                obj.position.y = 0.05;
                vel.y *= -0.6;
                vel.x *= 0.9;
                vel.z *= 0.9;
            }
        });
    }

    private updateGaze(): void {
        const activeCamera = this.renderer.xr.enabled && this.renderer.xr.isPresenting 
            ? this.renderer.xr.getCamera() 
            : this.camera;

        this.raycaster.set(activeCamera.position, activeCamera.getWorldDirection(new Vector3()));
        const intersects = this.raycaster.intersectObjects(this.reactiveBalls);

        if (intersects.length > 0) {
            const target = intersects[0].object as Mesh;
            if (this.gaze.target === target) {
                this.gaze.timer += 16;
                if (this.gaze.timer >= GAZE_TIME) {
                    this.animateObject(target);
                    this.gaze.timer = 0;
                    zzfx(1, .05, 800, .1, .1, .1);
                }
            } else {
                this.gaze.target = target;
                this.gaze.timer = 0;
            }
        } else {
            this.gaze.target = null;
            this.gaze.timer = 0;
        }
    }
}

new App();
