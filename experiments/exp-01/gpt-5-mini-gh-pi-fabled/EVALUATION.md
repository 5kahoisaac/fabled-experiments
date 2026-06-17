# Evaluation — gpt-5-mini-gh-pi-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-mini-gh-pi-fabled |
| Role | challenger |
| Model id | `gpt-5-mini` (skill `fabled`, Pi agent) |
| Entry file | result/index.html (single-file, Three.js, ~475 lines) |
| Evaluated | 2026-06-18 (SwiftShader render) |

## Result

**RESULT: PASS**
**Combined score: 75.6/100**  (Mechanical 51/55 + Taste 24.6/45 − gate penalty 0)

The strongest of the smaller-model builds and the only gpt-5-mini case to pass
all gates — it has a proper WebGL fallback. Taste limited by stills-only capture.

## Gates — penalty 0

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Clean load, no JS errors; SwiftShader infra noise only. |
| G2 failure fallback | PASS | 0 | `--disable-webgl`: try/catch → `showLoading("Unable to create WebGL renderer.")` styled card; also pre-checks `!window.WebGLRenderingContext` → "WebGL not available — try a modern browser." Evidence `.eval/g2-webgl-disabled.png`. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 51/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 20/20 | Headless: vy −0.9/frame, flap 4.1 + mode→playing, floor collision (≤−8), Sphere/Box3 intersection, score + localStorage best. |
| 2 | Real tests | 0/12 | Exposes `window.__flappy3d_*` test API but ships no actual test file. |
| 3 | Performance | 8/8 | rAF with `min(getDelta,0.05)` cap; pre-allocated geometry; 475-line single file. |
| 4 | Input robustness | 8/8 | Space/tap/click + resize; mode-guard prevents rapid-flap corruption; KeyR/Restart reset. |
| 5 | All states | 7/7 | Menu (bobbing bird)/playing (perspective pillars)/dead ("You crashed" w/ score+best) observed. |

## Taste — 24.6/45 (n=1; ordered stills, item 7 capped→2)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 3 | 9.0 | Consistent palette + card idiom across screens. −: pure-black sky reads like a missing skybox; featureless gold-sphere bird; overlay sits atop world rather than integrated. |
| 7 | Feel | 12 | 2 | 4.8 | Capped: pillar barely moves between idle/flap; game-over shows "Score: 7" while HUD stayed 0 (live-update gap); no flap cue/particles. |
| 8 | Difficulty | 10 | 3 | 6.0 | Score 7 on a run = reasonable gap tuning; −: stepped/offset pillar slabs make gap judgment ambiguous. |
| 9 | Delight | 8 | 3 | 4.8 | Camera-follow 3D twist + idle bob have personality; black sky + bare sphere + sparse UI read proof-of-concept. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-webgl-disabled.png` (ordered stills).
> Taste is one rater's judgment (n=1); item 7 inferred from stills.
