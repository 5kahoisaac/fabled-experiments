# Evaluation — gpt-5-5-no-omo-codex (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-5-no-omo-codex |
| Role | control |
| Model id | `gpt-5.5` (no skill, Codex agent, no-omo) |
| Entry file | result/index.html (Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 66.0/100**  (Mechanical 43/55 + Taste 28.0/45 − gate penalty 5)

Strong mechanics; missing WebGL fallback (G2) and no tests; difficulty skews hard.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero JS errors; SwiftShader infra noise only. |
| G2 failure fallback | **FAIL** | −5 | `--disable-webgl`: WebGLRenderer ctor fails silently, overlay card stays but no "WebGL not supported" message; no try/catch or context-loss handler. Evidence `.eval/g2-webgl-disabled.png`. |
| G3 placeholders | PASS | 0 | Grep → exit 1 (no matches). |

## Mechanical — 43/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | gravity −21, flap 8.2, createObstacle, hitsObstacle + bounds → endGame, score + localStorage best, restart. All observed. |
| 2 | Real tests | 0/12 | No test suite. |
| 3 | Performance | 8/8 | rAF with `min(getDelta,0.033)`; clean. |
| 4 | Input robustness | 8/8 | Space/ArrowUp/pointer/start-button/resize; FOV adapts narrow; speed/score clamped. |
| 5 | All states | 7/7 | Ready/playing/mid/game-over ("CRASHED")/restart observed. |

## Taste — 28.0/45 (n=1; real lifecycle motion burst)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Unified low-poly city, parallax layers, cast shadows, sun glow. −: green pipes lifted from 2D original, tonal mismatch. |
| 7 | Feel | 12 | 3 | 7.2 | Lifecycle correct; shadow tracks bird; score 0 (immediate first-pipe hit) hints tight hitbox. |
| 8 | Difficulty | 10 | 2 | 4.0 | Score 0 twice; first-pipe collision; busy background crowds approach reads — too hard out of the gate. |
| 9 | Delight | 8 | 3 | 4.8 | Charming skyline + "Thread the skyline" copy; first impression is frustration, fast restart softens it. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-webgl-disabled.png`.
> Taste is one rater's judgment (n=1).
