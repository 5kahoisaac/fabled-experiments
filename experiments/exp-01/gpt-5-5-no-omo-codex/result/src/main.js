import * as THREE from "three";

const canvas = document.querySelector("#game-canvas");
const scoreNode = document.querySelector("#score");
const bestNode = document.querySelector("#best");
const overlay = document.querySelector("#overlay");
const stateLabel = document.querySelector("#state-label");
const stateTitle = document.querySelector("#state-title");
const stateCopy = document.querySelector("#state-copy");
const startButton = document.querySelector("#start-button");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ccfff);
scene.fog = new THREE.Fog(0x7ccfff, 28, 82);

const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 130);
camera.position.set(0, 2.15, 11.5);
camera.lookAt(0, 1.05, 0);

const clock = new THREE.Clock();
const bestKey = "skyline-flap-best";

const palette = {
  cream: 0xfff3c4,
  amber: 0xffc857,
  coral: 0xff6b6b,
  mint: 0x5ef2b6,
  teal: 0x1fbda8,
  blue: 0x3aa8ff,
  navy: 0x113047,
  cloud: 0xf5fbff,
};

const materials = {
  bird: new THREE.MeshStandardMaterial({
    color: palette.amber,
    roughness: 0.55,
    metalness: 0.03,
  }),
  birdBelly: new THREE.MeshStandardMaterial({
    color: palette.cream,
    roughness: 0.6,
  }),
  wing: new THREE.MeshStandardMaterial({
    color: palette.coral,
    roughness: 0.5,
  }),
  pipe: new THREE.MeshStandardMaterial({
    color: palette.teal,
    roughness: 0.48,
    metalness: 0.05,
    emissive: 0x063a34,
  }),
  pipeRim: new THREE.MeshStandardMaterial({
    color: palette.mint,
    roughness: 0.38,
    emissive: 0x114d39,
  }),
  ground: new THREE.MeshStandardMaterial({
    color: 0x18516a,
    roughness: 0.86,
  }),
  cloud: new THREE.MeshStandardMaterial({
    color: palette.cloud,
    roughness: 0.8,
    transparent: true,
    opacity: 0.86,
  }),
  buildingA: new THREE.MeshStandardMaterial({
    color: 0x17476a,
    roughness: 0.8,
  }),
  buildingB: new THREE.MeshStandardMaterial({
    color: 0x216486,
    roughness: 0.8,
  }),
  window: new THREE.MeshBasicMaterial({
    color: 0xffe08a,
    transparent: true,
    opacity: 0.72,
  }),
};

const game = {
  state: "ready",
  score: 0,
  best: Number(localStorage.getItem(bestKey) || 0),
  speed: 6.6,
  gravity: -21,
  flapVelocity: 8.2,
  birdY: 1.2,
  birdVelocity: 0,
  birdRadius: 0.5,
  pipeTimer: 0,
  pipeInterval: 1.55,
  elapsed: 0,
};

bestNode.textContent = game.best;

const world = new THREE.Group();
const obstacleLayer = new THREE.Group();
const sceneryLayer = new THREE.Group();
scene.add(world, obstacleLayer, sceneryLayer);

createLights();
createWorld();
const bird = createBird();
scene.add(bird.group);

const obstacles = [];
const clouds = [];
const buildings = [];

seedScenery();
setOverlay("Ready", "Thread the skyline", "Tap, click, or press space to flap through the glowing gates.", "Start flight");
resize();

function createLights() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x226077, 2.8);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff0c7, 2.8);
  sun.position.set(-7, 10, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);
}

function createWorld() {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(120, 1, 20), materials.ground);
  ground.position.set(18, -3.55, -1);
  ground.receiveShadow = true;
  world.add(ground);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 32, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x1c9bd6,
      transparent: true,
      opacity: 0.28,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(20, -2.95, -11.5);
  world.add(water);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd166 }),
  );
  sun.position.set(-9.5, 7.2, -20);
  world.add(sun);
}

