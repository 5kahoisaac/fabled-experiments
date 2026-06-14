# JOURNEY — Experiment 01 · gemma-4-26b-a4b-it-mlx-8bit-pi

## Setup recap

- **Model**: `gemma-4-26B-A4B-it-MLX-8bit` (local on-device, MLX 8-bit, ~26.47 GB)
- **Skill**: — (none invoked)
- **Agent**: Pi
- **Variant**: `gemma-4-26b-a4b-it-mlx-8bit-pi`
- **Prompt**: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Model load (HKT 23:17:13 → 23:18:27, ~74 s).** oMLX evicted the previously-resident
   Qwen3.6-35B to free memory, then loaded Gemma 4 26B A4B 8-bit (actual 26.47 GB). First
   chat-completion fired at 23:18:38.
2. **Prompt 1 — initial build (23:18:38 → 23:20:02, 14 completions, ~3746 out tok, active ~86 s).**
   The agent scaffolded a multi-file project: `npm init`, `npm i three vite @types/three`, then wrote
   `index.html`, `src/styles.css`, `src/game.ts` (a `Game` class: Three.js scene, PerspectiveCamera,
   WebGLRenderer with shadows + fog, a gold-sphere bird with eye/beak, green cylinder pipes,
   gravity/jump physics, AABB collision, score UI), `src/main.ts` (bootstrap + resize), and
   `vite.config.ts`. **The turn ended with the agent calling `npx vite` as a foreground command.**
   Vite's dev server never exits, so the agent's turn hung — the session appeared dead.
3. **~5.5 min hang + human recovery (23:20:02 → 23:25:33).** The user noticed the dead session and
   sent a steering prompt complaining that `npx vite` killed it.
4. **Prompt 2 — recovery (23:25:40, 1 completion, 421 out tok).** The agent apologised, explained the
   mistake (running a blocking dev server instead of just building/verifying), and summarised how to
   run the game locally. No code changes.
5. **Prompt 3 — `game.render is not a function` (23:27:13 → 23:27:19, 3 completions, 283 out tok,
   active ~7 s).** The user reported a runtime `TypeError` from `main.ts:10`. Root cause: while adding
   a `resize()` method in the previous session, the agent's edit had **replaced** the `render()`
   method instead of inserting alongside it. The agent `read` `game.ts`, confirmed the missing method,
   and `edit`-restored `public render() { this.renderer.render(this.scene, this.camera); }`.
6. **Prompt 4 — make it bundleable / no server (23:28:20 → 23:28:29, 4 completions, 463 out tok,
   active ~9 s).** The user asked for a local, server-less bundle. The agent added `dev`/`build`/
   `preview` npm scripts to `package.json` and ran `vite build`, which succeeded: 8 modules →
   `dist/index.html` + `dist/assets/index-*.js` (517 kB) + `dist/assets/index-*.css`. It claimed the
   `dist/` could be opened directly in a browser. (It cannot under `file://` — see SPEC caveat: the
   build uses absolute `/assets/…` paths, and the ES-module output is also CORS-blocked on `file://`
   in most browsers; a static server is still required.)
7. **Packaging (later, excluded from metrics).** The `exp-bundle` skill packaged this run into the
   showcase. Those turns run **after** the build window and are excluded from the token/time metrics.

## Observations

- **The model's coding instincts were solid but its operational instincts were not.** It produced a
  coherent, well-structured Three.js game (proper class split, lighting, fog, shadows, AABB
  collision, responsive resize) in a single prompt — but it made two avoidable runtime-process
  mistakes: (a) launching a foreground `npx vite` dev server that blocks the agent loop, and (b)
  an edit that clobbered an existing method when adding a new one.
- **Heavy per-request context.** Each of the 22 build completions carried a 24k–32k-token prompt
  (large system prompt + the ~15k-token skills catalogue injected by Pi). That dominates the 606,084
  input-token sum; most of it was served from oMLX's KV cache but metered as full prompt.
- **Fast per-token decode but long wall-clock.** Active model compute was only ~110 s (~1.8 min) at
  ~50–90 tok/s, yet the user experienced ~9.8 min for the build because of the 5.5-min vite hang and
  the human-in-the-loop recovery turns.
- **Cost is $0** — local on-device MLX inference; not comparable to the cloud controls on cost.
- **Verification gap.** No real-browser gameplay pass was ever performed; the only evidence of
  correctness is `vite build` succeeding and the `render()` fix. Compare the `glm-5-1-pi` /
  `gpt-5-5-codex` controls, which verified the shipped game headlessly with zero console errors.

## Takeaway

A 26B-class local model (Gemma 4 A4B, 8-bit) running on-device through Pi can scaffold a clean,
pretty multi-file Three.js 3D game from one prompt — but on this run it needed **three** extra
steering turns (one for its own blocking-`vite` mistake, one to restore a method it had deleted, one
to add a production bundle), never self-verified the result in a browser, and shipped a bundle that
doesn't truly run `file://`-local as requested. Solid first-pass code; weak operational judgment and
no verification loop.
