# SPEC — Experiment 01 · qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled

> Run parameters for the **challenger** contender (model + Fabled skill + tools).
> Field names match the baseline and the other control/challenger SPECs so the
> runs line up for side-by-side comparison. This run is a **local on-device
> model** (MLX 4-bit quantized) and is recorded as **failed** — see `result/REPORT.md`.

## Identity

| Field      | Value                                       |
|------------|---------------------------------------------|
| Experiment | exp-01                                      |
| Role       | challenger                                  |
| Model id   | `qwen3.6-35b-a3b-ud-mlx-4bit`               |
| Skill      | `fabled`                                    |
| Agent      | Pi                                          |
| Date       | 2026-06-14                                  |
| Variant    | `qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled`     |

## Tooling

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Coding agent      | Pi                                                                    |
| Model provider    | `omlx` — local MLX inference on-device (4-bit quantized)              |
| Plugins installed | -                                                                     |
| Plugins used      | `fabled` skill (invoked as the build skill — recorded in the Skill field) |
| Tools available   | read, bash, edit, write (pi built-ins)                                |
| References        | [pi.dev](https://pi.dev/), [Qwen](https://github.com/QwenLM/Qwen3), [oMLX](https://omlx.ai/) |

## Inputs

| Field               | Value                                                                                       |
|---------------------|---------------------------------------------------------------------------------------------|
| Prompt count        | 3 (1 original build + 2 corrective bug-fix turns)                                            |
| Prompt              | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Thinking level      | off                                                                                         |
| Tools enabled       | read, bash, edit, write (pi built-ins)                                                      |

## Measured

| Metric                 | Value                                                                                          |
|------------------------|------------------------------------------------------------------------------------------------|
| Tokens in              | 474,880 (full-prompt length summed across the 14 build chat-completions; shared prefix re-counted each turn) |
| Tokens out             | 31,172 (completion, summed across the 14 build chat-completions)                               |
| Cache read tokens      | not separately metered — oMLX KV-caches the shared prefix (see Notes) but meters the full prompt |
| Total tokens           | 506,052 (in + out)                                                                             |
| Cost (USD)             | **$0** — local on-device inference via MLX; no API calls, no per-token billing                |
| Wall-clock (active)    | **796 s (~13.3 min)** — sum of generation time across the 3 build prompts; idle gaps excluded |
| Wall-clock per prompt  | prompt 1 (create): 209.5 s · prompt 2 (fix 1): 168.8 s · prompt 3 (fix 2): 417.9 s            |
| Tokens per prompt      | p1: 104,968 in / 7,890 out · p2: 130,013 in / 8,831 out · p3: 239,899 in / 14,451 out        |
| Runnable end-to-end?   | **No** — file renders in a browser but is unplayable (see Verdict + REPORT.md)               |
| Files produced         | 1 — `flappy-bird-3d.html` (single self-contained file, 18 KB)                                  |

> Token counts are **instrument readings** from the oMLX server log
> (`~/.omlx/logs/server.log`, `Chat completion: … prompt: N` lines), build-isolated
> to the **14** chat-completion requests whose end-timestamps map one-to-one (to the
> second) onto the 14 assistant turns of the 3 build prompts (confirmed via the pi
> session JSONL). The pi session JSONL reported `0` usage for these turns (the local
> `omlx` provider does not write usage back into the session record) — the oMLX
> server log is the source of truth instead. Cost is $0 regardless (local inference).

## Verdict

- **Outcome:** **Failed** — a complete, pretty 3D Flappy Bird was authored, but it was never playable. The bird spawned on the pipe-gap boundary (instant collision), the pipe-recycling had a mesh-index drift bug, and flight physics never matched the genre. Two corrective turns fixed symptoms without re-deriving the geometry from first principles; the root cause was only exposed in prompt 3 by a forced physics simulation, and was never browser-verified by the user before the run was logged.
- **Notes:**
    - **Local model, so cost is $0.** Token usage *is* recovered (from the oMLX server log): 474,880 prompt + 31,172 completion = 506,052 total across 14 build chat-completions / 3 prompts. Cost is not comparable to cloud-API contenders; token counts are.
    - **Token-counting caveat:** oMLX's `Chat completion` line logs the **full prompt length** each request (the shared prefix is re-counted every turn as the conversation grows). oMLX runs a boundary KV-cache, but the server meters the full prompt, so the 474,880 input figure is a full-prompt sum, not cache-adjusted. There is no separate `cache_read` token field.
    - **Wall-clock is active-time only** — the sum of per-completion generation times across the 3 build prompts (796 s). The ~3 min of idle user-testing gaps between prompts, and the later `exp-bundle` packaging turns, are excluded.
    - **Fabled was invoked but Phase 4 was not executed in spirit.** The skill's Mode B (run real checks) was available via `bash`, but verification was a lexical/string scan plus a self-ticked table — never a simulation of the shipped game logic. The boundary bug that made the game unplayable is invisible to a string check and obvious to a 10-line physics loop.
    - **Contrast with the control:** the same model with **no** Fabled skill (`qwen3.6-35b-a3b-ud-mlx-4bit-pi`, control) shipped a working, playable build in 2 prompts. Adding Fabled here added structure that was performed but not enforced, plus two unplayable iterations — net-negative on this task for this model at 4-bit.
