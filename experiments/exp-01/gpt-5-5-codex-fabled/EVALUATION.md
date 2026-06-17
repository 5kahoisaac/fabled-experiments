# Evaluation — gpt-5-5-codex-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-5-codex-fabled |
| Role | challenger |
| Model id | `gpt-5.5` (skill `fabled`, Codex agent) |
| Entry file | result/index.html (Three.js via CDN) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 66.6/100**  (Mechanical 40/55 + Taste 31.6/45 − gate penalty 5)

Distinctive night-city aesthetic; missing CDN fallback (G2), no tests, and a
scoring mechanic that's hard to trigger.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero console errors; renderer = "ANGLE … SwiftShader Device". |
| G2 failure fallback | **FAIL** | −5 | Three.js imported from jsdelivr with no try/catch, `<script onerror>`, or fallback. CDN down → UI chrome with black void, no message. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 40/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 18/20 | flap 6.25, gravity −17.5, 7-pipe recycle, collision/bounds → over, score on pass, speed ramp, createInitialState reset. −2: scoring needs very precise flaps (confirmed only via teleport-cheat sim). |
| 2 | Real tests | 0/12 | No test suite. |
| 3 | Performance | 8/8 | 78 frames/5s via CDP, ~15fps software, zero gaps >250ms after 1st sec. |
| 4 | Input robustness | 7/8 | Space confirmed live; ArrowUp/click wired; ResizeObserver; over-state flap is no-op. −1: ArrowUp/click not live-confirmed. |
| 5 | All states | 7/7 | Ready/playing/game-over/restart observed (pipe positions reset confirmed). |

## Taste — 31.6/45 (n=1; ordered stills, item 7 capped)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Committed dark night-city direction; chunky beveled pipes; glass-card UI. −: bird palette a slightly separate register; faint starfield. |
| 7 | Feel | 12 | 3 | 7.2 | Stills-only (capped). Position deltas imply gravity+scroll; no motion blur/particles/shake visible. |
| 8 | Difficulty | 10 | 3 | 6.0 | Score 0 run; copy promises ramp but mid-run accrual unconfirmed. |
| 9 | Delight | 8 | 4 | 6.4 | Atmospheric skyline + depth pipes + voiced copy; −: no collision feedback, score stuck 0. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` (ordered stills).
> Taste is one rater's judgment (n=1); item 7 inferred from stills.
