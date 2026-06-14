import * as THREE from 'three';

const canvas = document.querySelector('#scene');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');
const panel = document.querySelector('#panel');
const panelTitle = document.querySelector('#panelTitle');
const panelText = document.querySelector('#panelText');
const startButton = document.querySelector('#startButton');

const bestKey = 'skythread-best-score';
let bestScore = Number(localStorage.getItem(bestKey) || 0);
bestEl.textContent = bestScore;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x101631, 0.035);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, 2.2, 9.2);
camera.lookAt(0, 0.55, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const hemi = new THREE.HemisphereLight(0xaedcff, 0x24103f, 2.3);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1b8, 3.2);
sun.position.set(-4, 7, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);
const rim = new THREE.PointLight(0xff72c8, 2.3, 18);
rim.position.set(4, 3, 3);
scene.add(rim);

const world = new THREE.Group();
scene.add(world);

const gradientTexture = makeGradientTexture();
scene.background = gradientTexture;

const bird = createBird();
world.add(bird.group);

const clouds = createCloudField();
world.add(clouds);

const stars = createStars();
world.add(stars);

const gates = [];
const gatePool = new THREE.Group();
world.add(gatePool);

const state = {
  mode: 'ready',
  y: 0.5,
  velocity: 0,
  score: 0,
  time: 0,
  speed: 5.8,
  spawnTimer: 0,
  shake: 0,
};

const config = {
  gravity: -18.5,
  flap: 7.2,
  minY: -4.25,
  maxY: 4.6,
  gap: 2.55,
  gateX: 12,
  gateSpacing: 3.0,
  birdRadius: 0.46,
};

let last = performance.now();

function makeGradientTexture() {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#5f3d86');
  g.addColorStop(0.34, '#1b2a63');
  g.addColorStop(0.72, '#0c1029');
  g.addColorStop(1, '#080914');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBird() {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd166,
    roughness: 0.28,
    metalness: 0.05,
    clearcoat: 0.8,
    emissive: 0x5f2b00,
    emissiveIntensity: 0.16,
  });
  const bellyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, transmission: 0.18, opacity: 0.88, transparent: true });
  const wingMat = new THREE.MeshPhysicalMaterial({ color: 0xff72c8, roughness: 0.2, metalness: 0.05, clearcoat: 1, emissive: 0x5d123e, emissiveIntensity: 0.28 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0x35d3ff, roughness: 0.32, emissive: 0x064a67, emissiveIntensity: 0.2 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111327, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.44, 32, 20), bodyMat);
  body.scale.set(1.22, 0.9, 0.86);
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), bellyMat);
  belly.position.set(0.1, -0.07, 0.35);
  belly.scale.set(1.15, 0.86, 0.42);
  group.add(belly);

  const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 4), wingMat);
  leftWing.position.set(-0.46, 0.02, 0.03);
  leftWing.rotation.set(0.2, 0.1, Math.PI * 0.58);
  leftWing.castShadow = true;
  group.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 0.46;
  rightWing.rotation.z = -Math.PI * 0.58;
  group.add(rightWing);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.52, 4), beakMat);
  beak.position.set(0, 0.05, 0.58);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);

  for (const x of [-0.16, 0.16]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), eyeMat);
    eye.position.set(x, 0.22, 0.38);
    group.add(eye);
  }

  const trail = new THREE.Group();
  group.add(trail);
  return { group, leftWing, rightWing, trail };
}

function createCrystalGate(y) {
  const group = new THREE.Group();
  group.position.set(config.gateX, 0, -0.15);
  group.userData = { passed: false, gapY: y };
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x68e6ff,
    roughness: 0.08,
    metalness: 0.02,
    transparent: true,
    opacity: 0.64,
    transmission: 0.22,
    clearcoat: 1,
    emissive: 0x145d82,
    emissiveIntensity: 0.45,
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xff72c8, roughness: 0.25, emissive: 0x3f092a, emissiveIntensity: 0.45 });

  const height = 9;
  const width = 1.05;
  const topHeight = height - (y + config.gap / 2);
  const bottomHeight = height + (y - config.gap / 2);

  const makePillar = (cy, h) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(width, h, 1.05), mat);
    pillar.position.y = cy;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 1.26, 0.22, 1.24), capMat);
    cap.position.y = cy > 0 ? cy - h / 2 - 0.1 : cy + h / 2 + 0.1;
    cap.castShadow = true;
    group.add(cap);
  };

  makePillar(y + config.gap / 2 + topHeight / 2, topHeight);
  makePillar(y - config.gap / 2 - bottomHeight / 2, bottomHeight);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(config.gap * 0.53, 0.025, 8, 80), new THREE.MeshBasicMaterial({ color: 0xfff4a8, transparent: true, opacity: 0.82 }));
  ring.position.y = y;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  gatePool.add(group);
  gates.push(group);
}

function createCloudField() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xddeaff, roughness: 0.85, transparent: true, opacity: 0.42 });
  for (let i = 0; i < 34; i++) {
    const cloud = new THREE.Group();
    const parts = 3 + Math.floor(Math.random() * 4);
    for (let j = 0; j < parts; j++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.45 + Math.random() * 0.55, 12, 8), mat);
      puff.position.set(j * 0.55, Math.random() * 0.28, Math.random() * 0.4);
      puff.scale.y = 0.45;
      cloud.add(puff);
    }
    cloud.position.set(Math.random() * 42 - 16, Math.random() * 7 - 3.2, -8 - Math.random() * 18);
    cloud.scale.setScalar(0.8 + Math.random() * 1.9);
    group.add(cloud);
  }
  return group;
}

