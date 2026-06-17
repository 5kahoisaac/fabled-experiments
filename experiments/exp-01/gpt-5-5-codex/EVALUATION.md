# Evaluation — gpt-5-5-codex (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-5-codex |
| Role | control |
| Model id | `gpt-5.5` (no skill, Codex agent) |
| Entry file | result/index.html (multi-file, Three.js via unpkg) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 68.6/100**  (Mechanical 42/55 + Taste 31.6/45 − gate penalty 5)

Solid, coherent low-poly 3D Flappy; missing dependency fallback (G2) and no tests.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Zero console errors; THREE loaded from unpkg OK; clean game-over. |
| G2 failure fallback | **FAIL** | −5 | WebGL getContext→null produces console-only `THREE.WebGLRenderer: Error creating WebGL context.`; start panel shows over dark canvas, no DOM error. Evidence `.eval/g2-webgl-failure.png`. |
| G3 placeholders | PASS | 0 | Grep across 4 source files → 0 matches. |

## Mechanical — 42/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | gravity −18, flap 7.4, floor/ceiling + pipe collision → finishGame, score++ & speed cap 12, resetGame. Observed across frames. |
| 2 | Real tests | 0/12 | No tests (index.html/main.js/world.js/styles.css only). |
| 3 | Performance | 8/8 | rAF with `min(getDelta,0.033)`; ~10s run, no jank. |
| 4 | Input robustness | 7/8 | Space/ArrowUp/pointerdown/restart/resize wired; rapid flaps safe. −1: dual restart affordances mild UX confusion. |
| 5 | All states | 7/7 | Ready/playing/game-over/restart observed. |

## Taste — 31.6/45 (n=1; real lifecycle motion burst)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 4 | 12.0 | Coherent soft low-poly arcade world; frosted-glass cards reused; consistent CTA. −: flat teal box pipes mismatch rounded clouds/bird. |
| 7 | Feel | 12 | 3 | 7.2 | Physics run (shadow tracks altitude); gravity reads stiff; blunt pipes, little approach polish. |
| 8 | Difficulty | 10 | 3 | 6.0 | Gap moderately narrow; steep gravity curve early; score stayed 0. |
| 9 | Delight | 8 | 4 | 6.4 | Toy-box charm, "Skybound Flap" branding; −: no collision particles/milestones. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-webgl-failure.png`.
> Taste is one rater's judgment (n=1).
