import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

export function makeGradientTexture() {
  const sky = document.createElement("canvas");
  sky.width = 32;
  sky.height = 256;
  const ctx = sky.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, sky.height);
  gradient.addColorStop(0, "#6fc7ff");
  gradient.addColorStop(0.48, "#78d7d3");
  gradient.addColorStop(1, "#ffe09b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, sky.width, sky.height);

  const texture = new THREE.CanvasTexture(sky);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x256d76, 2.8));

  const sun = new THREE.DirectionalLight(0xfff2cf, 2.8);
  sun.position.set(-8, 13, 8);
  sun.castShadow = true;
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
}

export function createBird() {
  const bird = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd24a,
    roughness: 0.45,
    metalness: 0.05,
  });
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xff7c45 });
  const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xff8a2b });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x101522 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 24), bodyMaterial);
  body.scale.set(1.15, 0.92, 0.86);
  body.castShadow = true;
  bird.add(body);

  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0xfff4b8, roughness: 0.62 }),
  );
  belly.position.set(-0.1, -0.16, 0.34);
  belly.scale.set(1, 0.78, 0.35);
  bird.add(belly);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.58, 4), beakMaterial);
  beak.position.set(0.58, 0.03, 0);
  beak.rotation.z = -Math.PI / 2;
  bird.add(beak);

  for (const z of [-0.32, 0.32]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), eyeMaterial);
    eye.position.set(0.33, 0.23, z);
    bird.add(eye);
  }

  const wingGeometry = new THREE.BoxGeometry(0.15, 0.58, 0.82);
  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.name = "leftWing";
  rightWing.name = "rightWing";
  leftWing.position.set(-0.22, -0.05, -0.55);
  rightWing.position.set(-0.22, -0.05, 0.55);
  bird.add(leftWing, rightWing);

  return bird;
}

export function createWorld() {
  const clouds = [];
  const groundTiles = [];
  const root = new THREE.Group();

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 44),
    new THREE.MeshStandardMaterial({ color: 0x1d95bf, roughness: 0.7, metalness: 0.05 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(22, -2.95, 0);
  water.receiveShadow = true;
  root.add(water);

  const tileGeometry = new THREE.BoxGeometry(6, 0.34, 10);
  const tileMaterial = new THREE.MeshStandardMaterial({ color: 0x49b66d, roughness: 0.85 });
  for (let i = 0; i < 8; i += 1) {
    const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    tile.position.set(-18 + i * 6, -2.62, 0);
    tile.receiveShadow = true;
    groundTiles.push(tile);
    root.add(tile);
  }

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    transparent: true,
    opacity: 0.78,
  });
  for (let i = 0; i < 14; i += 1) {
    const cloud = new THREE.Group();
    for (let p = 0; p < 3 + (i % 3); p += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.7 + p * 0.08, 16, 12), cloudMaterial);
      puff.position.set(p * 0.72, Math.sin(p) * 0.12, (p % 2) * 0.25);
      cloud.add(puff);
    }
    cloud.position.set(-18 + i * 5.4, 4.8 + (i % 4) * 0.75, -8 - (i % 3) * 2);
    cloud.scale.setScalar(0.7 + (i % 4) * 0.12);
    clouds.push(cloud);
    root.add(cloud);
  }

  return { root, clouds, groundTiles };
}

export function createPipePair(centerY, pipeGap, pipeWidth, pipeDepth) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x18a86b,
    roughness: 0.38,
    metalness: 0.06,
  });
  const capMaterial = new THREE.MeshStandardMaterial({ color: 0x23d083, roughness: 0.3 });
  const group = new THREE.Group();
  const topHeight = 8;
  const bottomHeight = 8;

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(pipeWidth, bottomHeight, pipeDepth), material);
  bottom.position.y = centerY - pipeGap / 2 - bottomHeight / 2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(pipeWidth, topHeight, pipeDepth), material);
  top.position.y = centerY + pipeGap / 2 + topHeight / 2;
  const bottomCap = new THREE.Mesh(new THREE.BoxGeometry(pipeWidth * 1.26, 0.42, pipeDepth * 1.12), capMaterial);
  bottomCap.position.y = centerY - pipeGap / 2;
  const topCap = new THREE.Mesh(new THREE.BoxGeometry(pipeWidth * 1.26, 0.42, pipeDepth * 1.12), capMaterial);
  topCap.position.y = centerY + pipeGap / 2;

  for (const mesh of [bottom, top, bottomCap, topCap]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}
