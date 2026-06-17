# Evaluation — gpt-5-5-pi (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-5-pi |
| Role | control |
| Model id | `gpt-5.5` (no skill, Pi agent) |
| Entry file | result/index.html (Three.js) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 68.6/100**  (Mechanical 42/55 + Taste 31.6/45 − gate penalty 5)

The most visually distinctive control — glowing crystal-gate art direction;
missing CDN fallback (G2) and no tests.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero JS app errors; infra GPU messages only. |
| G2 failure fallback | **FAIL** | −5 | Three.js from unpkg; replacing with blocked URL → UI panel renders but canvas black, no error text. Evidence `.eval/g2-cdn-blocked.png` (+ `g2-webgl-disabled.png`). |
| G3 placeholders | PASS | 0 | Grep → exit 1 (no matches). |

## Mechanical — 42/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | Node sim: gravity −18.5, flap 7.2, gate spacing 3.0, collision threshold, score on pass; gameOver panel + reset; P-key pause. |
| 2 | Real tests | 0/12 | No test suite. |
| 3 | Performance | 8/8 | rAF with `min(0.033,…)` clamp; smooth across multi-second sessions. |
| 4 | Input robustness | 7/8 | Space/ArrowUp/W/pointerdown/start/P/resize; 50 rapid Space presses no crash. −1: mobile viewport not verifiable. |
| 5 | All states | 7/7 | Ready/playing/game-over ("The glass bit back")/paused/restart; localStorage best. |

## Taste — 31.6/45 (n=1; real burst, 7 frames)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Unified purple/navy gradient + amber cards + lavender frosted modals; bird palette echoes gate accents. −: flat gate geometry lower-polish than cloud field. |
| 7 | Feel | 12 | 3 | 7.2 | Bird repositions across frames, gate scroll detectable; comet-trail/particles stripped by SwiftShader, juice unconfirmed. |
| 8 | Difficulty | 10 | 3 | 6.0 | Score 0 across 7 frames incl. 2 restarts; narrow aperture, no visible ramp — steep. |
| 9 | Delight | 8 | 4 | 6.4 | Standout micro-copy ("The glass bit back", "Ride the updraft"); inviting cloud-field idle; above reskin-tier. |

Artifacts: `.eval/01-idle-ready.png … 07-score-check.png` + `g2-*` (real burst).
> Taste is one rater's judgment (n=1).
