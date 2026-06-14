# SPEC

## Identity

| Field | Value |
| --- | --- |
| Model | `gpt-5-mini` |
| Skill | `fabled` |
| Agent | Pi |
| Role | challenger |
| Variant | `gpt-5-mini-gh-pi-fabled` |

## Tooling

| Field | Value |
| --- | --- |
| Plugins installed | not recorded |
| Plugins used this session | none |
| Tools available | read, bash, edit, write (pi built-ins) |
| Sandbox / environment | Local development machine (macOS); pi session log (model gpt-5-mini accessed via GitHub Copilot provider) |

## Inputs

| Field | Value |
| --- | --- |
| Prompt | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Reference links | [Benchmarks](https://openrouter.ai/openai/gpt-5.5#benchmarks) · [pi.dev](https://pi.dev/) · [Copilot](https://github.com/features/copilot) |

## Measured

| Field | Value |
| --- | --- |
| Tokens in | 16,185 |
| Tokens out | 14,345 |
| Cache read tokens | 47,872 |
| Total tokens | 78,402 |
| Cost (USD) | $0.0339 |
| Wall-clock time | ~127 s (~2.1 min active; idle gaps >60 s excluded) |
| Number of prompts | 2 (1 original + 1 additional — file was not written on turn 1) |
| Metrics source | pi session JSONL `usage` field, scoped first prompt → deliverable saved (excludes the exp-bundle packaging turn) |

> Metrics are scoped to the build: from the first user prompt
> (2026-06-14T01:51:52Z) to the deliverable being written to disk
> (2026-06-14T01:55:52Z). Wall-clock is active time only — idle gaps >60 s
> between events (developer looking for the file / reading) are excluded.
> Any field that could not be measured is recorded as "not recorded" rather
> than estimated or omitted.

## Verdict

| Field | Value |
| --- | --- |
| Outcome | success |
| Summary | Delivered a single-file 3D Flappy Bird (three.js 0.152.2) with a pure logic/render split; Fabled Phase 4 ran as a **static trace (Mode A)** — the artifact was not executed in a browser. Saved to disk on a follow-up turn after turn 1 emitted the code inline. |
