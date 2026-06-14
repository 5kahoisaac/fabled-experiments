/* ==LOGIC-START== */
'use strict';
/* Pure game logic: no DOM, no THREE. Deterministic with a seed, so the exact
   code shipped here is unit-tested headlessly in Node. */
var C = {
  GRAVITY: -23, FLAP_VY: 7.6, MAX_FALL: -13,
  BIRD_X: -3, BIRD_R: 0.42,
  PIPE_R: 1.05, GAP: 4.0, PIPE_SPACING: 6.8,
  SPAWN_X: 24, DESPAWN_X: -16, FIRST_PIPE_X: 14,
  GAP_MIN: 2.9, GAP_MAX: 7.4, GAP_MAX_STEP: 2.6,
  GROUND_Y: 0, CEIL_Y: 10.4,
  SPEED0: 5.2, SPEED_RAMP: 0.07, SPEED_MAX: 9,
  READY_Y: 4.6, DT: 1 / 120
};

function makeRng(seed) {
  var t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    var r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function nextGapY(prevGapY, rng) {
  var lo = Math.max(C.GAP_MIN, prevGapY - C.GAP_MAX_STEP);
  var hi = Math.min(C.GAP_MAX, prevGapY + C.GAP_MAX_STEP);
  return lo + (hi - lo) * rng();
}

function createState(seed) {
  var rng = makeRng(seed === undefined ? (Date.now() & 0xffffffff) : seed);
  var pipes = [];
  var gy = 5.1;
  for (var x = C.FIRST_PIPE_X; x <= C.SPAWN_X; x += C.PIPE_SPACING) {
    gy = nextGapY(gy, rng);
    pipes.push({ x: x, gapY: gy, scored: false });
  }
  return {
    status: 'ready', time: 0,
    birdY: C.READY_Y, birdVY: 0,
    pipes: pipes, speed: C.SPEED0, score: 0, rng: rng
  };
}

function flap(s) {
  if (s.status === 'ready') s.status = 'playing';
  if (s.status !== 'playing') return;
  s.birdVY = C.FLAP_VY;
}

function collide(birdY, pipe) {
  var inSlab = Math.abs(C.BIRD_X - pipe.x) < (C.PIPE_R + C.BIRD_R);
  if (!inSlab) return false;
  var top = pipe.gapY + C.GAP / 2;
  var bot = pipe.gapY - C.GAP / 2;
  return (birdY + C.BIRD_R > top) || (birdY - C.BIRD_R < bot);
}

/* Advances the simulation by dt seconds. Returns events for the renderer:
   { scored: <int pipes passed this step>, died: <bool death happened this step> } */
function step(s, dt) {
  var ev = { scored: 0, died: false };
  s.time += dt;

  if (s.status === 'ready') {
    s.birdY = C.READY_Y + Math.sin(s.time * 3) * 0.18;
    return ev;
  }

  s.birdVY = Math.max(C.MAX_FALL, s.birdVY + C.GRAVITY * dt);
  s.birdY += s.birdVY * dt;
  if (s.birdY + C.BIRD_R > C.CEIL_Y) {
    s.birdY = C.CEIL_Y - C.BIRD_R;
    s.birdVY = Math.min(s.birdVY, 0);
  }

  if (s.status === 'dead') {
    if (s.birdY - C.BIRD_R < C.GROUND_Y) {
      s.birdY = C.GROUND_Y + C.BIRD_R;
      s.birdVY = 0;
    }
    return ev;
  }

  for (var i = 0; i < s.pipes.length; i++) s.pipes[i].x -= s.speed * dt;
  while (s.pipes.length && s.pipes[0].x < C.DESPAWN_X) s.pipes.shift();
  var last = s.pipes[s.pipes.length - 1];
  while (!last || last.x < C.SPAWN_X - C.PIPE_SPACING) {
    var nx = last ? last.x + C.PIPE_SPACING : C.FIRST_PIPE_X;
    var ng = nextGapY(last ? last.gapY : 5.1, s.rng);
    s.pipes.push({ x: nx, gapY: ng, scored: false });
    last = s.pipes[s.pipes.length - 1];
  }

  for (var j = 0; j < s.pipes.length; j++) {
    var p = s.pipes[j];
    if (!p.scored && (p.x + C.PIPE_R) < (C.BIRD_X - C.BIRD_R)) {
      p.scored = true;
      s.score += 1;
      ev.scored += 1;
      s.speed = Math.min(C.SPEED_MAX, C.SPEED0 + s.score * C.SPEED_RAMP);
    }
    if (collide(s.birdY, p)) {
      s.status = 'dead';
      ev.died = true;
    }
  }

  if (s.birdY - C.BIRD_R <= C.GROUND_Y) {
    s.birdY = C.GROUND_Y + C.BIRD_R;
    s.status = 'dead';
    ev.died = true;
  }
  return ev;
}

var GameLogic = {
  C: C, makeRng: makeRng, nextGapY: nextGapY,
  createState: createState, flap: flap, collide: collide, step: step
};
if (typeof module !== 'undefined' && module.exports) { module.exports = GameLogic; }
/* ==LOGIC-END== */
