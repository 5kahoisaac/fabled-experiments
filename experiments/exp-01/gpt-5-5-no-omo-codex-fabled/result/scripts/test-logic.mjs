import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const match = html.match(/\/\* ==LOGIC-START== \*\/([\s\S]*?)\/\* ==LOGIC-END== \*\//);
assert.ok(match, "logic block markers exist");

const context = { globalThis: {} };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(match[1], context, { filename: "index.html#game-logic" });

const logic = context.GameLogic;
assert.ok(logic, "GameLogic is exposed");
assert.equal(logic.C.maxPipes, 8);

const rngA = logic.makeRng(123);
const rngB = logic.makeRng(123);
assert.equal(rngA(), rngB(), "seeded RNG is deterministic");

const state = logic.createState(123);
assert.equal(state.status, "ready");
assert.equal(state.pipes.length, logic.C.maxPipes);
assert.equal(state.score, 0);
assert.ok(state.pipes.every((pipe) => Number.isFinite(pipe.x) && Number.isFinite(pipe.gapY)));

logic.start(state);
assert.equal(state.status, "playing");
assert.equal(state.birdV, logic.C.flapVelocity);

const clearPipe = { x: 0, gapY: state.birdY };
assert.equal(logic.collide(state.birdY, clearPipe), false, "bird fits through centered gap");
const blockedPipe = { x: 0, gapY: state.birdY + logic.C.gapHeight };
assert.equal(logic.collide(state.birdY, blockedPipe), true, "bird collides outside gap");

state.birdY = 0;
state.birdV = 0;
state.pipes[0].x = -logic.C.gateWidth * 0.5 + 0.01;
state.pipes[0].gapY = 0;
const scoreResult = logic.step(state, 1 / 120);
assert.equal(scoreResult.scored, 1, "passing a gate increments score");
assert.equal(state.score, 1);
assert.ok(state.pipes.length <= logic.C.maxPipes, "pipe pool stays bounded");

const crash = logic.createState(999);
logic.start(crash);
crash.birdY = logic.C.floorY - 0.2;
const crashResult = logic.step(crash, 1 / 120);
assert.equal(crashResult.died, true);
assert.equal(crash.status, "over");
assert.equal(crash.best, crash.score);

const before = logic.createState(321);
const still = logic.step(before, 1 / 60);
assert.equal(still.scored, 0);
assert.equal(still.died, false);
assert.equal(before.status, "ready", "ready state does not drift");

console.log("logic tests passed");
