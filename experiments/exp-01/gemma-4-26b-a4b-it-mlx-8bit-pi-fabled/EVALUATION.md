# Evaluation — gemma-4-26b-a4b-it-mlx-8bit-pi-fabled (exp-01)

| Field | Value |
|-------|-------|
| Experiment | exp-01 |
| Contender | gemma-4-26b-a4b-it-mlx-8bit-pi-fabled |
| Role | challenger |
| Model id | `gemma-4-26B-A4B-it-MLX-8bit` (Pi agent + `fabled` skill) |
| Entry file | result/flappy-bird-3d.html (single-file, Three.js r158 via unpkg CDN) |
| Evaluated | 2026-06-17 |

## Result

**RESULT: PASS**
**Combined score: 57.6/100**  (Mechanical 33/55 + Taste 24.6/45)

The `fabled` skill's logic/render split paid off: a clean pure-logic block
(`==LOGIC-START==`…`==LOGIC-END==`) drove deterministically and the SPEC's
control-inversion bug is genuinely fixed. The render layer, however, has a
statically-confirmed pipe-sync defect, and the 3D scene could not be visually
rendered on the GPU-less eval host — so taste is low-confidence.

> Eval-host caveat: headless Chrome here has no GPU, so Three.js WebGL never
> renders. The game handles this *gracefully* (visible "Error: WebGL not
> supported." overlay — see G2), but it means no gameplay frames could be
> captured. Mechanical scoring leans on headless logic-driving (11/11 facts)
> and static analysis; taste leans on one authentic UI still + code review.

## Gates (mechanical-evaluator)

| Gate | Verdict | Evidence |
|------|---------|----------|
| G1 — happy-path console errors | PASS | No authored-code error on the documented path. Only console error is the host's `THREE.WebGLRenderer: Error creating WebGL context.` (GPU-less eval host) — and the game *catches* it (try/catch around `initThree()`/`animate()`), so it is handled, not unhandled. `onWindowResize()` is properly defined (no resize TypeError, unlike the control). |
| G2 — failure fallback (no blank page) | PASS | Real, visible fallbacks in source (`window.onload`, lines 342–356): `typeof THREE === 'undefined'` → red overlay "Error: Failed to load 3D engine."; `catch(e)` → "Error: WebGL not supported." The WebGL branch is **visually confirmed** in `.eval/01-idle-ready.png` — the running game shows the styled title + a red "Error: WebGL not supported." message. Not a silent dead-end. |
| G3 — zero placeholders/stubs | PASS | Read of the full single file: no TODO/FIXME/"rest of the code"/"for brevity"/stub bodies. `playSound`'s empty `catch{}` is deliberate audio-failure suppression, not a stub. |

## Mechanical checks — 33/55

| # | Check | Pts | Score | Evidence |
|---|-------|-----|-------|----------|
| 1 | Core mechanics correct | 20 | 15/20 | **Logic verified via headless node driving — 11/11 facts:** flap from TITLE→PLAYING; flap sets `velocity=+8` (UP); gravity 15 reduces velocity; bird rises after flap then falls with no input; floor (`<-5`) and ceiling (`>10`) → GAMEOVER; pipe AABB collision → GAMEOVER; score increments when pipe passes x<0; pipes spawn on the 1.8s timer; autopilot survival run reached score 1 over 6.38s then died. **Control-inversion bug is FIXED.** −5: the pipe **render** sync is statically broken — `updatePipes()` matches meshes to live pipes with `p.x === m.userData.x`, but `p.x` mutates every frame while `userData.x` is fixed at creation → every frame removes+recreates all pipe meshes and the position-update `find` never matches, so pipes would visually stick at x=0 and flicker. Could not be visually confirmed (no GPU) but is unambiguous in code. |
| 2 | Verified by real tests | 12 | 0/12 | No test suite shipped — deliverable is a single HTML file with no spec/test entry point. |
| 3 | Stable performance (happy path) | 8 | 5/8 | Logic loop is clean: `dt = Math.min(clock.getDelta(), 0.1)` clamps spikes; rAF-driven. −3: `updatePipes()` removes and re-news every pipe `THREE.Group` (two `BoxGeometry` meshes) every frame — continuous allocation/GC churn; real-browser render fps unmeasurable on this host. |
| 4 | Input robustness | 8 | 7/8 | Space (`keydown`), `mousedown`, and `touchstart` (with `preventDefault`, `passive:false`) all route to one `handleInput()`; rapid input just re-flaps; AudioContext lazily created on first input; `onWindowResize` defined and bound. −1: no explicit guard if `AudioContext` is unavailable (wrapped play is `try/caught`, minor). |
| 5 | All UI states present | 7 | 6/7 | TITLE / PLAYING / GAMEOVER all implemented and logic-confirmed; `updateUI()` toggles hud/title/game-over screens and writes final score; restart via `handleInput()` recreating state. Title state + error overlay visually confirmed; −1: PLAYING/GAMEOVER visuals unobservable on host (WebGL). |

## Taste checks — 24.6/45  (taste-evaluator inline, n=1, **LOW CONFIDENCE**)

> Confidence is low: the 3D scene never rendered on the GPU-less host, so the
> only authentic visual is the title + WebGL-error overlay. Scores below are
> inferred from that one still plus static review of the render code (which has
> a confirmed pipe-movement defect). Per protocol, item 7 (motion) is capped at
> 3/5 because motion could not be captured.

| # | Check | Weight | Rating /5 | Pts | Reasoning |
|---|-------|--------|-----------|-----|-----------|
| 6 | Visual cohesion | 15 | 3/5 | 9.0 | Authentic still shows competent DOM UI — yellow stroked "FLAPPY 3D" title, consistent text styling, clear red error treatment. Intended 3D look (sky-blue + fog, lit yellow sphere bird, green box pipes, shadowed ground) is coherent but standard and unverifiable here; pipe render bug would undercut it. |
| 7 | Feel of motion | 12 | 2/5 | 4.8 | **Stills only — no motion captured** (capped at 3/5), and lowered to 2 because the obstacle-movement subsystem is statically broken (pipes wouldn't scroll). Bird physics constants (flap 8 / gravity 15 / bird pitch by velocity) read reasonable, but feel is unconfirmed. |
| 8 | Difficulty calibration | 10 | 3/5 | 6.0 | Inferred from constants only: first pipe at 1.8s, gap 3.5, tight vertical bounds (−5…10), pipe speed 5. Autopilot reached only score 1 → likely tight/hard, but no real-player evidence. |
| 9 | Overall delight | 8 | 3/5 | 4.8 | Working core loop, lazy WebAudio flap sound, and genuinely graceful error handling are pluses; the unconfirmed visuals and the known pipe-render defect cap enthusiasm. |

Captured artifacts (stills only — **no motion**; WebGL never rendered on host):
- `.eval/01-idle-ready.png` — real game on the eval host: styled title screen + red "Error: WebGL not supported." overlay (authentic G2 WebGL-fallback evidence)

> Taste reflects one rater's subjective judgment (n=1) and is explicitly
> low-confidence here; not an objective measurement. A GPU-capable browser
> session is required to fairly score the rendered 3D game and confirm the
> pipe-render defect.