function createStars() {
  const positions = [];
  for (let i = 0; i < 420; i++) positions.push((Math.random() - 0.5) * 70, Math.random() * 18 - 4, -12 - Math.random() * 36);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.75 });
  return new THREE.Points(geo, mat);
}

function reset() {
  gates.splice(0).forEach(g => gatePool.remove(g));
  Object.assign(state, { mode: 'playing', y: 0.7, velocity: 0, score: 0, speed: 5.8, spawnTimer: 0.15, shake: 0 });
  scoreEl.textContent = '0';
  panel.classList.add('hidden');
  flap();
}

function flap() {
  if (state.mode === 'ready' || state.mode === 'gameover') return reset();
  if (state.mode !== 'playing') return;
  state.velocity = config.flap;
  addSpark();
}

function addSpark() {
  const sparkMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff72c8 : 0x35d3ff, transparent: true, opacity: 0.85 });
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), sparkMat);
  spark.position.set((Math.random() - 0.5) * 0.42, -0.06 + Math.random() * 0.16, -0.55);
  spark.userData.life = 0.55;
  bird.trail.add(spark);
}

function gameOver() {
  state.mode = 'gameover';
  state.shake = 0.35;
  if (state.score > bestScore) {
    bestScore = state.score;
    localStorage.setItem(bestKey, bestScore);
    bestEl.textContent = bestScore;
  }
  panelTitle.textContent = state.score > 0 ? `Flight ended at ${state.score}` : 'The glass bit back';
  panelText.textContent = 'One more run? Aim for the glowing center of each gate and keep your flaps calm.';
  startButton.textContent = 'Try again';
  panel.classList.remove('hidden');
}

function update(dt) {
  state.time += dt;
  world.rotation.y = Math.sin(state.time * 0.18) * 0.035;
  stars.rotation.y += dt * 0.008;

  clouds.children.forEach((cloud, i) => {
    cloud.position.x -= dt * (0.42 + (i % 5) * 0.035);
    if (cloud.position.x < -22) cloud.position.x = 24 + Math.random() * 8;
  });

  if (state.mode === 'playing') {
    state.speed += dt * 0.035;
    state.velocity += config.gravity * dt;
    state.y += state.velocity * dt;
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      createCrystalGate(THREE.MathUtils.clamp((Math.random() - 0.5) * 5.2, -2.7, 2.7));
      state.spawnTimer = config.gateSpacing;
    }
    if (state.y < config.minY || state.y > config.maxY) gameOver();
  }

  bird.group.position.y = THREE.MathUtils.lerp(bird.group.position.y, state.y, 0.32);
  bird.group.rotation.x = THREE.MathUtils.clamp(-state.velocity * 0.055, -0.52, 0.72);
  bird.group.rotation.z = Math.sin(state.time * 5.5) * 0.045;
  bird.leftWing.rotation.y = Math.sin(state.time * 22) * 0.45;
  bird.rightWing.rotation.y = -Math.sin(state.time * 22) * 0.45;

  for (let i = bird.trail.children.length - 1; i >= 0; i--) {
    const s = bird.trail.children[i];
    s.userData.life -= dt;
    s.position.z -= dt * 2.1;
    s.position.y -= dt * 0.25;
    s.material.opacity = Math.max(0, s.userData.life / 0.55);
    s.scale.multiplyScalar(1 + dt * 1.8);
    if (s.userData.life <= 0) bird.trail.remove(s);
  }

  for (let i = gates.length - 1; i >= 0; i--) {
    const gate = gates[i];
    if (state.mode === 'playing') gate.position.x -= state.speed * dt;
    gate.rotation.z = Math.sin(state.time * 1.4 + i) * 0.018;

    const dx = Math.abs(gate.position.x - bird.group.position.x);
    if (state.mode === 'playing' && dx < 0.72) {
      const inGap = Math.abs(state.y - gate.userData.gapY) < config.gap / 2 - config.birdRadius;
      if (!inGap) gameOver();
    }

    if (!gate.userData.passed && gate.position.x < bird.group.position.x - 0.55) {
      gate.userData.passed = true;
      state.score += 1;
      scoreEl.textContent = state.score;
    }
    if (gate.position.x < -9) {
      gatePool.remove(gate);
      gates.splice(i, 1);
    }
  }

  if (state.shake > 0) state.shake -= dt;
  const shake = Math.max(0, state.shake) * 0.22;
  camera.position.x = (Math.random() - 0.5) * shake;
  camera.position.y = 2.2 + Math.sin(state.time * 0.8) * 0.08 + (Math.random() - 0.5) * shake;
}

function animate(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

addEventListener('keydown', (event) => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
    event.preventDefault();
    flap();
  }
  if (event.code === 'KeyP' && state.mode === 'playing') {
    state.mode = 'paused';
    panelTitle.textContent = 'Paused in the clouds';
    panelText.textContent = 'Press Start flight or P to keep gliding.';
    startButton.textContent = 'Resume flight';
    panel.classList.remove('hidden');
  } else if (event.code === 'KeyP' && state.mode === 'paused') {
    state.mode = 'playing';
    panel.classList.add('hidden');
  }
});

canvas.addEventListener('pointerdown', flap);
startButton.addEventListener('click', () => {
  if (state.mode === 'paused') {
    state.mode = 'playing';
    panel.classList.add('hidden');
  } else {
    reset();
  }
});

requestAnimationFrame(animate);
