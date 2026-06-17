# Evaluation — glm-5-1-pi (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | glm-5-1-pi |
| Role | control |
| Model id | `glm-5.1` (no skill, Pi agent) |
| Entry file | result/flappy-bird-3d.html (single-file, Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 68.6/100**  (Mechanical 42/55 + Taste 31.6/45 − gate penalty 5)

Playable, charming low-poly game; loses points for a missing dependency
fallback (G2) and no test suite.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero console errors on load/play; SwiftShader infra noise only. |
| G2 failure fallback | **FAIL** | −5 | Three.js via importmap from jsdelivr; blocking the CDN → blank page (browser module-resolution 404), no app-level error UI. Evidence `.eval/g2-three-blocked.png`. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 42/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | Node sim + live run: gravity, flap +9.4, pipe AABB collision → "Ouch!", score (p.scored), restart. |
| 2 | Real tests | 0/12 | No test suite (single HTML file). |
| 3 | Performance | 8/8 | rAF loop, 12s+ driven run, no hangs. |
| 4 | Input robustness | 7/8 | Space/touch/mouse wired; resize + mute handlers. −1: AudioContext error swallowed silently. |
| 5 | All states | 7/7 | Ready/play/game-over all observed. |

## Taste — 31.6/45 (n=1; real lifecycle motion burst)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Unified low-poly aesthetic, matching cards/typography. −: red pipes clash with green; bird clips below grass line on frame 02. |
| 7 | Feel | 12 | 3 | 7.2 | Lifecycle legible, posture changes; clouds barely move (weak parallax); first-flap ground clip. |
| 8 | Difficulty | 10 | 3 | 6.0 | Genre-correct punishing, but abrupt on-ramp (immediate hit near spawn). |
| 9 | Delight | 8 | 4 | 6.4 | "Ouch!" copy + faceted clouds charming; positive charm-to-frustration ratio. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-*` (real renders, motion burst).
> Taste is one rater's judgment (n=1).
