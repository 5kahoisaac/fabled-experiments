import * as THREE from 'three';
import { EffectComposer } from 'https://unpkg.com/three@0.154.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.154.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.154.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.154.0/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'https://unpkg.com/three@0.154.0/examples/jsm/shaders/FXAAShader.js';
import { FilmPass } from 'https://unpkg.com/three@0.154.0/examples/jsm/postprocessing/FilmPass.js';

// inline vignette shader (small, self-contained)
const VignetteShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'offset': { value: 1.0 },
    'darkness': { value: 1.0 }
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform float offset; uniform float darkness; uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 color = texture2D(tDiffuse, vUv); float dist = distance(vUv, vec2(0.5)); float vig = smoothstep(0.8, offset * 0.799, dist); color.rgb = mix(color.rgb, color.rgb * (1.0 - vig * darkness), 1.0); gl_FragColor = color; }`
};

let scene, camera, renderer, composer, bloomPass;
let bird, birdBox;
let pipes = [];
let clock = new THREE.Clock();
let gravity = -18; // world units/sec^2
let flapPower = 6.5; // impulse
let velocityY = 0;
let running = false;
let score = 0;
let best = 0;
let spawnTimer = 0;
let pipeGap = 4.5;
let pipeSpacing = 8; // horizontal distance between pipes
let speed = 6; // pipe approach speed
let worldWidth = 40;

// particles
let particleGeo, particleMat, particleMesh;
let MAX_PARTICLES = 80;
let particlePositions, particleVel, particleLife;
let particleIdx = 0;

// audio
let audioCtx = null;
let masterGain = null;
let audioEnabled = true;
let ambientOsc = null;
let ambientOsc2 = null;
let ambientGain = null;
let ambientFilter = null;
let musicInterval = null;
let musicBPM = 86;

// environment
let mountains = [];
let grassGroup = null;

const ui = {
  overlay: document.getElementById('overlay'),
  score: document.getElementById('score'),
  startBtn: document.getElementById('startBtn'),
  muteBtn: document.getElementById('muteBtn'),
};

init();

function init(){
  const container = document.body;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x9bd3ff, 0.02);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(-8, 2.2, 14);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // detect device quality and adjust settings for performance
  const deviceMemory = navigator.deviceMemory || 4;
  const hwThreads = navigator.hardwareConcurrency || 4;
  const isLowQuality = deviceMemory <= 1 || hwThreads <= 2 || window.innerWidth < 800 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if(isLowQuality) MAX_PARTICLES = 40;

  // composer + bloom + film + vignette + fxaa (some passes disabled on low quality)
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomStrength = isLowQuality ? 0.35 : 0.6;
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), bloomStrength, 0.9, 0.2);
  composer.addPass(bloomPass);

  // subtle film grain (skip on low quality)
  if(!isLowQuality){
    const filmPass = new FilmPass(0.12, 0.02, 648, false);
    composer.addPass(filmPass);
  }

  // vignette
  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.material.uniforms['offset'].value = isLowQuality ? 0.75 : 0.6;
  vignettePass.material.uniforms['darkness'].value = isLowQuality ? 0.45 : 0.55;
  composer.addPass(vignettePass);

  // FXAA anti-alias (skip on very low quality)
  if(!isLowQuality){
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(fxaaPass);
    // expose fxaaPass for resize updates
    composer.userData.fxaaPass = fxaaPass;
  }

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.8);
  hemi.position.set(0, 20, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(-10, 20, 10);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.left = -20;
  dir.shadow.camera.right = 20;
  dir.shadow.camera.top = 20;
  dir.shadow.camera.bottom = -20;
  scene.add(dir);

  // Ground
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2b6b2b, metalness: 0.1, roughness: 0.8 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(worldWidth*3, 200), groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -6.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Create bird
  bird = createBird();
  bird.position.set(0, 0, 0);
  scene.add(bird);

  birdBox = new THREE.Box3().setFromObject(bird);

  // particles
  setupParticles();

  // create environment
  createMountains();
  createGrass();

  // clouds: fewer on small screens
  const cloudCount = window.innerWidth < 700 ? 8 : 24;
  for(let i=0;i<cloudCount;i++){
    const cloud = createCloud();
    cloud.position.set((Math.random()-0.5)*80, 2 + Math.random()*8, -20 - Math.random()*40);
    cloud.scale.setScalar(1 + Math.random()*2.0);
    scene.add(cloud);
  }

  // load best score
  best = parseInt(localStorage.getItem('flappy3d_best') || '0', 10) || 0;
  updateStartBoxText();

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  ui.startBtn.addEventListener('click', startGame);
  if(ui.muteBtn){ ui.muteBtn.addEventListener('click', toggleMute); updateMuteButton(); }

  animate();
}

function setupAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = audioEnabled ? 1 : 0;
  masterGain.connect(audioCtx.destination);

  // subtle ambient pad (low drone with slow filter movement)
  ambientFilter = audioCtx.createBiquadFilter();
  ambientFilter.type = 'lowpass';
  ambientFilter.frequency.value = 520;
  ambientFilter.Q.value = 0.9;

  ambientOsc = audioCtx.createOscillator();
  ambientOsc.type = 'sine';
  ambientOsc.frequency.value = 110; // low drone

  ambientOsc2 = audioCtx.createOscillator();
  ambientOsc2.type = 'sine';
  ambientOsc2.frequency.value = 165; // a 5th above for harmonic motion

  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = audioEnabled ? 0.022 : 0;

  // small LFO to modulate the filter for movement
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.04;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 300; // modulation depth
  lfo.connect(lfoGain);
  lfoGain.connect(ambientFilter.frequency);
  lfo.start();

  ambientOsc.connect(ambientFilter);
  ambientOsc2.connect(ambientFilter);
  ambientFilter.connect(ambientGain);
  ambientGain.connect(masterGain);
  ambientOsc.start();
  ambientOsc2.start();

  // start music loop
  startMusicLoop();
}

function playFlap(){
  if(!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(620, now);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.12, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  o.connect(g); g.connect(masterGain);
  o.start(now); o.stop(now + 0.32);
}

function playPoint(){
  if(!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(880, now);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.15, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  o.connect(g); g.connect(masterGain);
  o.start(now); o.stop(now + 0.2);
}

function playHit(){
  if(!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(120, now);
  g.gain.setValueAtTime(0.2, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  o.connect(g); g.connect(masterGain);
  o.start(now); o.stop(now + 1.0);
}

function toggleMute(){
  audioEnabled = !audioEnabled;
  if(masterGain) masterGain.gain.setValueAtTime(audioEnabled ? 1 : 0, audioCtx ? audioCtx.currentTime : 0);
  if(ambientGain) ambientGain.gain.setValueAtTime(audioEnabled ? 0.035 : 0, audioCtx ? audioCtx.currentTime : 0);
  updateMuteButton();
}

function updateMuteButton(){
  if(!ui.muteBtn) return;
  ui.muteBtn.textContent = audioEnabled ? '🔊' : '🔇';
}

// leaderboard helpers: store top 5 scores
function getScores(){
  try{
    const arr = JSON.parse(localStorage.getItem('flappy3d_scores') || '[]');
    if(Array.isArray(arr)) return arr;
  }catch(e){}
  return [];
}
function saveScore(s){
  const arr = getScores();
  arr.push(s);
  arr.sort((a,b)=>b-a);
  arr.splice(5);
  localStorage.setItem('flappy3d_scores', JSON.stringify(arr));
}
function updateLeaderboardUI(){
  const el = document.getElementById('leaderboardList');
  if(!el) return;
  el.innerHTML = '';
  const arr = getScores();
  if(arr.length === 0){
    const li = document.createElement('li');
    li.textContent = '—';
    el.appendChild(li);
  } else {
    for(const v of arr){
      const li = document.createElement('li');
      li.textContent = v;
      el.appendChild(li);
    }
  }
}

function setupParticles(){
  particleGeo = new THREE.BufferGeometry();
  particlePositions = new Float32Array(MAX_PARTICLES * 3);
  particleVel = new Float32Array(MAX_PARTICLES * 3);
  particleLife = new Float32Array(MAX_PARTICLES);
  for(let i=0;i<MAX_PARTICLES*3;i++) particlePositions[i]=0;
  for(let i=0;i<MAX_PARTICLES;i++) particleLife[i]=0;
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleMat = new THREE.PointsMaterial({ color:0xffd59e, size:0.12, transparent:true, opacity:0.95, depthWrite:false });
  particleMesh = new THREE.Points(particleGeo, particleMat);
  particleMesh.frustumCulled = false;
  scene.add(particleMesh);
}

function spawnParticlesAt(pos, count = 10){
  for(let i=0;i<count;i++){
    const idx = particleIdx % MAX_PARTICLES;
    particleIdx++;
    const i3 = idx*3;
    particlePositions[i3] = pos.x + (Math.random()-0.5)*0.6;
    particlePositions[i3+1] = pos.y + (Math.random()-0.5)*0.6;
    particlePositions[i3+2] = pos.z + (Math.random()-0.5)*0.6;
    particleVel[i3] = (Math.random()-0.5) * 1.8;
    particleVel[i3+1] = Math.random() * 2.2 + 0.6;
    particleVel[i3+2] = (Math.random()-0.5) * 1.8;
    particleLife[idx] = 0.35 + Math.random()*0.45;
  }
  particleGeo.attributes.position.needsUpdate = true;
}

// music helpers
function playNote(freq, dur = 0.22, type='triangle', gainVal=0.09){
  if(!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gainVal, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  o.connect(g); g.connect(masterGain);
  o.start(now); o.stop(now + dur + 0.02);
}

function startMusicLoop(){
  if(musicInterval) return;
  const seq = [440, 523.25, 659.25, 880]; // A4,C5,E5,A5
  let idx = 0;
  const beat = (60 / musicBPM) * 1000; // ms per beat
  musicInterval = setInterval(()=>{
    const f = seq[idx % seq.length] * (Math.random() > 0.92 ? 1.5 : 1);
    playNote(f, 0.22, 'triangle', 0.08);
    // occasional double note
    if(Math.random() > 0.7) setTimeout(()=> playNote(f*0.66, 0.18, 'sine', 0.035), beat*0.4);
    idx++;
  }, beat*0.5);
}
function stopMusicLoop(){ if(musicInterval){ clearInterval(musicInterval); musicInterval = null; } }

// environment
function createMountains(){
  const colors = [0x7fb3ff, 0x5f92d9, 0x3f6aa8];
  for(let i=0;i<3;i++){
    const g = new THREE.Group();
    const w = 220 - i*30;
    const h = 18 + i*6;
    const geo = new THREE.PlaneGeometry(w, h, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: colors[i], metalness:0, roughness:1, emissive:colors[i], emissiveIntensity:0.01 });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI/2;
    m.position.set(-20, -6.5 + (i*1.4), -30 - i*18);
    m.receiveShadow = false;
    m.userData = { baseX: m.position.x, layer: i };
    scene.add(m);
    mountains.push(m);
  }
}

function createGrass(){
  grassGroup = new THREE.Group();
  const bladeGeo = new THREE.PlaneGeometry(0.14, 1.0);
  // translate geometry so base at y=0
  bladeGeo.translate(0, -0.5, 0);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x3aa046, metalness:0.02, roughness:0.8, side: THREE.DoubleSide });
  const count = 80;
  for(let i=0;i<count;i++){
    const b = new THREE.Mesh(bladeGeo, bladeMat);
    b.position.x = (Math.random()-0.5) * 60;
    b.position.z = -8 + (Math.random()-0.5) * 6;
    b.position.y = -6.45 + Math.random()*0.12;
    b.rotation.y = Math.random()*Math.PI*2;
    b.userData.phase = Math.random()*Math.PI*2;
    b.castShadow = false;
    grassGroup.add(b);
  }
  scene.add(grassGroup);
}

function createBird(){
  const g = new THREE.Group();
  const bodyGeo = new THREE.SphereGeometry(0.7, 28, 20);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffb86b, metalness: 0.2, roughness: 0.45 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = false;
  g.add(body);

  const eyeGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness:0.2, roughness:0.4 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.32, 0.12, 0.6);
  const eyeR = eyeL.clone();
  eyeR.position.x = -0.32;
  g.add(eyeL, eyeR);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 16), new THREE.MeshStandardMaterial({ color:0xff7b47, metalness:0.1, roughness:0.6 }));
  beak.rotation.x = Math.PI/2;
  beak.position.set(0, 0, 0.9);
  g.add(beak);

  // wings
  const wingGeo = new THREE.BoxGeometry(0.05, 0.9, 1.4);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xffa66a, metalness:0.05, roughness:0.6 });
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.position.set(0.8, -0.05, 0);
  wingL.rotation.z = 0.2;
  wingL.castShadow = true;
  const wingR = wingL.clone();
  wingR.position.x = -0.8;
  wingR.rotation.z = -0.2;
  g.add(wingL, wingR);

  // small shadow beneath bird (sprite-like)
  const shadowGeo = new THREE.PlaneGeometry(1.8, 0.9);
  const shadowMat = new THREE.MeshBasicMaterial({ color:0x000000, opacity:0.18, transparent:true });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI/2;
  shadow.position.y = -0.71;
  g.add(shadow);

  // store wings for animation
  g.userData = { wingL, wingR };
  return g;
}

function createStripedTexture(){
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const ctx = c.getContext('2d');
  // base
  ctx.fillStyle = '#2a9d8f';
  ctx.fillRect(0,0,c.width,c.height);
  // stripes
  for(let y=0;y<c.height;y+=12){
    ctx.fillStyle = (y%24===0) ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    ctx.fillRect(0,y,c.width,6);
  }
  // subtle noise
  const id = ctx.getImageData(0,0,c.width,c.height);
  for(let i=0;i<id.data.length;i+=4){
    const v = (Math.random()*18 - 9);
    id.data[i] = Math.min(255, Math.max(0, id.data[i] + v));
    id.data[i+1] = Math.min(255, Math.max(0, id.data[i+1] + v));
    id.data[i+2] = Math.min(255, Math.max(0, id.data[i+2] + v));
  }
  ctx.putImageData(id,0,0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.encoding = THREE.sRGBEncoding;
  return tex;
}

function createCloud(){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color:0xffffff, metalness:0.0, roughness:0.9 });
  for(let i=0;i<5;i++){
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.6 + Math.random()*1.1, 12,12), mat);
    s.position.set((Math.random()-0.5)*2.2, (Math.random()-0.5)*0.6, (Math.random()-0.5)*0.8);
    s.castShadow = false;
    g.add(s);
  }
  g.rotation.y = Math.random()*Math.PI*2;
  return g;
}

function spawnPipe(x){
  const tex = createStripedTexture();
  const mat = new THREE.MeshStandardMaterial({ map: tex, color:0xffffff, metalness:0.03, roughness:0.7 });
  // Main body (tall box stretched out) and subtle bevel using cylinders
  const bodyTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 40, 4), mat);
  const bodyBottom = new THREE.Mesh(new THREE.BoxGeometry(2.6, 40, 4), mat);
  const capGeo = new THREE.CylinderGeometry(1.3, 1.3, 4, 20);
  const capTop = new THREE.Mesh(capGeo, mat);
  const capBottom = capTop.clone();
  bodyTop.castShadow = bodyBottom.castShadow = capTop.castShadow = capBottom.castShadow = true;
  const centerY = (Math.random()*6 - 1);
  bodyTop.position.set(x, centerY + pipeGap/2 + 20, 0);
  capTop.position.set(x, centerY + pipeGap/2 + 40 - 2, 0);
  bodyBottom.position.set(x, centerY - pipeGap/2 - 20, 0);
  capBottom.position.set(x, centerY - pipeGap/2 - 40 + 2, 0);
  capTop.rotation.z = Math.PI/2; capBottom.rotation.z = Math.PI/2;
  const topGroup = new THREE.Group(); topGroup.add(bodyTop, capTop);
  const bottomGroup = new THREE.Group(); bottomGroup.add(bodyBottom, capBottom);
  scene.add(topGroup, bottomGroup);
  const pair = { top: topGroup, bottom: bottomGroup, passed: false };
  pipes.push(pair);
}

function resetGame(){
  // remove pipes
  for(const p of pipes){
    scene.remove(p.top, p.bottom);
  }
  pipes = [];
  velocityY = 0;
  score = 0;
  spawnTimer = 0;
  pipeGap = 4.5;
  speed = 6;
  ui.score.innerText = `Score: ${score}`;
}

function updateStartBoxText(){
  const startBox = document.getElementById('start-box');
  if(!startBox) return;
  startBox.querySelector('p').innerText = `Pretty & playable. Click or press Space to start.`;
  let bestEl = startBox.querySelector('.best');
  if(!bestEl){
    bestEl = document.createElement('div');
    bestEl.className = 'best';
    bestEl.style.opacity = '0.9';
    bestEl.style.marginTop = '10px';
    startBox.appendChild(bestEl);
  }
  bestEl.innerText = `Best: ${best}`;
  // update leaderboard UI
  updateLeaderboardUI();
  // pulse Start button to draw attention
  if(ui.startBtn) ui.startBtn.classList.add('pulse');
}

function startGame(){
  ui.overlay.style.display = 'none';
  if(ui.startBtn) ui.startBtn.classList.remove('pulse');
  resetGame();
  running = true;
  // ensure audio context is allowed
  setupAudio();
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function gameOver(){
  running = false;
  ui.overlay.style.display = '';
  const startBox = document.getElementById('start-box');
  startBox.querySelector('h1').innerText = 'Game Over';
  startBox.querySelector('p').innerText = `Score: ${score} — Click to retry or press Space`;
  ui.overlay.querySelector('#startBtn').innerText = 'Retry';
  // save into leaderboard
  try{ saveScore(score); }catch(e){}
  if(score > best) {
    best = score;
    localStorage.setItem('flappy3d_best', String(best));
  }
  updateStartBoxText();
  spawnParticlesAt(bird.position, 28);
  playHit();
}

function onKeyDown(e){
  if(e.code === 'Space'){
    e.preventDefault();
    // first user interaction should resume audio
    if(!audioCtx) setupAudio();
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    flap();
    if(!running) startGame();
  }
}

function onPointerDown(){
  if(!audioCtx) setupAudio();
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  flap();
  if(!running) startGame();
}

function flap(){
  velocityY = flapPower;
  // small tilt
  bird.userData.tilt = Math.PI/8;
  spawnParticlesAt(bird.position, 12);
  playFlap();
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  // animate wings
  const t = clock.elapsedTime;
  if(bird){
    const { wingL, wingR } = bird.userData;
    const flapAngle = Math.sin(t*12) * 0.6 - 0.2;
    wingL.rotation.x = -0.3 + flapAngle;
    wingR.rotation.x = -0.3 - flapAngle;
  }

  // update particles
  for(let i=0;i<MAX_PARTICLES;i++){
    if(particleLife[i] > 0){
      particleLife[i] -= dt;
      const i3 = i*3;
      particleVel[i3+1] -= 9.8 * dt * 0.6; // gravity on particles
      particlePositions[i3] += particleVel[i3] * dt;
      particlePositions[i3+1] += particleVel[i3+1] * dt;
      particlePositions[i3+2] += particleVel[i3+2] * dt;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // animate mountains for subtle parallax
  for(let i=0;i<mountains.length;i++){
    const m = mountains[i];
    m.position.x = m.userData.baseX + Math.sin(t*0.06 + i) * (2 + i*1.2);
  }

  // animate grass sway
  if(grassGroup){
    grassGroup.children.forEach((b, idx) => {
      const ph = b.userData.phase || 0;
      b.rotation.z = Math.sin(t*2 + ph) * 0.16;
      b.position.y = -6.45 + Math.sin(t*1.2 + ph) * 0.02;
    });
  }

  if(running){
    // physics
    velocityY += gravity * dt;
    bird.position.y += velocityY * dt;

    // gentle tilt forward/back
    bird.rotation.z = THREE.MathUtils.clamp(-velocityY * 0.06, -0.7, 0.6);

    // spawn pipes
    spawnTimer -= dt;
    if(spawnTimer <= 0){
      spawnPipe(40);
      spawnTimer = pipeSpacing / (speed/6); // keep spacing somewhat constant as speed changes
    }

    // update pipes
    for(let i = pipes.length - 1; i>=0; i--){
      const p = pipes[i];
      p.top.position.x -= speed * dt;
      p.bottom.position.x -= speed * dt;

      // score check
      if(!p.passed && p.top.position.x < 0){
        p.passed = true;
        score += 1;
        ui.score.innerText = `Score: ${score}`;
        playPoint();
        // gradually increase difficulty
        if(score % 8 === 0) { speed += 0.6; pipeGap = Math.max(3.0, pipeGap - 0.35); }
      }

      // remove off-screen
      if(p.top.position.x < -60){
        scene.remove(p.top, p.bottom);
        pipes.splice(i,1);
      }
    }

    // collision detection
    birdBox.setFromObject(bird);
    for(const p of pipes){
      const topBox = new THREE.Box3().setFromObject(p.top);
      const bottomBox = new THREE.Box3().setFromObject(p.bottom);
      if(birdBox.intersectsBox(topBox) || birdBox.intersectsBox(bottomBox)){
        gameOver();
        break;
      }
    }

    // ground & ceiling
    if(bird.position.y < -5.7 || bird.position.y > 18){
      gameOver();
    }
  } else {
    // idle bob
    bird.position.y = Math.sin(clock.elapsedTime*1.6) * 0.6 + 0.5;
    bird.rotation.z = Math.sin(clock.elapsedTime*0.6) * 0.06;
  }

  // move camera smoothly to watch bird
  const camTargetY = bird.position.y + 1.2;
  camera.position.y += (camTargetY - camera.position.y) * 0.08;
  camera.lookAt(bird.position.x - 1.5, bird.position.y + 1.2, 0);

  composer.render();
}

function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  // update FXAA resolution
  const fx = composer.userData.fxaaPass;
  if(fx && fx.material && fx.material.uniforms && fx.material.uniforms['resolution']){
    fx.material.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  }
}
