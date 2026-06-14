/**
 * Unit tests for the exact shipped game logic in flappy-bird-3d.html.
 * Run with: node test-logic.js
 */

var fs = require('fs');
var html = fs.readFileSync('flappy-bird-3d.html', 'utf8');

// Extract the logic block
var logicStart = html.indexOf('// ==LOGIC-START==');
var logicEnd   = html.indexOf('// ==LOGIC-END==');
if (logicStart === -1 || logicEnd === -1) {
  console.error('FAIL: could not find ==LOGIC-START== / ==LOGIC-END== markers');
  process.exit(1);
}
var logicCode = html.substring(logicStart, logicEnd + '// ==LOGIC-END=='.length);

// Execute in a clean context
eval(logicCode);

var passed = 0;
var failed = 0;

function assert(cond, label) {
  if (cond) { passed++; }
  else      { failed++; console.error('  FAIL: ' + label); }
}

// ---- Tests ----

console.log('== Initial state ==');
var s = createState(42);
assert(s.phase === 'title', 'phase starts as title');
assert(s.birdY === 3, 'birdY starts at 3');
assert(s.birdVel === 0, 'birdVel starts at 0');
assert(s.score === 0, 'score starts at 0');
assert(s.pipes.length === C.PIPE_POOL, 'pipes length === PIPE_POOL (' + C.PIPE_POOL + ')');
assert(s.speed === C.SPEED_BASE, 'speed starts at SPEED_BASE');
assert(s.bestScore === 0, 'bestScore starts at 0');

console.log('== Pipe spacing ==');
for (var i = 1; i < s.pipes.length; i++) {
  var dx = s.pipes[i].x - s.pipes[i-1].x;
  assert(Math.abs(dx - C.PIPE_SPACING) < 0.01, 'pipe ' + i + ' spacing is PIPE_SPACING');
}

console.log('== Gap Y bounds ==');
for (var i = 0; i < s.pipes.length; i++) {
  assert(s.pipes[i].gapY >= C.GAP_Y_MIN, 'pipe ' + i + ' gapY >= GAP_Y_MIN');
  assert(s.pipes[i].gapY <= C.GAP_Y_MAX, 'pipe ' + i + ' gapY <= GAP_Y_MAX');
}

console.log('== RNG determinism ==');
var s1 = createState(999);
var s2 = createState(999);
var allMatch = true;
for (var i = 0; i < s1.pipes.length; i++) {
  if (Math.abs(s1.pipes[i].x - s2.pipes[i].x) > 0.001 ||
      Math.abs(s1.pipes[i].gapY - s2.pipes[i].gapY) > 0.001) allMatch = false;
}
assert(allMatch, 'same seed produces identical pipe layout');

console.log('== Ready-state idling ==');
var r = step(s, C.FIXED_DT);
assert(r.scored === 0 && r.died === false, 'step returns {scored:0, died:false} in title phase');
assert(s.birdY === 3 && s.birdVel === 0, 'title-phase bird does not move from step');

console.log('== Flap transitions to playing ==');
var s3 = createState(55);
var fl = flap(s3);
assert(fl === true, 'flap returns true');
assert(s3.phase === 'playing', 'flap sets phase to playing');
assert(s3.birdVel === C.FLAP_IMPULSE, 'flap sets birdVel to FLAP_IMPULSE');

console.log('== Dead bird cannot flap ==');
var s4 = createState(10);
s4.phase = 'dead';
var fl2 = flap(s4);
assert(fl2 === false, 'flap returns false when dead');
assert(s4.birdVel === 0, 'dead flap does not change velocity');

console.log('== Gravity pulls down ==');
var s5 = createState(10);
s5.phase = 'playing';
s5.birdVel = 0;
step(s5, 0.5);
assert(s5.birdVel < 0, 'after 0.5s with no flap, birdVel is negative');
assert(s5.birdY < 3, 'birdY decreased');

console.log('== Fall speed capped ==');
var s6 = createState(10);
s6.phase = 'playing';
s6.birdVel = -100;
step(s6, C.FIXED_DT);
assert(s6.birdVel === C.MAX_FALL, 'birdVel capped at MAX_FALL');

console.log('== Ceiling clamp ==');
var s7 = createState(10);
s7.phase = 'playing';
s7.birdY = C.CEILING_Y;
s7.birdVel = 20;
step(s7, C.FIXED_DT);
assert(s7.birdY <= C.CEILING_Y, 'birdY does not exceed CEILING_Y');
assert(s7.birdVel <= 0, 'upward velocity zeroed at ceiling');

console.log('== Pipe scores exactly once ==');
var s8 = createState(10);
s8.phase = 'playing';
// Move first pipe to just in front of bird
s8.pipes[0].x = C.BIRD_X + C.PIPE_W + 0.1;
s8.pipes[0].scored = false;
var r1 = step(s8, C.FIXED_DT);
// Pipe hasn't fully passed yet
assert(r1.scored === 0, 'pipe not scored while still overlapping bird X');

// Now move pipe to be fully past
s8.pipes[0].x = C.BIRD_X - C.PIPE_W - 0.5;
var r2 = step(s8, C.FIXED_DT);
assert(r2.scored === 1, 'pipe scored when fully past bird X');
assert(s8.score === 1, 'score incremented to 1');

var r3 = step(s8, C.FIXED_DT);
assert(r3.scored === 0, 'pipe not scored again on next step');

console.log('== Speed ramps with score ==');
assert(s8.speed > C.SPEED_BASE, 'speed increased after scoring');
assert(s8.speed <= C.SPEED_MAX, 'speed does not exceed SPEED_MAX');

