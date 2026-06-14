import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import {
  addLights,
  createBird,
  createPipePair,
  createWorld,
  makeGradientTexture,
} from "./world.js";

const canvas = document.querySelector("#scene");
const scoreNode = document.querySelector("#score");
const panel = document.querySelector("#panel");
const startButton = document.querySelector("#start");
const restartButton = document.querySelector("#restart");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x7fc9ff, 34, 82);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
camera.position.set(0, 2.4, 15);
camera.lookAt(0, 1.3, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();

const game = {
  state: "ready",
  score: 0,
  speed: 6.6,
  gravity: -18,
  flapVelocity: 7.4,
  birdY: 2.2,
  birdVelocity: 0,
  pipeTimer: 0,
  pipeCount: 0,
};

const birdRadius = 0.48;
const pipeGap = 5.2;
const pipeWidth = 1.35;
const pipeDepth = 2.2;
const pipeStartX = 13;
const pipeEndX = -14;
const pipes = [];

scene.background = makeGradientTexture();

const bird = createBird();
const world = createWorld();
scene.add(bird, world.root);

function makePipePair() {
  const centerY = game.pipeCount === 0 ? 1.35 : THREE.MathUtils.randFloat(0.7, 1.85);
  const group = createPipePair(centerY, pipeGap, pipeWidth, pipeDepth);
  group.position.x = pipeStartX;
  scene.add(group);
  pipes.push({ group, centerY, scored: false });
  game.pipeCount += 1;
}

function resetGame() {
  for (const pipe of pipes.splice(0)) scene.remove(pipe.group);
  game.state = "playing";
  game.score = 0;
  game.speed = 6.6;
  game.birdY = 2.2;
  game.birdVelocity = 0;
  game.pipeTimer = 1.05;
  game.pipeCount = 0;
  scoreNode.textContent = "0";
  panel.classList.add("is-hidden");
  bird.position.set(-5.4, game.birdY, 0);
  bird.rotation.set(0, 0, 0);
}

function finishGame() {
  game.state = "ended";
  panel.querySelector("h1").textContent = "Score " + game.score;
  panel.querySelector("p").textContent = "Press Space, click, or tap to try again.";
  startButton.textContent = "Again";
  panel.classList.remove("is-hidden");
}

function flap() {
  if (game.state !== "playing") {
    resetGame();
    return;
  }
  game.birdVelocity = game.flapVelocity;
}

function updatePipes(delta) {
  game.pipeTimer -= delta;
  if (game.pipeTimer <= 0) {
    makePipePair();
    game.pipeTimer = THREE.MathUtils.randFloat(1.34, 1.7);
  }

  for (let index = pipes.length - 1; index >= 0; index -= 1) {
    const pipe = pipes[index];
    pipe.group.position.x -= game.speed * delta;

    if (!pipe.scored && pipe.group.position.x < bird.position.x - pipeWidth) {
      pipe.scored = true;
      game.score += 1;
      game.speed = Math.min(12, game.speed + 0.18);
      scoreNode.textContent = String(game.score);
    }

    if (pipe.group.position.x < pipeEndX) {
      scene.remove(pipe.group);
      pipes.splice(index, 1);
    }
  }
}

function updateWorld(delta, elapsed) {
  for (const tile of world.groundTiles) {
    tile.position.x -= game.speed * delta;
    if (tile.position.x < -24) tile.position.x += 48;
  }
  for (const cloud of world.clouds) {
    cloud.position.x -= delta * (0.7 + cloud.scale.x);
    if (cloud.position.x < -25) cloud.position.x = 34;
  }

  const wingBeat = Math.sin(elapsed * 18) * 0.55;
  bird.getObjectByName("leftWing").rotation.x = wingBeat;
  bird.getObjectByName("rightWing").rotation.x = -wingBeat;
}

function checkCollision() {
  if (game.birdY < -1.95 || game.birdY > 6.2) return true;

  for (const pipe of pipes) {
    const dx = Math.abs(pipe.group.position.x - bird.position.x);
    if (dx > pipeWidth * 0.5 + birdRadius) continue;
    const outsideGap = Math.abs(game.birdY - pipe.centerY) > pipeGap * 0.5 - birdRadius;
    if (outsideGap) return true;
  }
  return false;
}

function updateBird(delta) {
  if (game.state === "playing") {
    game.birdVelocity += game.gravity * delta;
    game.birdY += game.birdVelocity * delta;
    bird.position.y = game.birdY;
    bird.rotation.z = THREE.MathUtils.clamp(game.birdVelocity / 13, -0.78, 0.52);
    bird.rotation.y = Math.sin(clock.elapsedTime * 2.4) * 0.08;
    if (checkCollision()) finishGame();
  } else {
    bird.position.y = 2.15 + Math.sin(clock.elapsedTime * 2.6) * 0.22;
    bird.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.12;
  }
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;
  if (game.state === "playing") updatePipes(delta);
  updateWorld(delta, elapsed);
  updateBird(delta);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, bird.position.y * 0.11 + 2.4, 0.04);
  camera.lookAt(0, 1.35, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      flap();
    }
  });
  canvas.addEventListener("pointerdown", flap);
  startButton.addEventListener("click", resetGame);
  restartButton.addEventListener("click", resetGame);
  window.addEventListener("resize", resize);
}

addLights(scene);
bird.position.set(-5.4, game.birdY, 0);
bindControls();
resize();
animate();