function createBird() {
  const group = new THREE.Group();
  group.position.set(-2.65, game.birdY, 0);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 24), materials.bird);
  body.scale.set(1.1, 0.9, 0.9);
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), materials.birdBelly);
  belly.position.set(0.16, -0.09, 0.32);
  belly.scale.set(1.05, 0.8, 0.42);
  group.add(belly);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.42, 4),
    new THREE.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.5 }),
  );
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.62, 0.03, 0);
  group.add(beak);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0x10202d }),
  );
  eye.position.set(0.36, 0.2, 0.32);
  group.add(eye);

  const wing = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 8, 16), materials.wing);
  wing.position.set(-0.13, -0.02, 0.42);
  wing.rotation.set(0.9, 0.1, -0.55);
  wing.castShadow = true;
  group.add(wing);

  return { group, wing };
}

function seedScenery() {
  for (let i = 0; i < 18; i += 1) {
    buildings.push(createBuilding(-18 + i * 5.5, -17 - Math.random() * 7));
  }

  for (let i = 0; i < 9; i += 1) {
    const cloud = createCloud();
    cloud.position.set(-18 + i * 7, 4.7 + Math.random() * 3.2, -13 - Math.random() * 12);
    cloud.userData.speed = 0.5 + Math.random() * 0.5;
    clouds.push(cloud);
    sceneryLayer.add(cloud);
  }
}

function createBuilding(x, z) {
  const group = new THREE.Group();
  const height = 2.6 + Math.random() * 5.8;
  const width = 1.5 + Math.random() * 1.5;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 1.4),
    Math.random() > 0.5 ? materials.buildingA : materials.buildingB,
  );
  group.position.set(x, 0, z);
  mesh.position.y = -3 + height / 2;
  mesh.receiveShadow = true;
  group.add(mesh);

  const rows = Math.floor(height / 0.72);
  for (let row = 0; row < rows; row += 1) {
    if (Math.random() < 0.24) continue;
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.02), materials.window);
    light.position.set(-width * 0.22, -2.75 + row * 0.64, 0.72);
    group.add(light);
  }

  sceneryLayer.add(group);
  return group;
}

function createCloud() {
  const group = new THREE.Group();
  const parts = [
    [0, 0, 0, 0.55],
    [0.45, 0.08, 0.02, 0.42],
    [-0.48, -0.02, 0, 0.38],
    [0.05, 0.24, -0.03, 0.42],
  ];
  for (const [x, y, z, radius] of parts) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 10), materials.cloud);
    puff.position.set(x, y, z);
    group.add(puff);
  }
  group.scale.setScalar(1 + Math.random() * 1.4);
  return group;
}

function createObstacle() {
  const gap = 2.9;
  const center = -0.3 + Math.random() * 3.6;
  const x = 10;
  const radius = 0.62;
  const topHeight = Math.max(1.8, 7.4 - (center + gap / 2));
  const bottomHeight = Math.max(1.8, center - gap / 2 + 3.1);
  const group = new THREE.Group();
  group.position.x = x;

  const top = createPipePart(topHeight, radius, true);
  top.position.y = center + gap / 2 + topHeight / 2;
  const bottom = createPipePart(bottomHeight, radius, false);
  bottom.position.y = center - gap / 2 - bottomHeight / 2;

  group.add(top, bottom);
  obstacleLayer.add(group);

  obstacles.push({
    group,
    x,
    center,
    gap,
    width: radius * 2,
    passed: false,
  });
}

function createPipePart(height, radius, isTop) {
  const group = new THREE.Group();
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 28), materials.pipe);
  pipe.castShadow = true;
  pipe.receiveShadow = true;
  group.add(pipe);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.2, radius * 1.2, 0.34, 28), materials.pipeRim);
  rim.position.y = isTop ? -height / 2 : height / 2;
  rim.castShadow = true;
  group.add(rim);

  return group;
}

function startGame() {
  resetGame();
  game.state = "playing";
  overlay.classList.add("hidden");
  flap();
}