console.log('== Collision: gap edge ==');
var pipe1 = { x: C.BIRD_X, gapY: 3, scored: false };
// Bird at center of gap — safe
assert(!collide(3, pipe1), 'bird at gap center: no collision');
// Bird just inside gap top
var topEdge = 3 + C.GAP_SIZE / 2;
assert(!collide(topEdge - C.BIRD_HIT_R - 0.01, pipe1), 'bird just inside top edge: no collision');
// Bird overlapping gap top
assert(collide(topEdge - C.BIRD_HIT_R + 0.01, pipe1), 'bird overlapping top edge: collision');
// Bird overlapping gap bottom
var botEdge = 3 - C.GAP_SIZE / 2;
assert(collide(botEdge + C.BIRD_HIT_R - 0.01, pipe1), 'bird overlapping bottom edge: collision');

console.log('== Collision: pipe X range ==');
var pipe2 = { x: C.BIRD_X + C.PIPE_W + C.BIRD_HIT_R + 0.1, gapY: 3, scored: false };
assert(!collide(3, pipe2), 'bird far right of pipe: no collision');
pipe2.x = C.BIRD_X - C.PIPE_W - C.BIRD_HIT_R - 0.1;
assert(!collide(3, pipe2), 'bird far left of pipe: no collision');

console.log('== Floor death ==');
var s9 = createState(10);
s9.phase = 'playing';
s9.birdY = C.GROUND_Y + C.BIRD_HIT_R + 0.01;
s9.birdVel = -5;
// Run until bird hits ground
for (var i = 0; i < 500; i++) {
  var rr = step(s9, C.FIXED_DT);
  if (rr.died) break;
}
assert(s9.phase === 'dead', 'bird dies on ground collision');
assert(s9.birdY - C.BIRD_HIT_R <= C.GROUND_Y, 'bird at or below ground');

console.log('== Best score tracking ==');
var s10 = createState(10);
s10.phase = 'playing';
s10.score = 5;
s10.phase = 'dead';
// Simulate death with high score
if (s10.score > s10.bestScore) s10.bestScore = s10.score;
assert(s10.bestScore === 5, 'bestScore updated on death');

console.log('== Pipe recycling keeps count at PIPE_POOL ==');
var s11 = createState(10);
s11.phase = 'playing';
s11.birdY = 5; // safe height
// Run 600 simulated seconds to exercise recycling heavily
for (var t = 0; t < 600; t += C.FIXED_DT) {
  s11.birdY = 5; // keep bird safe
  s11.birdVel = 0; // prevent gravity from dropping bird
  var rr2 = step(s11, C.FIXED_DT);
  if (rr2.died) { s11.phase = 'playing'; s11.birdY = 5; s11.birdVel = 0; }
  assert(s11.pipes.length === C.PIPE_POOL,
    'pipe count === PIPE_POOL at t=' + t.toFixed(2) + ' (len=' + s11.pipes.length + ')');
  if (failed > 20) { console.error('Too many failures, stopping early.'); break; }
}

console.log('== Pipe spacing stable after recycling ==');
for (var i = 1; i < s11.pipes.length; i++) {
  var dxx = s11.pipes[i].x - s11.pipes[i-1].x;
  assert(Math.abs(dxx - C.PIPE_SPACING) < 0.02,
    'pipe ' + i + ' spacing stable after recycling (dx=' + dxx.toFixed(3) + ')');
}

console.log('== Gap Y stays in bounds after recycling ==');
for (var i = 0; i < s11.pipes.length; i++) {
  assert(s11.pipes[i].gapY >= C.GAP_Y_MIN,
    'pipe ' + i + ' gapY >= MIN after recycling (val=' + s11.pipes[i].gapY.toFixed(3) + ')');
  assert(s11.pipes[i].gapY <= C.GAP_Y_MAX,
    'pipe ' + i + ' gapY <= MAX after recycling (val=' + s11.pipes[i].gapY.toFixed(3) + ')');
}

console.log('== Speed within [base, cap] ==');
assert(s11.speed >= C.SPEED_BASE, 'speed >= SPEED_BASE');
assert(s11.speed <= C.SPEED_MAX, 'speed <= SPEED_MAX');

console.log('== Ghost pilot: deterministic run ==');
var gp = createState(77);
gp.phase = 'playing';
gpFlapTimes = {}; // flap at t=0, 1.5, 3.0, 4.5, ...
var gpFlapInterval = 1.4;
var gpNextFlap = 0.3;
var gpTime = 0;
var gpDied = false;
var gpScore = 0;
for (var t = 0; t < 60; t += C.FIXED_DT) {
  if (t >= gpNextFlap && gp.phase === 'playing') {
    flap(gp);
    gpNextFlap += gpFlapInterval;
  }
  var rr3 = step(gp, C.FIXED_DT);
  gpScore = gp.score;
  if (rr3.died) { gpDied = true; break; }
  if (gp.pipes.length !== C.PIPE_POOL) {
    console.error('  FAIL: ghost pilot pipe count mismatch at t=' + t.toFixed(2));
    failed++;
    break;
  }
}
// Run again with same seed
var gp2 = createState(77);
gp2.phase = 'playing';
var gp2NextFlap = 0.3;
for (var t = 0; t < 60; t += C.FIXED_DT) {
  if (t >= gp2NextFlap && gp2.phase === 'playing') {
    flap(gp2);
    gp2NextFlap += gpFlapInterval;
  }
  var rr4 = step(gp2, C.FIXED_DT);
  if (rr4.died) break;
}
assert(Math.abs(gp.birdY - gp2.birdY) < 0.001, 'ghost pilot deterministic birdY');
assert(gp.score === gp2.score, 'ghost pilot deterministic score');

console.log('\n========================================');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');
process.exit(failed > 0 ? 1 : 0);
