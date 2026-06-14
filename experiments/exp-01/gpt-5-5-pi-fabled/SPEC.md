# SPEC

## Identity

| Field   | Value               |
|---------|---------------------|
| Model   | `gpt-5.5`           |
| Skill   | `fabled`            |
| Agent   | Pi                  |
| Role    | challenger          |
| Variant | `gpt-5-5-pi-fabled` |

## Tooling

| Field                    | Value                                                                                                                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Plugins installed        | not recorded                                                                                                                                                                      |
| Skills used this session | frontend-design                                                                                                                                                                   |
| Tools available          | read, bash, edit, write (Pi built-ins)                                                                                                                                            |
| Sandbox / environment    | Local Pi coding agent harness in `/Users/isaac_ng/Documents/gpt-5-5-pi`; browser artifact served with `python3 -m http.server`; runtime CDN dependency pinned to Three.js 0.164.1 |

## Inputs

| Field           | Value                                                                                               |
|-----------------|-----------------------------------------------------------------------------------------------------|
| Prompt          | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`         |
| Reference links | [OpenRouter benchmarks](https://openrouter.ai/openai/gpt-5.5#benchmarks), [pi.dev](https://pi.dev/) |

## Measured

| Field             | Value                                                                                                                                                                                                                                                                                                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tokens in         | ~29,000                                                                                                                                                                                                                                                                                                                                                               |
| Tokens out        | ~10,000                                                                                                                                                                                                                                                                                                                                                               |
| Cache read tokens | ~134,000                                                                                                                                                                                                                                                                                                                                                              |
| Total tokens      | ~173,000 (input + output + cache read)                                                                                                                                                                                                                                                                                                                                |
| Cost (USD)        | $0.516 (user-provided run summary)                                                                                                                                                                                                                                                                                                                                    |
| Wall-clock time   | 216.149 s (~3.6 min), measured from first build prompt to build-delivery response; idle time before bundling excluded                                                                                                                                                                                                                                                 |
| Number of prompts | 1                                                                                                                                                                                                                                                                                                                                                                     |
| Metrics source    | Tokens/cost from user-provided run summary: `↑29k ↓10k R134k CH98.2% $0.516 (sub) 9.9%/272k (auto)`; wall-clock from Pi session JSONL `/Users/isaac_ng/.pi/agent/sessions/--Users-isaac_ng-Documents-gpt-5-5-pi--/2026-06-14T08-53-18-288Z_019ec555-d950-7c18-93c4-83e4f979545b.jsonl` lines 5–20; `parse_metrics.py` was attempted before the JSONL path was located |

> Any field that could not be measured is recorded as "not recorded" rather
> than estimated or omitted.

## Verdict

| Field   | Value                                                                                                                                                                                                     |
|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Outcome | success                                                                                                                                                                                                   |
| Summary | Delivered a single-file, playable 3D Flappy Bird-style web game with pinned Three.js, touch/click/keyboard controls, score persistence, gentle mode, inline logic self-checks, and HTTP 200 verification. |
