# Evaluation — fable-5 (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | fable-5 |
| Role | baseline |
| Model id | `claude-fable-5` |
| Entry file | result/flappy-bird-3d.html |
| Evaluated | 2026-06-16 |

## Result

**RESULT: PASS**
**Combined score: 84.6/100**  (Mechanical 55/55 + Taste 29.6/45)

## Gates (mechanical-evaluator)

| Gate | Verdict | Evidence |
|------|---------|----------|
| G1 — happy-path console errors | PASS | Puppeteer (system Chrome, 1280×720, 2s settle + 5 interactions over ~8s): `Console errors: NONE`, `Exit errors: 0`. Node logic happy path (7200 steps / 60s): no exceptions, exit 0. |
| G2 — failure fallback (no blank page) | PASS | CDN failure → `FATAL: Three.js could not load from the CDN…`; WebGL unavailable → `FATAL: WebGL is unavailable…`. Third path: global `window.addEventListener('error', …)` (render.js:428-430). Both fatal branches reached and shown, early return executed. |
| G3 — zero placeholders/stubs | PASS | `grep -rni "TODO\|FIXME\|rest of the code\|you can implement\|for brevity\|left as an exercise" result/` → no output. No empty bodies / not-implemented throws. |

## Mechanical checks — 55/55

| # | Check | Pts | Score | Evidence |
|---|-------|-----|-------|----------|
| 1 | Core mechanics correct | 20 | 20/20 | Flap: `status ready→playing`, `birdVY=7.6 (FLAP_VY)`. Gravity capped: `birdVY=-3.9 after 0.5s`, `>= MAX_FALL`. Pipe collision: `ev.died=true`, `status=dead`. Scoring + ramp: `ev.scored=1, score=1`, `speed=5.27>5.2`. Long run 60s: `score=59, maxPipes=6 (≤8), speed=9.000 (cap)`. |
| 2 | Verified by real tests | 12 | 12/12 | `run-tests.js`, 12 groups covering core logic. `RESULT: 36 passed, 0 failed`, exit 0, 29ms. |
| 3 | Stable performance (happy path) | 8 | 8/8 | Logic step over 600 frames (5s @120Hz): avg 0.0013ms, max 0.1942ms, steps >250ms: 0. Render delta cap `Math.min(0.05, …)` (render.js:386). |
| 4 | Input robustness | 8 | 8/8 | Rapid-fire flap ×10: `birdVY=7.6, status=playing` (no accumulation). Dead-state spam: `birdVY unchanged`. dt=0 and dt=100s: no crash, ground-clamped. Space/ArrowUp/W/pointerdown wired. Resize handler updates camera + renderer. |
| 5 | All UI states present | 7 | 7/7 | Ready (`#title-card` "Sunset Flap"), Playing (HUD score updates), Game-over (`#gameover` score/best + "tap to fly again"), Fatal (`#fatal` human-readable), Restart (`startOver()` resets). All confirmed in code and screenshots. |

## Taste checks — 29.6/45  (taste-evaluator, n=1, subjective)

| # | Check | Weight | Rating /5 | Pts | Reasoning |
|---|-------|--------|-----------|-----|-----------|
| 6 | Visual cohesion | 15 | 4/5 | 12.0 | Tightly curated pastel sunset palette; uniform low-poly aesthetic across bird/clouds/platforms/pipes; title typography echoes scene warmth. −1 for plain white game-over panel breaking immersion. |
| 7 | Feel of motion | 12 | 3/5 | 7.2 | Inferred from stills only (no recording — highest uncertainty). Bird pitch arc looks convincing, perspective camera gives real depth; but bird small/hard to track, gravity looks punishing, no visible juice (impact flash, squash-stretch, particles). |
| 8 | Difficulty curve fairness | 10 | 2/5 | 4.0 | Frames show score stuck at 0 across two sequential sessions — bird scrapes ground on first flap, never clears a pipe pair. Suggests too-steep gravity / too-tight pipe spawn; unforgiving opening. |
| 9 | Overall delight | 8 | 4/5 | 6.4 | Genuinely charming, distinct sunset low-poly world with personality; instant clean restart. Capped by frustration of never scoring. |

Captured artifacts: `.eval/01-idle-ready.png`, `.eval/02-first-flap.png`, `.eval/03-mid-play.png`, `.eval/04-game-over.png`, `.eval/05-restarted.png` (no recording captured)

> Taste reflects one rater's subjective judgment (n=1); not an objective
> measurement. Motion items carry the most uncertainty — judged from stills.
