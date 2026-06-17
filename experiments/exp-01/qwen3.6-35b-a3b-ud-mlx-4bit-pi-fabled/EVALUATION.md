# Evaluation — qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled |
| Role | challenger |
| Model id | `qwen3.6-35b-a3b-ud-mlx-4bit` (local MLX, skill `fabled`, Pi agent) |
| Entry file | result/flappy-bird-3d.html (single-file, Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 65.6/100**  (Mechanical 43/55 + Taste 27.6/45 − gate penalty 5)

The fabled variant clearly outperforms its control sibling (54.6) — better
mechanics and a more cohesive 3D scene; still missing WebGL fallback (G2) and
tests.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero console errors/exceptions during normal play. |
| G2 failure fallback | **FAIL** | −5 | Three.js CDN URL mutated to a bad path → black canvas with title text overlaid, no user-facing error. Evidence `.eval/g2-cdn-blocked.png`. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 43/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | GRAVITY 38, FLAP_FORCE −14, bird tilt; createPipe + PIPE_SPEED 4; AABB collision → game over; score++ on pass + best; MENU→PLAYING→GAME_OVER→MENU all confirmed via frames. |
| 2 | Real tests | 0/12 | No test suite. |
| 3 | Performance | 8/8 | Delta-time rAF loop; single-file self-contained, render clean. |
| 4 | Input robustness | 8/8 | Space (live-confirmed)/mousedown/touchstart/resize; rapid flap safe. |
| 5 | All states | 7/7 | MENU/PLAYING/GAME_OVER ("Game Over! Score | Best") all observed. |

## Taste — 27.6/45 (n=1; partial stills, item 7 capped→2)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Cohesive cartoon palette; soft-shaded volumetric clouds + cast shadows give real depth; clean game-over hierarchy. −: flat featureless lime ground; 2D emoji title vs 3D mesh bird. |
| 7 | Feel | 12 | 2 | 4.8 | Capped: bird velocity-tilt present, cloud parallax implied; but both runs ended Score 0 and game-over frames near-identical — responsiveness unclear. |
| 8 | Difficulty | 10 | 3 | 6.0 | Score 0 both runs (first pipe lethal); genre-punishing but skews harder than original with no ramp. |
| 9 | Delight | 8 | 3 | 4.8 | Charming 3D-ifying of the classic (depth clouds, cast shadows, modeled bird) — strong for a 4-bit local model; flat ground + emoji mismatch + unreachable score blunt it. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-cdn-blocked.png` (partial stills).
> Taste is one rater's judgment (n=1); item 7 inferred from partial stills.
