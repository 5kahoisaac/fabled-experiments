# Evaluation — qwen3.6-35b-a3b-ud-mlx-4bit-pi (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | qwen3.6-35b-a3b-ud-mlx-4bit-pi |
| Role | control |
| Model id | `qwen3.6-35b-a3b-ud-mlx-4bit` (local MLX, no skill, Pi agent) |
| Entry file | result/flappy-bird-3d.html (Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 54.6/100**  (Mechanical 37/55 + Taste 22.6/45 − gate penalty 5)

A genuinely playable on-device-model build; missing WebGL fallback (G2), no
tests, and difficulty that ends runs immediately.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Fresh load: zero console errors/exceptions; gameState='idle' on load. |
| G2 failure fallback | **FAIL** | −5 | Nulling `getContext('webgl'/'webgl2')`: start overlay shows normally, renderer silently fails, no user-facing message. Evidence `.eval/g2-webgl-disabled.png`. |
| G3 placeholders | PASS | 0 | Grep → no matches. |

## Mechanical — 37/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 18/20 | Node sim + CDP: gravity (−2.84 over 30 frames), flap 9, floor/pipe collision → die(), score on pass, startGame reset (dead→playing confirmed). −2: a CDP read once showed initial 'dead' state (edge case). |
| 2 | Real tests | 0/12 | No test suite (single HTML file). |
| 3 | Performance | 6/8 | rAF fixed `min(0.05,1/60)`; shadows (PCFSoft) + ACES tone mapping + particles = heavier load. −2: potential drops on low-end. |
| 4 | Input robustness | 6/8 | Space/mousedown/touchstart/resize; rapid flap safe. −2: idle state ignores keyboard (must click START — no keyboard start). |
| 5 | All states | 7/7 | Idle/playing/dead ("Game Over" + best + PLAY AGAIN) confirmed. |

## Taste — 22.6/45 (n=1; partial stills, item 7 capped→2)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 3 | 9.0 | Consistent palette + UI idiom across screens; −: 3D world sparse (flat green ground with floating rectangles), overlay/world layers don't fully harmonize, plain white score. |
| 7 | Feel | 12 | 2 | 4.8 | Capped/low-confidence: frames 02–04 all game-over (instant death), only 05 shows live play; no juice/feedback evident. |
| 8 | Difficulty | 10 | 2 | 4.0 | Score 0 every captured attempt; 3D depth-reading + untuned gap = too hard out of the gate. |
| 9 | Delight | 8 | 3 | 4.8 | Ambitious 3D (PCFSoft shadows, ACES, volumetric clouds, sun) with atmosphere; death-before-play undercuts enjoyment. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-webgl-disabled.png` (partial stills).
> Taste is one rater's judgment (n=1); item 7 inferred from partial stills.
