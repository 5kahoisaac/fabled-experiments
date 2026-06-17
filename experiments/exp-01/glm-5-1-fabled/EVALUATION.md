# Evaluation — glm-5-1-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | glm-5-1-fabled |
| Role | challenger |
| Model id | `glm-5.1` (skill `fabled`) |
| Entry file | result/flappy-bird-3d.html (single-file, Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS**
**Combined score: 89.0/100**  (Mechanical 55/55 + Taste 34.0/45 − gate penalty 0)

Top of the exp-01 field and the only contender to **beat the baseline** (fable-5
84.6). All three gates pass — including a real CDN-failure fallback — and it
ships a 72,086-assertion logic test suite.

## Gates — penalty 0

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero app-level JS errors; logic evaluated cleanly in Node; SwiftShader infra messages only. |
| G2 failure fallback | PASS | 0 | Two guards: `<script onerror>` on the Three.js tag + `if (typeof THREE === 'undefined')` in the render IIFE → `#fatal-overlay` "Failed to load 3D engine. Please use a modern browser…". No silent blank. |
| G3 placeholders | PASS | 0 | Grep TODO/FIXME/stub → 0 matches. |

## Mechanical — 55/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | `node test-logic.js` → 72086 passed, 0 failed. Flap impulse +9, gravity, MAX_FALL −16, collision, score (p.scored guard), speed ramp, restart with bestScore retained. |
| 2 | Real tests | 12/12 | Shipped `test-logic.js`, 72086 assertions across 21 scenarios, exit 0. |
| 3 | Performance | 8/8 | Fixed-timestep 1/120 with MAX_ACCUM cap; pre-allocated pipe pool (8); particle disposal. |
| 4 | Input robustness | 8/8 | Space/ArrowUp/mousedown/touchstart; `inputQueued` debounce; restart gated at deadTimer>0.55; resize handler. |
| 5 | All states | 7/7 | Title/playing/game-over/restart all observed in SwiftShader frames. |

## Taste — 34.0/45 (n=1; real lifecycle motion burst)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Consistent low-poly palette across all states; tasteful game-over blur. −: an orphaned dark-red sphere reads like a debug object. |
| 7 | Feel | 12 | 4 | 9.6 | Clean lifecycle; parallax depth reads well. −: small bird + low wide camera may hurt gap legibility. |
| 8 | Difficulty | 10 | 3 | 6.0 | Foreshortened camera makes gap reading ambiguous; immediate deaths visible. |
| 9 | Delight | 8 | 4 | 6.4 | Inviting idle screen, earned 3D depth — shareable, would replay. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` (real renders, motion burst).
> Taste is one rater's judgment (n=1).
