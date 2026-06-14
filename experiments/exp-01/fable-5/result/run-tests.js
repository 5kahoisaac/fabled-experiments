'use strict';
/* Unit tests for the exact logic block shipped inside flappy-bird-3d.html.
   Run: node test/run-tests.js */

const G = require('./logic.js');
const C = G.C;

let passed = 0, failed = 0;
function ok(cond, name, detail) {
  if (cond) { passed++; console.log('  PASS  ' + name); }
  else { failed++; console.log('  FAIL  ' + name + (detail ? ' — ' + detail : '')); }
}
function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }

/* Ghost pilot: before each step, park the bird exactly at the nearest pipe's
   gap centre with zero velocity. One dt of gravity moves it ~0.0008 units, so
   it can never collide — lets us run long deterministic simulations. */
function ghostStep(s) {
  let nearest = null, bestDx = Infinity;
  for (const p of s.pipes) {
    const dx = Math.abs(p.x - C.BIRD_X);
    if (dx < bestDx) { bestDx = dx; nearest = p; }
  }
  if (nearest) { s.birdY = nearest.gapY; s.birdVY = 0; }
  return G.step(s, C.DT);
}

console.log('T1 createState shape');
{
  const s = G.createState(42);
  ok(s.status === 'ready', 'starts in ready');
  ok(approx(s.birdY, C.READY_Y), 'bird starts at READY_Y');
  ok(s.score === 0 && s.speed === C.SPEED0, 'score 0, base speed');
  ok(s.pipes.length >= 2, 'spawns initial pipes', 'got ' + s.pipes.length);
  ok(s.pipes.every(p => p.gapY >= C.GAP_MIN && p.gapY <= C.GAP_MAX), 'all gaps within bounds');
  let spacingOk = true;
  for (let i = 1; i < s.pipes.length; i++) {
    if (!approx(s.pipes[i].x - s.pipes[i - 1].x, C.PIPE_SPACING, 1e-9)) spacingOk = false;
  }
  ok(spacingOk, 'initial pipes evenly spaced');
}

console.log('T2 ready state idles safely');
{
  const s = G.createState(7);
  for (let i = 0; i < 240; i++) G.step(s, C.DT);
  ok(s.status === 'ready' && s.score === 0, 'no progress while ready');
  ok(Math.abs(s.birdY - C.READY_Y) <= 0.2, 'bird bobs near READY_Y');
}

console.log('T3 flap starts the game and lifts');
{
  const s = G.createState(7);
  G.flap(s);
  ok(s.status === 'playing', 'ready -> playing on first flap');
  ok(s.birdVY === C.FLAP_VY, 'flap sets upward velocity');
}

console.log('T4 gravity pulls the bird down');
{
  const s = G.createState(7);
  G.flap(s);
  const y0 = s.birdY;
  for (let i = 0; i < 72; i++) G.step(s, C.DT); // 0.6s: mid-fall, still airborne
  ok(s.birdVY < 0, 'velocity turns negative without flapping');
  ok(s.status === 'playing', 'still airborne at the mid-fall sample point');
  for (let i = 0; i < 108; i++) G.step(s, C.DT); // out to 1.5s total
  ok(s.birdVY >= C.MAX_FALL, 'fall speed is capped');
  ok(s.birdY < y0 || s.status === 'dead', 'bird ends lower (or already dead on the floor)');
}

console.log('T5 scoring: passing a pipe scores exactly once and ramps speed');
{
  const s = G.createState(7);
  s.status = 'playing';
  s.pipes = [{ x: C.BIRD_X - C.BIRD_R - C.PIPE_R + 0.001, gapY: 5, scored: false }];
  s.birdY = 5; s.birdVY = 0;
  const ev = G.step(s, C.DT);
  ok(ev.scored === 1 && s.score === 1, 'score increments when pipe clears the bird');
  ok(approx(s.speed, Math.min(C.SPEED_MAX, C.SPEED0 + C.SPEED_RAMP), 1e-9), 'speed ramps with score');
  const before = s.score;
  G.step(s, C.DT);
  ok(s.score === before, 'same pipe never scores twice');
}

