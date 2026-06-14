# SPEC

> Field names match `spec.template.md` exactly — kept identical across runs so
> contenders line up for side-by-side comparison. Companion to `JOURNEY.md`.

## Identity

| Field | Value |
| --- | --- |
| Model | `gemma-4-26B-A4B-it-MLX-8bit` |
| Skill | `fabled` |
| Agent | Pi |
| Role | challenger |
| Variant | `gemma-4-26b-a4b-it-mlx-8bit-pi-fabled` |

## Tooling

| Field | Value |
| --- | --- |
| Plugins installed | pi built-in tools (read, bash, edit, write); `fabled` + `exp-bundle` skills in the agent skill registry |
| Plugins used this session | `fabled` (skill) |
| Tools available | read, bash, edit, write (pi built-ins) |
| Sandbox / environment | Local on-device inference via oMLX (OpenAI-compatible server, MLX 8-bit quant), macOS; Pi agent |

## Inputs

| Field | Value |
| --- | --- |
| Prompt | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Reference links | [pi.dev](https://pi.dev/) · [Fabled skill](https://github.com/) |

## Measured

| Field | Value |
| --- | --- |
| Tokens in | 822,446 (prompt, summed across the 19 build completions; full prompt length per request) |
| Tokens out | 21,377 (completion, summed across the 19 build completions) |
| Cache read tokens | not separately metered — oMLX KV/prefix-cached the shared prefix, but reports full prompt length per request |
| Total tokens | 843,823 (in + out) |
| Cost (USD) | **$0** — local on-device inference via MLX; no API calls, no per-token billing |
| Wall-clock time | **~24.7 min (1,483 s)** build span, first→last build completion |
| Wall-clock detail | active model compute ≈ 414 s (~6.9 min); remainder (~1,069 s / 17.8 min) is user think-time between the 6 steering turns. The model was already loaded (reused from the preceding control run), so no one-time model-load is included. |
| Number of prompts | 6 (1 original build + 5 corrective/steering: "Continue", "you didn't store the file", "controls upside down", "still upside down", "can't control at all") |
| Metrics source | Token counts are **instrument readings** from the oMLX server log (`~/Library/Application Support/oMLX/logs/server.log`, per-request `Chat completion: … prompt: N` lines), build-isolated turns (HKT 23:37:29 → 00:02:12, i.e. after the preceding `gemma-4-26b-a4b-it-mlx-8bit-pi` control run ended at 23:28:29 and before this `exp-bundle` packaging prompt). |

> Any field that could not be measured is recorded as "not recorded" rather
> than estimated or omitted. Cost is exactly $0 (local model), not an estimate.

## Verdict

| Field | Value |
| --- | --- |
| Outcome | success (delivered, with caveats) |
| Summary | Delivered a single-file 3D Flappy Bird (vanilla JS + pinned Three.js r158) with a pure logic/render split. Correct flight physics was reached **only in the final (6th) iteration** after three user-driven corrections of inverted/broken controls — the skill's structure did not stop the model from repeatedly getting a core mechanic wrong. Verified by static trace (`node --check` OK, logic reviewed) but **not** browser-executed, and the user never confirmed the last fix playable. |
