# SPEC — Experiment 01 · gemma-4-26b-a4b-it-mlx-8bit-pi

> Run parameters for the **control** contender. Field names match the baseline
> and other control/challenger SPECs so the runs line up for side-by-side
> comparison. This run is a **local on-device model** (Gemma 4 26B A4B, MLX 8-bit
> quantized), which changes both the cost and the metrics story — see Notes.

## Identity

| Field      | Value                                   |
|------------|-----------------------------------------|
| Experiment | exp-01                                  |
| Role       | control                                 |
| Model id   | `gemma-4-26B-A4B-it-MLX-8bit`           |
| Skill      | — (none invoked)                        |
| Agent      | Pi                                      |
| Date       | 2026-06-14                              |
| Variant    | `gemma-4-26b-a4b-it-mlx-8bit-pi`        |

## Tooling

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Coding agent      | Pi                                                                    |
| Model provider    | `omlx` — local MLX inference on-device (8-bit quantized, ~26.47 GB)   |
| Plugins installed | -                                                                     |
| Plugins used      | -                                                                     |
| Tools available   | read, bash, edit, write (pi built-ins)                                |
| References        | [pi.dev](https://pi.dev/), [oMLX](https://omlx.ai/)                   |

## Inputs

| Field               | Value                                                                                       |
|---------------------|---------------------------------------------------------------------------------------------|
| Prompt count        | 4 (1 original build + 3 corrective/steering turns)                                          |
| Prompt              | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Thinking level      | off                                                                                         |
| Tools enabled       | read, bash, edit, write (pi built-ins)                                                      |

## Measured

| Metric                 | Value                                                                                          |
|------------------------|------------------------------------------------------------------------------------------------|
| Tokens in              | 606,084 (prompt, summed across the 22 build completions; full prompt length per request)       |
| Tokens out             | 4,913 (completion, summed across the 22 build completions)                                     |
| Cache read tokens      | not separately metered — oMLX KV/prefix-cached the shared prefix, but reports full prompt      |
| Total tokens           | 610,997 (in + out)                                                                             |
| Cost (USD)             | **$0** — local on-device inference via MLX; no API calls, no per-token billing                |
| Wall-clock (build span)| **~9.8 min (591 s)** — first→last build completion (includes a ~5.5 min `npx vite` hang)       |
| Wall-clock detail      | active model compute ≈ 110 s (~1.8 min) · ~330 s hung on a blocking dev-server call · ~74 s one-time model load excluded |
| Runnable end-to-end?   | Builds clean (`vite build` ✓); served via local static server. **Not** verified playable via a real browser pass. |
| Files produced         | multi-file Three.js + Vite project (`index.html`, `src/main.ts`, `src/game.ts`, `src/styles.css`, `vite.config.ts`, `package.json`) → static `dist/` |

> Token counts are **instrument readings** from the oMLX server log
> (`~/.omlx/logs/server.log`, `Chat completion: … prompt: N` lines), build-isolated
> to the 22 chat-completion requests whose timestamps map onto the build assistant
> turns (HKT 23:18:38 → 23:28:29, i.e. before the `exp-bundle` packaging prompt at
> 23:33:16). The pi session JSONL reported `0` usage for these turns (the local
> `omlx` provider does not write usage back into the session record) — the oMLX
> server log is the source of truth instead. Cost is $0 regardless (local inference).

## Verdict

- **Outcome:** Delivered (with caveats) — a multi-file **Three.js + Vite** 3D Flappy Bird that
  `vite build` compiles into a static `dist/` bundle. The build shipped across **4 prompts**: the
  initial scaffold, a recovery turn after the agent blocked the session by launching a foreground
  `npx vite` dev server, a one-line bug-fix turn restoring a deleted `render()` method
  (`game.render is not a function`), and a final turn that added npm `build`/`dev` scripts and ran a
  production bundle.
- **Caveats:**
    - **No browser/gameplay verification.** Unlike several cloud controls, this run was never loaded
      in a real browser to confirm it plays (no headless pass, no console-error check). Evidence of
      correctness is limited to `vite build` succeeding and the `render()` `TypeError` being fixed.
    - **The "run locally without a server" ask is only nominally met.** The produced `dist/index.html`
      references assets with **absolute** paths (`/assets/…`) — Vite's default `base`. Those resolve
      to the filesystem root under `file://`, so double-clicking the built `index.html` does **not**
      load the game; a static server (`vite preview` / `python -m http.server`) is still required.
      For the showcase embed the copied `result/index.html` was rewritten to relative paths
      (`./assets/…`) so the iframe renders; the original build output used absolute paths.
    - **Blocking dev-server incident.** Prompt 1 ended with the agent calling `npx vite` as a
      foreground command, which never returns; the session appeared to die and the user had to send a
      recovery prompt (~5.5 min of dead time inside the 9.8-min build span). The agent never
      self-corrected this; it was a human-in-the-loop interruption.
    - **Local model, so cost is $0.** Token usage *is* recovered from the oMLX server log (not the
      session JSONL): 606,084 prompt + 4,913 completion = 610,997 total across 22 build completions.
      This makes the run structurally non-comparable to the cloud-API controls on a cost-per-token
      axis; its interest is whether a 26B-class local model running 8-bit on-device through Pi can
      ship a working, pretty 3D game from a single prompt (plus steering).
    - **Token-counting caveat:** oMLX's `Chat completion` line logs the **full prompt length** each
      request (the shared prefix — large system prompt + the ~15k-token skills catalogue — is
      re-counted every turn as the conversation grows, so per-request context ran 24k–32k). oMLX
      serves most of this from a boundary KV-cache, but meters the full prompt, so the 606,084 input
      figure is a full-prompt sum, not cache-adjusted. There is no separate `cache_read` token field.
- **No `Fabled` skill in the context** — this is a bare-prompt control, isolating what
  `gemma-4-26B-A4B-it-MLX-8bit` + Pi produce on the raw ask.