console.log('T6 collision geometry (pure collide)');
{
  const pipe = { x: C.BIRD_X, gapY: 5, scored: true };
  ok(G.collide(5, pipe) === false, 'centre of gap is safe');
  ok(G.collide(5 + C.GAP / 2, pipe) === true, 'touching gap top kills');
  ok(G.collide(5 - C.GAP / 2, pipe) === true, 'touching gap bottom kills');
  const farPipe = { x: C.BIRD_X + C.PIPE_R + C.BIRD_R + 0.01, gapY: 5, scored: false };
  ok(G.collide(9, farPipe) === false, 'outside the slab never collides');
}

console.log('T7 pipe collision kills via step');
{
  const s = G.createState(7);
  s.status = 'playing';
  s.pipes = [{ x: C.BIRD_X, gapY: 8, scored: false }];
  s.birdY = 3; s.birdVY = 0; // well below the gap -> inside bottom pipe
  const ev = G.step(s, C.DT);
  ok(ev.died === true && s.status === 'dead', 'inside pipe body -> dead');
}

console.log('T8 floor kills, bird rests on the ground');
{
  const s = G.createState(7);
  s.status = 'playing';
  s.pipes = [];
  s.birdY = C.GROUND_Y + C.BIRD_R + 0.01; s.birdVY = -5;
  const ev = G.step(s, C.DT);
  ok(ev.died === true && s.status === 'dead', 'hitting the ground kills');
  ok(approx(s.birdY, C.GROUND_Y + C.BIRD_R, 1e-6), 'bird clamped onto the ground');
  for (let i = 0; i < 120; i++) G.step(s, C.DT);
  ok(approx(s.birdY, C.GROUND_Y + C.BIRD_R, 1e-6), 'dead bird stays on the ground');
}

console.log('T9 ceiling clamps without killing');
{
  const s = G.createState(7);
  s.status = 'playing';
  s.pipes = [];
  s.birdY = C.CEIL_Y - C.BIRD_R - 0.01; s.birdVY = 12;
  G.step(s, C.DT);
  ok(s.birdY <= C.CEIL_Y - C.BIRD_R + 1e-9, 'bird never leaves the ceiling');
  ok(s.birdVY <= 0, 'upward velocity cancelled at ceiling');
  ok(s.status === 'playing', 'ceiling contact is not fatal');
}

console.log('T10 long run: spawning, recycling, bounded pool, cap');
{
  const s = G.createState(42);
  G.flap(s);
  let died = false, maxPipes = 0;
  for (let i = 0; i < 7200; i++) { // 60 simulated seconds
    const ev = ghostStep(s);
    if (ev.died) died = true;
    maxPipes = Math.max(maxPipes, s.pipes.length);
    const xs = s.pipes.map(p => p.x);
    for (let k = 1; k < xs.length; k++) {
      if (!approx(xs[k] - xs[k - 1], C.PIPE_SPACING, 1e-6)) {
        died = true; console.log('  spacing drifted at step ' + i);
      }
    }
  }
  ok(!died, 'ghost pilot survives 60s (no false collisions, spacing stable)');
  ok(s.score >= 20, 'score accumulates over a long run', 'score=' + s.score);
  ok(maxPipes <= 8, 'pipe count never exceeds the render pool of 8', 'max=' + maxPipes);
  ok(s.pipes.every(p => p.x > C.DESPAWN_X - 1 && p.x < C.SPAWN_X + C.PIPE_SPACING), 'pipes live inside the world window');
  ok(s.speed <= C.SPEED_MAX + 1e-9 && s.speed >= C.SPEED0, 'speed stays within [SPEED0, SPEED_MAX]');
  ok(s.pipes.every(p => p.gapY >= C.GAP_MIN && p.gapY <= C.GAP_MAX), 'spawned gaps stay within bounds');
}

console.log('T11 determinism with a fixed seed');
{
  const run = () => {
    const s = G.createState(1234);
    G.flap(s);
    for (let i = 0; i < 3600; i++) ghostStep(s);
    return s.score + '|' + s.pipes.map(p => p.x.toFixed(5) + ':' + p.gapY.toFixed(5)).join(',');
  };
  ok(run() === run(), 'identical seeds + inputs give identical worlds');
}

console.log('T12 flapping while dead does nothing');
{
  const s = G.createState(7);
  s.status = 'dead';
  const vy = s.birdVY;
  G.flap(s);
  ok(s.status === 'dead' && s.birdVY === vy, 'no zombie flaps');
}

console.log('');
console.log('RESULT: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
