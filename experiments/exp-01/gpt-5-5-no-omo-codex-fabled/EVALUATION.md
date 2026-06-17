# Evaluation — gpt-5-5-no-omo-codex-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-5-no-omo-codex-fabled |
| Role | challenger |
| Model id | `gpt-5.5` (skill `fabled`, Codex agent, no-omo) |
| Entry file | result/index.html (Three.js, logic/render split) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS**
**Combined score: 84.2/100**  (Mechanical 55/55 + Taste 29.2/45 − gate penalty 0)

Second-best in exp-01 and essentially tied with the baseline (fable-5 84.6). All
gates pass — including a clean CDN-failure error card — and it ships a logic
test suite. Held back from #1 only by stills-only taste evidence.

## Gates — penalty 0

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero JS exceptions; SwiftShader infra noise only. |
| G2 failure fallback | PASS | 0 | Blocking cdnjs via `--host-rules` → visible card "Unable to start the 3D game / Three.js did not load. Check the network connection and reload." Evidence `.eval/g2-threejs-blocked.png`. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 55/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | LOGIC-START/END block driven in Node: flap velocity, gravity, collide() centered-vs-outside, score++ on gate pass, status='over' + best, start() restart with seed cycling. |
| 2 | Real tests | 12/12 | `scripts/test-logic.mjs` (RNG determinism, state machine, collision, scoring, pool bounds, death/best), exit 0. |
| 3 | Performance | 8/8 | rAF delta-time loop; simple per-frame arithmetic; smooth SwiftShader render. |
| 4 | Input robustness | 8/8 | Space/click/tap via shared handler; enum-gated state machine; ready-state freezes physics. |
| 5 | All states | 7/7 | Ready/playing/game-over ("Flight ended" w/ Score/Best/Air-time) + WebGL-unavailable error all confirmed. |

## Taste — 29.2/45 (n=1; ordered stills, item 7 capped→2)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Disciplined 4-colour system (sky-blue/teal/gold/slate), consistent frosted panels & type. −: panels occlude the world; perspective shifts between frames. |
| 7 | Feel | 12 | 2 | 4.8 | Capped: no mid-flight frame captured; first-flap frame unchanged, game-over frames near-identical — smooth feel not inferable. |
| 8 | Difficulty | 10 | 3 | 6.0 | "Air time 1s", score 0 — genre-correct unforgiving; "stay centered" coaching tip is thoughtful. |
| 9 | Delight | 8 | 4 | 6.4 | "Skyweave / Thread the glowing gates" voice, 3-stat game-over, charming small bird — above clone-tier. |

Artifacts: `.eval/01-idle-ready.png, 02-first-flap, 03-mid-play, 03b-mid-play-active, 04-game-over, 05-restarted, g2-threejs-blocked.png`.
> Taste is one rater's judgment (n=1); item 7 capped (stills-only, no mid-flight frame).
