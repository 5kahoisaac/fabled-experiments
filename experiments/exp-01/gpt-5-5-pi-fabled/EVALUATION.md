# Evaluation — gpt-5-5-pi-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-5-pi-fabled |
| Role | challenger |
| Model id | `gpt-5.5` (skill `fabled`, Pi agent) |
| Entry file | result/index.html (Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 64.6/100**  (Mechanical 38/55 + Taste 31.6/45 − gate penalty 5)

Atmospheric "thread the sky" theme with a gentle/practice mode; missing WebGL
fallback (G2), no tests, thin game-over feedback.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero console errors on happy path. |
| G2 failure fallback | **FAIL** | −5 | `--disable-webgl`: `Error creating WebGL context` thrown (three.module.js), game silently stays on start screen, no error UI. Evidence `.eval/g2-webgl-disabled-space.png`. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 38/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 18/20 | gravity −24, flapImpulse 8.6, maxFall −14; collision/bounds; score + localStorage best; game-over panel "Flight ended"/"Splash landing". −2: game-over panel inconsistently observed in capture. |
| 2 | Real tests | 0/12 | No test suite. |
| 3 | Performance | 8/8 | rAF with `min(0.033,…)` cap; no hang. |
| 4 | Input robustness | 6/8 | Space/click/tap/practice-button/resize; rapid flap safe. −2: ArrowUp page-scroll risk; no keyboard-trap when panel shown. |
| 5 | All states | 6/7 | Idle/playing/restart observed; −1: game-over panel not clearly captured (timing). |

## Taste — 31.6/45 (n=1; real lifecycle burst)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Single ice-blue/mint direction, restrained type; ring-hoop gates add identity. −: persistent top-left description block reads like a scaffold artifact. |
| 7 | Feel | 12 | 3 | 7.2 | Believable arc + pillar scroll, 3D camera depth; game-over feedback thin (04 vs 04-panel near-identical). |
| 8 | Difficulty | 10 | 3 | 6.0 | "Gentle mode" shows calibration awareness; default still score-0 in capture — untuned harder end. |
| 9 | Delight | 8 | 4 | 6.4 | Charming soft 3D world, peach bird, "Thread the sky." + ring hoops; scaffold text/thin game-over chip at polish. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-*` (real burst).
> Taste is one rater's judgment (n=1).
