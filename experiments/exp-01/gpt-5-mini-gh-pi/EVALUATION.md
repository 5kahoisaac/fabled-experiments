# Evaluation — gpt-5-mini-gh-pi (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gpt-5-mini-gh-pi |
| Role | control |
| Model id | `gpt-5-mini` (no skill, Pi agent) |
| Entry file | result/index.html (Three.js + post-processing) |
| Evaluated | 2026-06-18 (SwiftShader render — 3D canvas did NOT composite) |

## Result

**RESULT: PASS-WITH-DEFECTS**
**Combined score: 50.0/100**  (Mechanical 37/55 + Taste 18.0/45 − gate penalty 5)

Lowest of the scored builds — but with a real caveat: the heavy post-processing
pipeline (bloom/EffectComposer) did **not** composite into screenshots on this
host, so taste is **UI-overlay-only, low-confidence**. The 3D scene (per code:
textured bird, striped pipes, bloom, grain, parallax mountains, particles) could
not be visually confirmed and would likely raise taste on a real GPU.

## Gates — penalty 5

| Gate | Verdict | Pen | Evidence |
|------|---------|-----|----------|
| G1 happy-path errors | PASS | 0 | Fresh load via CDP: zero console errors; WebGL2 context active (1280×633); all unpkg deps HTTP 200. |
| G2 failure fallback | **FAIL** | −5 | Blocking Three.js + deps via `Fetch.failRequest` → start overlay shows, no canvas, no error, Start does nothing. Silent. Evidence `.eval/g2-blocked-dependency.png`. |
| G3 placeholders | PASS | 0 | Grep → 0 matches. |

## Mechanical — 37/55

| # | Check | Pts | Evidence |
|---|-------|-----|----------|
| 1 | Core mechanics | 18/20 | Node test: gravity −18 (birdY −9.15 after 1s), flap 6.5, Box3 collision (top/bottom/pass), score++ on pipe pass, gameOver/start reset. −2: erratic first-frame dt → instant death in headless (dt capped at 0.05 mitigates). |
| 2 | Real tests | 0/12 | No test suite (index.html/main.js/style.css/REPORT.md). |
| 3 | Performance | 6/8 | rAF with `min(getDelta,0.05)` cap. −2: 50ms cap means large physics steps at low fps; no frame smoothing. |
| 4 | Input robustness | 6/8 | Space/click/tap/resize/mute wired. −2: fragile overlay show/hide via inline `display:none` (no class/!important). |
| 5 | All states | 7/7 | Idle/playing/game-over/restart confirmed via DOM; difficulty ramp every 8 pts. |

## Taste — 18.0/45 (n=1; **UI-overlay only, LOW confidence** — 3D never composited)

| # | Check | W | R | Pts | Reasoning |
|---|-------|---|---|-----|-----------|
| 6 | Visual cohesion | 15 | 2 | 6.0 | Coherent minimal start screen (blue gradient, frosted card, amber CTA); in-play frames featureless (Score:0 unchanged, no game-over seen) — overlay alone barely holds as a system. |
| 7 | Feel | 12 | 2 | 4.8 | Capped, low-confidence: three in-play frames pixel-identical, no state progression observable. |
| 8 | Difficulty | 10 | 2 | 4.0 | Cannot assess; Score 0 across all active frames; possible collision/start-detection issue (or just no 3D capture). |
| 9 | Delight | 8 | 2 | 3.2 | Start screen has charm ("Pretty & playable"); in-play overlay indistinguishable from a broken canvas. |

Artifacts: `.eval/01-idle-ready.png … 05-restarted.png` + `g2-blocked-dependency.png` (UI layer only; 3D absent).
> Taste is one rater's judgment (n=1), **low confidence** — the 3D scene did not render into screenshots on this host; a GPU run could raise items 6/7/9.
