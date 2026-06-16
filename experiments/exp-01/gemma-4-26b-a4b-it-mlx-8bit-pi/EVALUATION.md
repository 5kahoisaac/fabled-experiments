# Evaluation — gemma-4-26b-a4b-it-mlx-8bit-pi (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gemma-4-26b-a4b-it-mlx-8bit-pi |
| Role | control |
| Model id | `gemma-4-26B-A4B-it-MLX-8bit` (Pi agent, no skill) |
| Entry file | result/index.html (Vite-bundled multi-file Three.js) |
| Evaluated | 2026-06-17 |

## Result

**RESULT: FAIL**
**Combined score: 0/100**  (gate G2 failed → taste not run; mechanical subtotal 28/55 is moot under a gate FAIL)

Failed gate: **G2 — failure fallback.** When WebGL is unavailable the game
renders a silent blank sky-blue canvas with the normal idle message and no
user-visible error — a dead end. This is an environment-independent code
defect (no fallback path), not an artifact of the headless eval host.

## Gates (mechanical-evaluator)

| Gate | Verdict | Evidence |
|------|---------|----------|
| G1 — happy-path console errors | PASS* | No genuine code error on the documented startup/play path. The only console errors (`THREE.WebGLRenderer: Error creating WebGL context.` + page-level `Error creating WebGL context.`) are headless-host GPU limitations, not code bugs; favicon 404 is benign. Graded PASS provisionally — under a strict "zero errors in any environment" reading this would also FAIL. |
| G2 — failure fallback (no blank page) | **FAIL** | With WebGL disabled (`--disable-webgl --disable-webgl2`): blank sky-blue canvas + "Press SPACE or Tap to Start", Space does nothing, score stays 0, no message ever shown. `Has user-visible error: false`. Evidence: `.eval/06-g2-webgl-disabled.png`. |
| G3 — zero placeholders/stubs | PASS | Grep of the 517 KB bundle for TODO/FIXME/"rest of the code"/"for brevity"/"left as an exercise"/"not implemented" → 0 matches; no empty/stub function bodies in authored code. |

> A gate FAILED, so score is 0/100 and taste was not run. The mechanical
> itemization below is recorded for diagnostic value only.

## Mechanical checks — 28/55 (diagnostic only; overridden to 0 by gate FAIL)

| # | Check | Pts | Score | Evidence |
|---|-------|-----|-------|----------|
| 1 | Core mechanics correct | 20 | 15/20 | All 5 reqs (gravity/jump physics, pipe spawn+move, AABB collision→game over, score on pipe pass, Space restart) present and wired; verified by 22-assertion headless logic sim. gravity −0.005/frame, jump 0.12, pipes x=15 moving −0.1/frame, BoundingBox3 intersection, reset() clears state. −5: 3D render layer unobservable end-to-end (WebGL fails in host). |
| 2 | Verified by real tests | 12 | 0/12 | No test files anywhere. Deliverable is only index.html + assets/index-*.js + assets/index-*.css. |
| 3 | Stable performance (happy path) | 8 | 4/8 | rAF over 150 idle frames: max gap 10.9 ms, avg 10.0 ms, zero gaps >250 ms — clean loop. −4: actual WebGL render perf untestable (no GPU). |
| 4 | Input robustness | 8 | 5/8 | Space `keydown` + `touchstart` + `mousedown` all wired to one flap/start/restart handler; rapid-fire Space only sets velocity (no corruption). −3: confirmed `e.resize is not a function` TypeError on any window resize (`resize()` never defined on the game class). |
| 5 | All UI states present | 7 | 4/7 | Idle / playing / game-over all exist in code (setupInput, gameOver(), reset()). Idle observable; −3: playing and game-over states unobservable in execution (WebGL fails). |

## Taste checks — NOT RUN

Not scored: mechanical gate G2 failed, so per the evaluation protocol taste
scoring is skipped and the combined score is 0/100.

Captured artifacts (stills only — **no motion**; WebGL never rendered in the
headless host, so all frames are an identical blank sky-blue canvas):
- `.eval/01-idle-ready.png` — load, idle message
- `.eval/02-first-flap.png` — after Space (unchanged; WebGL failed)
- `.eval/03-mid-play.png` — mid-play attempt (unchanged)
- `.eval/04-death-end.png` — after wait (unchanged)
- `.eval/05-restarted.png` — after restart press (unchanged)
- `.eval/06-g2-webgl-disabled.png` — G2 test, blank screen, no error message

> Taste reflects one rater's subjective judgment (n=1); not an objective
> measurement. Here it was not produced — a GPU-capable browser session would
> be required to see the Three.js scene and judge it.
