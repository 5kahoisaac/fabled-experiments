'use strict';
(function () {
  var fatalEl = document.getElementById('fatal');
  var fatalMsg = document.getElementById('fatal-msg');
  function showFatal(msg) {
    fatalMsg.textContent = msg;
    fatalEl.style.display = 'flex';
  }
  if (typeof THREE === 'undefined') {
    showFatal('Three.js could not load from the CDN. Check your internet connection, then reload this page.');
    return;
  }

  var C = GameLogic.C;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- renderer / scene / camera ---------- */
  var canvas = document.getElementById('scene');
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  } catch (e) {
    showFatal('WebGL is unavailable in this browser, so the 3D scene cannot start. Try a current version of Chrome, Edge, Firefox, or Safari.');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf2a087, 26, 72);

  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(-2.2, 4.3, 13.5);
  camera.lookAt(new THREE.Vector3(1.6, 4.4, 0));

  /* ---------- sky: vertical sunset gradient on a canvas texture ---------- */
  (function buildSky() {
    var c = document.createElement('canvas');
    c.width = 2; c.height = 512;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.00, '#6D5BD0');
    grad.addColorStop(0.45, '#E98AA0');
    grad.addColorStop(0.78, '#FFB48C');
    grad.addColorStop(1.00, '#FFD9A6');
    g.fillStyle = grad;
    g.fillRect(0, 0, 2, 512);
    var tex = new THREE.CanvasTexture(c);
    scene.background = tex;
  })();

  /* ---------- lights ---------- */
  var hemi = new THREE.HemisphereLight(0xffe2c4, 0xb87a96, 0.85);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffd9b0, 1.15);
  sun.position.set(-9, 13, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 70;
  sun.shadow.camera.left = -24;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 24;
  sun.shadow.camera.bottom = -6;
  scene.add(sun);

  /* glowing sun disc on the horizon */
  var sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(4.6, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffeec2, fog: false })
  );
  sunDisc.position.set(-24, 9, -46);
  scene.add(sunDisc);

  function mat(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: true, roughness: 0.92, metalness: 0 });
  }

  /* ---------- ground: scrolling striped sand ---------- */
  var groundTex;
  (function buildGround() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#F6DFAF';
    g.fillRect(0, 0, 256, 64);
    g.fillStyle = '#EBC894';
    g.fillRect(0, 0, 128, 64);
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.fillRect(120, 0, 8, 64);
    groundTex = new THREE.CanvasTexture(c);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(10, 1);
    var gmat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1, metalness: 0 });
    var ground = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 12), gmat);
    ground.position.set(4, C.GROUND_Y - 0.6, -1);
    ground.receiveShadow = true;
    scene.add(ground);
  })();

  /* ---------- distant violet dunes for depth ---------- */
  (function buildDunes() {
    var colors = [0xB79BD8, 0xA88AC9, 0xC4A9E3];
    for (var i = 0; i < 6; i++) {
      var d = new THREE.Mesh(new THREE.SphereGeometry(8 + (i % 3) * 3, 10, 8), mat(colors[i % 3]));
      d.scale.y = 0.35;
      d.position.set(-26 + i * 13, 0.4, -26 - (i % 2) * 9);
      scene.add(d);
    }
  })();

  /* ---------- clouds: drifting papercraft puffs ---------- */
  var clouds = [];
  (function buildClouds() {
    var cmat = new THREE.MeshStandardMaterial({ color: 0xFFF4E3, flatShading: true, roughness: 1 });
    for (var i = 0; i < 7; i++) {
      var grp = new THREE.Group();
      var n = 3 + (i % 2);
      for (var k = 0; k < n; k++) {
        var puff = new THREE.Mesh(new THREE.SphereGeometry(0.9 + 0.5 * Math.abs(Math.sin(i * 3 + k * 5)), 8, 7), cmat);
        puff.position.set(k * 1.1 - n * 0.5, (k % 2) * 0.35, 0);
        puff.castShadow = true;
        grp.add(puff);
      }
      var z = -5 - (i % 4) * 4.5;
      grp.position.set(-20 + i * 8, 7.4 + (i % 3) * 1.2, z);
      grp.userData.speed = (reduceMotion ? 0.12 : 0.45) * (1 - Math.abs(z) / 30);
      clouds.push(grp);
      scene.add(grp);
    }
  })();

  /* ---------- bird: round papercraft finch ---------- */
  var bird = new THREE.Group();
  var wingL, wingR;
  (function buildBird() {
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 10), mat(0xFF6F59));
    body.castShadow = true;
    bird.add(body);

    var belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), mat(0xFFE7CC));
    belly.position.set(0.12, -0.13, 0);
    bird.add(belly);

    var beak = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 8), mat(0xFFB13D));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.5, 0.02, 0);
    beak.castShadow = true;
    bird.add(beak);

    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x2E2430, roughness: 0.4 });
    var glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-1, 1].forEach(function (side) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), eyeMat);
      eye.position.set(0.3, 0.16, 0.27 * side);
      bird.add(eye);
      var glint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), glintMat);
      glint.position.set(0.36, 0.2, 0.3 * side);
      bird.add(glint);
    });

    var wingGeo = new THREE.BoxGeometry(0.46, 0.08, 0.5);
    wingGeo.translate(0, 0, 0.28);
    wingL = new THREE.Mesh(wingGeo, mat(0xE4543F));
    wingL.position.set(-0.05, 0.05, 0.3);
    wingL.castShadow = true;
    bird.add(wingL);
    wingR = new THREE.Mesh(wingGeo.clone(), mat(0xE4543F));
    wingR.rotation.y = Math.PI;
    wingR.position.set(-0.05, 0.05, -0.3);
    wingR.castShadow = true;
    bird.add(wingR);

    var tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 6), mat(0xE4543F));
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-0.48, 0.05, 0);
    tail.castShadow = true;
    bird.add(tail);

    bird.position.set(C.BIRD_X, C.READY_Y, 0);
    scene.add(bird);
  })();

  /* ---------- pipe pool ---------- */
  var POOL = 8;
  var pipePool = [];
  (function buildPipes() {
    var bodyMat = mat(0x62C88F);
    var lipMat = mat(0x3FA070);
    for (var i = 0; i < POOL; i++) {
      var grp = new THREE.Group();
      var bottom = new THREE.Mesh(new THREE.CylinderGeometry(C.PIPE_R, C.PIPE_R, 1, 14), bodyMat);
      var top = new THREE.Mesh(new THREE.CylinderGeometry(C.PIPE_R, C.PIPE_R, 1, 14), bodyMat);
      var lipB = new THREE.Mesh(new THREE.CylinderGeometry(C.PIPE_R * 1.24, C.PIPE_R * 1.24, 0.5, 14), lipMat);
      var lipT = lipB.clone();
      [bottom, top, lipB, lipT].forEach(function (m) { m.castShadow = true; m.receiveShadow = true; grp.add(m); });
      grp.userData = { bottom: bottom, top: top, lipB: lipB, lipT: lipT, gapY: null };
      grp.visible = false;
      pipePool.push(grp);
      scene.add(grp);
    }
  })();

  function shapePipe(grp, gapY) {
    var u = grp.userData;
    u.gapY = gapY;
    var gapTop = gapY + C.GAP / 2;
    var gapBot = gapY - C.GAP / 2;
    var bottomH = Math.max(0.2, gapBot - C.GROUND_Y);
    u.bottom.scale.set(1, bottomH, 1);
    u.bottom.position.y = C.GROUND_Y + bottomH / 2;
    var ceilExt = C.CEIL_Y + 4;
    var topH = Math.max(0.2, ceilExt - gapTop);
    u.top.scale.set(1, topH, 1);
    u.top.position.y = gapTop + topH / 2;
    u.lipB.position.y = gapBot - 0.27;
    u.lipT.position.y = gapTop + 0.27;
  }

  function syncPipes(state) {
    for (var i = 0; i < pipePool.length; i++) {
      var grp = pipePool[i];
      if (i < state.pipes.length) {
        var p = state.pipes[i];
        grp.visible = true;
        grp.position.x = p.x;
        if (grp.userData.gapY !== p.gapY) shapePipe(grp, p.gapY);
      } else {
        grp.visible = false;
      }
    }
  }

  /* ---------- flap puff particles ---------- */
  var puffs = [];
  (function buildPuffs() {
    for (var i = 0; i < 10; i++) {
      var m = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
      );
      m.visible = false;
      puffs.push({ mesh: m, life: 0 });
      scene.add(m);
    }
  })();
  var puffIdx = 0;
  function spawnPuffs() {
    if (reduceMotion) return;
    for (var k = 0; k < 3; k++) {
      var p = puffs[puffIdx];
      puffIdx = (puffIdx + 1) % puffs.length;
      p.life = 0.45;
      p.mesh.visible = true;
      p.mesh.material.opacity = 0.85;
      p.mesh.position.set(bird.position.x - 0.3, bird.position.y - 0.25, (k - 1) * 0.25);
      p.mesh.userData = { vx: -1.4 - k * 0.3, vy: -0.8 + k * 0.5 };
    }
  }
  function updatePuffs(d) {
    for (var i = 0; i < puffs.length; i++) {
      var p = puffs[i];
      if (p.life <= 0) continue;
      p.life -= d;
      p.mesh.position.x += p.mesh.userData.vx * d;
      p.mesh.position.y += p.mesh.userData.vy * d;
      p.mesh.material.opacity = Math.max(0, p.life / 0.45) * 0.85;
      if (p.life <= 0) p.mesh.visible = false;
    }
  }

  /* ---------- tiny procedural audio (no assets) ---------- */
  var audio = { ctx: null };
  function audioInit() {
    if (audio.ctx) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audio.ctx = new AC();
    } catch (e) { audio.ctx = null; }
  }
  function blip(freqA, freqB, dur, type, gainV) {
    if (!audio.ctx) return;
    try {
      var t0 = audio.ctx.currentTime;
      var osc = audio.ctx.createOscillator();
      var gain = audio.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqA, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqB), t0 + dur);
      gain.gain.setValueAtTime(gainV, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(audio.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) { /* audio is decorative; never let it break the game */ }
  }
  var sfx = {
    flap: function () { blip(380, 640, 0.09, 'sine', 0.12); },
    score: function () { blip(660, 660, 0.06, 'triangle', 0.14); setTimeout(function () { blip(880, 880, 0.09, 'triangle', 0.14); }, 70); },
    hit: function () { blip(180, 60, 0.22, 'square', 0.16); }
  };

  /* ---------- UI ---------- */
  var ui = {
    score: document.getElementById('score'),
    title: document.getElementById('title-card'),
    over: document.getElementById('gameover'),
    finalScore: document.getElementById('final-score'),
    bestScore: document.getElementById('best-score')
  };
  var best = 0; /* in-memory only: storage APIs are blocked in sandboxed previews */
  var canRestart = false;

  function setScore(n) {
    ui.score.textContent = String(n);
    ui.score.classList.remove('pulse');
    void ui.score.offsetWidth;
    ui.score.classList.add('pulse');
  }

  /* ---------- state ---------- */
  var state = GameLogic.createState();
  syncPipes(state);
  setScoreSilent(0);
  function setScoreSilent(n) { ui.score.textContent = String(n); }

  function startOver() {
    state = GameLogic.createState();
    syncPipes(state);
    setScoreSilent(0);
    ui.over.style.display = 'none';
    ui.title.style.display = 'flex';
    canRestart = false;
    bird.rotation.z = 0;
  }

  function onDied() {
    sfx.hit();
    best = Math.max(best, state.score);
    ui.finalScore.textContent = String(state.score);
    ui.bestScore.textContent = String(best);
    setTimeout(function () {
      ui.over.style.display = 'flex';
      canRestart = true;
    }, 550);
  }

  /* ---------- input ---------- */
  function action() {
    audioInit();
    if (state.status === 'dead') {
      if (canRestart) startOver();
      return;
    }
    if (state.status === 'ready') ui.title.style.display = 'none';
    GameLogic.flap(state);
    sfx.flap();
    spawnPuffs();
    wingPulse = 1;
  }
  window.addEventListener('pointerdown', action);
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      if (!e.repeat) action();
    }
  });

  /* ---------- resize ---------- */
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- main loop: fixed-timestep logic, smooth render ---------- */
  var wingPulse = 0;
  var acc = 0;
  var lastT = performance.now();

  function frame(now) {
    var d = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    acc += d;
    while (acc >= C.DT) {
      var ev = GameLogic.step(state, C.DT);
      if (ev.scored > 0) { setScore(state.score); sfx.score(); }
      if (ev.died) onDied();
      acc -= C.DT;
    }

    /* bird visuals */
    bird.position.y = state.birdY;
    if (state.status === 'dead') {
      if (state.birdY > C.GROUND_Y + C.BIRD_R + 0.01) bird.rotation.z -= 5.5 * d;
    } else {
      var targetTilt = Math.max(-0.55, Math.min(0.5, state.birdVY * 0.062));
      bird.rotation.z += (targetTilt - bird.rotation.z) * Math.min(1, d * 12);
    }
    wingPulse = Math.max(0, wingPulse - d * 2.2);
    var flapAmp = 0.25 + wingPulse * 0.9;
    var w = Math.sin(now * 0.001 * 22) * flapAmp - 0.15;
    wingL.rotation.x = -w;
    wingR.rotation.x = -w;

    /* world visuals */
    syncPipes(state);
    if (state.status === 'playing') {
      groundTex.offset.x += state.speed * d / 7;
    }
    for (var i = 0; i < clouds.length; i++) {
      var cl = clouds[i];
      cl.position.x -= cl.userData.speed * d * (state.status === 'playing' ? 1.6 : 1);
      if (cl.position.x < -30) cl.position.x = 34;
    }
    updatePuffs(d);
    if (!reduceMotion) camera.position.y = 4.3 + Math.sin(now * 0.0006) * 0.06;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener('error', function (e) {
    if (e && e.message) showFatal('Something went wrong while running the game: ' + e.message);
  });
})();
