# SPEC — Experiment 01 · qwen3.6-35b-a3b-ud-mlx-4bit-pi

> Run parameters for the **control** contender. Field names match the baseline
> and other control/challenger SPECs so the runs line up for side-by-side
> comparison. This run is a **local on-device model** (MLX 4-bit quantized),
> which changes both the cost and the metrics story — see Notes.

## Identity

| Field      | Value                              |
|------------|------------------------------------|
| Experiment | exp-01                             |
| Role       | control                            |
| Model id   | `qwen3.6-35b-a3b-ud-mlx-4bit`      |
| Skill      | — (none invoked)                   |
| Agent      | Pi                                 |
| Date       | 2026-06-14                         |
| Variant    | `qwen3.6-35b-a3b-ud-mlx-4bit-pi`   |

## Tooling

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Coding agent      | Pi                                                                    |
| Model provider    | `omlx` — local MLX inference on-device (4-bit quantized)              |
| Plugins installed | -                                                                     |
| Plugins used      | -                                                                     |
| Tools available   | read, bash, edit, write (pi built-ins)                                |
| References        | [pi.dev](https://pi.dev/), [Qwen](https://github.com/QwenLM/Qwen3)    |

## Inputs

| Field               | Value                                                                                       |
|---------------------|---------------------------------------------------------------------------------------------|
| Prompt count        | 2 (1 original build + 1 corrective turn for a runtime bug)                                  |
| Prompt              | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Thinking level      | off                                                                                         |
| Tools enabled       | read, bash, edit, write (pi built-ins)                                                      |

## Measured

| Metric                 | Value                                                                                          |
|------------------------|------------------------------------------------------------------------------------------------|
| Tokens in              | 130,806 (prompt, summed across the 7 build turns; full prompt length per request)             |
| Tokens out             | 8,557 (completion, summed across the 7 build turns)                                            |
| Cache read tokens      | not separately metered — oMLX KV-cached the shared prefix (see Notes), but reports full prompt |
| Total tokens           | 139,363 (in + out)                                                                             |
| Cost (USD)             | **$0** — local on-device inference via MLX; no API calls, no per-token billing                |
| Wall-clock (active)    | **158 s (~2.6 min)** — sum of the two build prompts only; idle gap between them excluded       |
| Wall-clock detail      | prompt 1 (create): 119.6 s · prompt 2 (fix bug): 38.5 s · idle (user testing): 62.0 s skipped |
| Runnable end-to-end?   | Yes after a one-line fix; served via local HTTP; no further errors reported                    |
| Files produced         | 1 — `flappy-bird-3d.html` (single self-contained file, 21 KB)                                  |

> Token counts are **instrument readings** from the oMLX server log
> (`~/.omlx/logs/server.log`, `Chat completion: … prompt: N` lines), build-isolated
> to the 7 chat-completion requests whose timestamps map one-to-one (to the second)
> onto the 7 build assistant turns. The pi session JSONL reported `0` usage for
> these turns (the local `omlx` provider does not write usage back into the
> session record) — the oMLX server log is the source of truth instead. Cost is
> $0 regardless (local inference).

## Verdict

- **Outcome:** Delivered — single-file 3D Flappy Bird (Three.js r128 via CDN). The build shipped in
  one turn; a second corrective turn fixed a runtime `TypeError` (`bird.wing` referenced before
  assignment → `birdGroup.wing`) and a `file://` WebGL security-origin error by switching to a local
  HTTP server. No further errors were reported after the fix.
- **Notes:**
    - **Local model, so cost is $0.** Token usage *is* recovered (from the oMLX server log, not the
      session JSONL): 130,806 prompt + 8,557 completion = 139,363 total across 7 build turns. This makes
      the run structurally different from the cloud-API controls (e.g. `glm-5-1-pi`, `gpt-5-5-pi`) on
      cost — it is not comparable on a cost-per-token axis — but its token counts are now comparable.
      Its interest is whether a 35B-class local model running 4-bit on-device through Pi can ship a
      working, pretty 3D game from a single prompt.
    - **Token-counting caveat:** oMLX's `Chat completion` line logs the **full prompt length** each
      request (the shared prefix is re-counted every turn as the conversation grows). oMLX does run a
      boundary KV-cache — scheduler lines like `storing 18432/19975 tokens` show ~10–20k of each turn's
      prompt served from a cache snapshot — but the server meters the full prompt, so the 130,806 input
      figure is a full-prompt sum, not cache-adjusted. There is no separate `cache_read` token field.
    - **Wall-clock is active-time only.** The 158 s sums the two build prompts
      (create-game turn + bug-fix turn); the ~62 s gap between them — during which the user opened the
      game, hit the runtime error, and pasted it back — is excluded as idle. The session's raw
      first-to-last timestamp span is longer precisely because of that gap plus the unrelated
      `exp-bundle` packaging turns that followed (run under a different model; excluded here).
    - **Verification level:** functional fix + no further error report, **not** an automated headless
      browser pass. Compare the `glm-5-1-pi` control, which verified the shipped game via headless
      automation with zero console errors. This run's evidence is one corrective bug-fix turn plus the
      absence of follow-up errors.
    - No `Fabled` skill in the context — this is a bare-prompt control, isolating what
      `qwen3.6-35b-a3b-ud-mlx-4bit` + Pi produce on the raw ask.