function resetGame() {
  game.score = 0;
  game.speed = 6.6;
  game.birdY = 1.2;
  game.birdVelocity = 0;
  game.pipeTimer = 0;
  game.elapsed = 0;
  scoreNode.textContent = "0";
  bird.group.position.y = game.birdY;
  bird.group.rotation.set(0, 0, 0);

  for (const obstacle of obstacles) {
    obstacleLayer.remove(obstacle.group);
  }
  obstacles.length = 0;
}

function flap() {
  if (game.state === "ready" || game.state === "gameover") {
    startGame();
    return;
  }
  game.birdVelocity = game.flapVelocity;
}

function endGame() {
  game.state = "gameover";
  if (game.score > game.best) {
    game.best = game.score;
    localStorage.setItem(bestKey, String(game.best));
    bestNode.textContent = game.best;
  }
  setOverlay("Crashed", `Score ${game.score}`, "One more clean flight through the skyline.", "Try again");
  overlay.classList.remove("hidden");
}

function setOverlay(label, title, copy, button) {
  stateLabel.textContent = label;
  stateTitle.textContent = title;
  stateCopy.textContent = copy;
  startButton.textContent = button;
}

function update(delta) {
  game.elapsed += delta;
  updateScenery(delta);

  const wingBeat = Math.sin(game.elapsed * 18) * 0.55;
  bird.wing.rotation.z = -0.55 + wingBeat;

  if (game.state !== "playing") {
    bird.group.position.y = game.birdY + Math.sin(game.elapsed * 2.4) * 0.16;
    bird.group.rotation.z = Math.sin(game.elapsed * 2.4) * 0.06;
    return;
  }

  game.speed = Math.min(9.4, game.speed + delta * 0.035);
  game.pipeTimer -= delta;
  if (game.pipeTimer <= 0) {
    createObstacle();
    game.pipeTimer = game.pipeInterval;
  }

  game.birdVelocity += game.gravity * delta;
  game.birdY += game.birdVelocity * delta;
  bird.group.position.y = game.birdY;
  bird.group.rotation.z = THREE.MathUtils.clamp(game.birdVelocity / 14, -0.9, 0.55);

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    obstacle.x -= game.speed * delta;
    obstacle.group.position.x = obstacle.x;

    if (!obstacle.passed && obstacle.x < bird.group.position.x - obstacle.width) {
      obstacle.passed = true;
      game.score += 1;
      scoreNode.textContent = game.score;
    }

    if (obstacle.x < -13) {
      obstacleLayer.remove(obstacle.group);
      obstacles.splice(i, 1);
      continue;
    }

    if (hitsObstacle(obstacle)) {
      endGame();
      return;
    }
  }

  if (game.birdY < -2.9 || game.birdY > 7.4) {
    endGame();
  }
}

function hitsObstacle(obstacle) {
  const birdX = bird.group.position.x;
  const horizontalHit = Math.abs(obstacle.x - birdX) < obstacle.width / 2 + game.birdRadius * 0.75;
  if (!horizontalHit) return false;

  const inGap = Math.abs(game.birdY - obstacle.center) < obstacle.gap / 2 - game.birdRadius * 0.42;
  return !inGap;
}

function updateScenery(delta) {
  const drift = game.state === "playing" ? game.speed : 1.6;
  world.position.x = -((game.elapsed * drift * 0.23) % 6);

  for (const cloud of clouds) {
    cloud.position.x -= cloud.userData.speed * delta;
    if (cloud.position.x < -24) {
      cloud.position.x = 28 + Math.random() * 8;
      cloud.position.y = 4.7 + Math.random() * 3.2;
    }
  }

  for (const building of buildings) {
    building.position.x -= drift * delta * 0.28;
    if (building.position.x < -28) {
      building.position.x = 35 + Math.random() * 8;
    }
  }
}

function render() {
  const delta = Math.min(clock.getDelta(), 0.033);
  update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.fov = width < 640 ? 54 : 44;
  camera.position.z = width < 640 ? 13.5 : 11.5;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    flap();
  }
});

window.addEventListener("pointerdown", (event) => {
  if (event.target === startButton) return;
  flap();
});

startButton.addEventListener("click", startGame);
render();
