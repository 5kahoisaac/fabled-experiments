# Evaluation — gemma-4-26b-a4b-it-mlx-8bit-pi (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gemma-4-26b-a4b-it-mlx-8bit-pi |
| Role | control |
| Model id | `gemma-4-26B-A4B-it-MLX-8bit` (Pi agent, no skill) |
| Entry file | result/index.html (Vite-bundled multi-file Three.js) |
| Evaluated | 2026-06-18 (re-scored: gates-as-penalties rubric + software-WebGL render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 45.4/100**  (Mechanical 38/55 + Taste 20.4/45 − gate penalty 13)

Re-scored from the earlier 0/100: gates are now penalties, not a kill-switch,
and the game was rendered for real via Chrome+SwiftShader (the prior run only
got blank frames). The game is genuinely playable end-to-end; it loses points
for a resize-crash (G1) and a silent WebGL dead-end (G2), plus thin polish.

## Gates (mechanical-evaluator) — penalty −13

| Gate | Verdict | Penalty | Evidence |
|------|---------|---------|----------|
| G1 — happy-path runtime errors | **FAIL** | −8 | Dispatching a `resize` event throws uncaught `TypeError: e.resize is not a function` — the game class has no `resize()` but the window listener calls it. Fires on any window resize (a normal usage path). Confirmed via CDP Runtime.evaluate + error listener. |
| G2 — failure fallback (no blank page) | **FAIL** | −5 | With `--disable-webgl --disable-webgl2`, the 3D scene is blank; HTML overlay still shows "0" + "Press SPACE or Tap to Start" but **no** WebGL error message. Silent dead-end. Evidence: `.eval/g2-no-webgl.png`. |
| G3 — zero placeholders/stubs | PASS | 0 | Grep of built JS for TODO/FIXME/"rest of the code"/stub patterns → 0 matches. |

## Mechanical checks — 38/55

| # | Check | Pts | Score | Evidence |
|---|-------|-----|-------|----------|
| 1 | Core mechanics correct | 20 | 18/20 | Headless Node sim + live CDP run: flap impulse `birdVelocity=0.15`, gravity pulls down, pipes spawn & scroll (03-mid-play), collision → "GAME OVER" (04), score++ on pass, restart resets to idle (05). −2: resize handler broken (secondary feature). |
| 2 | Verified by real tests | 12 | 0/12 | No test suite anywhere (no *.test.*/*.spec.*, no test script). |
| 3 | Stable performance (happy path) | 8 | 8/8 | 350 frames over ~5s live gameplay via CDP: zero gaps >250ms after the first second (`{"gaps":[],"totalFrames":350}`). |
| 4 | Input robustness | 8 | 5/8 | SPACE start/flap/restart all confirmed via real keypress injection; touch handler present in source (not independently driven). −3: window resize throws TypeError. |
| 5 | All UI states present | 7 | 7/7 | Idle (01), playing (02–03), game-over (04), restarted (05) all observed and captured via SwiftShader renders. |

## Taste checks — 20.4/45  (taste-evaluator, n=1; judged from a real lifecycle frame burst)

| # | Check | Weight | Rating /5 | Pts | Reasoning |
|---|-------|--------|-----------|-----|-----------|
| 6 | Visual cohesion | 15 | 2/5 | 6.0 | Palette internally consistent (sky-blue, green ground, olive bird, green pipes) with some depth (curved ground, bird drop-shadow), but reads as a raw prototype: unstyled white score number, plain body-text UI messages sitting on the ground layer with no overlay/backdrop, pipe green clashes with ground green, no title screen, near-identical look across states. |
| 7 | Feel of motion | 12 | 3/5 | 7.2 | Physics visible and working across frames: bird floats (01) → drops immediately on flap (02, gravity present) → pipes scrolled in (03) → clean reset (05); drop-shadow tracks height (good spatial cue). But no bird tilt by velocity, no flap/collision particles or squash-stretch — responsive but minimal, not juicy. |
| 8 | Difficulty calibration | 10 | 2/5 | 4.0 | Pipe gap in 03 looks very generous vs bird size; death at score 0 reads as the test bot not flapping (ground collision), not real challenge. No visible progression or high score — tuned toward trivially easy. |
| 9 | Overall delight | 8 | 2/5 | 3.2 | 3D perspective + curved ground + shadow differentiate it from flat 2D clones, and restart works cleanly; but no audio, no best score, no bird rotation, sparse feedback — a technical proof-of-concept more than a game you'd replay. |

Captured artifacts (real SwiftShader renders; ordered lifecycle burst = motion evidence):
- `.eval/01-idle-ready.png` · `02-first-flap.png` · `03-mid-play.png` · `04-game-over.png` · `05-restarted.png`
- `.eval/g2-no-webgl.png` — G2 failure-mode evidence (blank, no error message)

> Taste reflects one rater's subjective judgment (n=1); not an objective
> measurement.
