# SPEC

## Identity

| Field   | Value                  |
|---------|------------------------|
| Model   | gpt-5.5                |
| Skill   | —                      |
| Agent   | Codex                  |
| Role    | control                |
| Variant | `gpt-5-5-no-omo-codex` |

## Tooling

| Field                     | Value                                                                                                                                                                                 |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Plugins installed         | Atlassian Rovo, Browser, Documents, Figma, GitHub, Presentations, Spreadsheets                                                                                                        |
| Plugins used this session | Browser plugin attempted for in-app verification; Browser endpoint unavailable, so verification fell back to local Chrome. No Fabled/OMO skill used.                                  |
| Tools available           | Serena initial instructions, shell, apply_patch, Node syntax check, Python http.server, curl, headless Google Chrome screenshots, image inspection, temporary Playwright CLI attempts |
| Sandbox / environment     | unrestricted filesystem; network enabled; static HTML/CSS/ES module game in `/Users/isaac_ng/Documents/gpt-5-5-no-omo-codex`; served on `http://localhost:4173` during verification   |

## Inputs

| Field                               | Value                                                                                     |
|-------------------------------------|-------------------------------------------------------------------------------------------|
| Prompt                              | Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable. |
| Reference links                     | - [OpenRouter GPT-5.5 benchmarks](https://openrouter.ai/openai/gpt-5.5#benchmarks)        
 - [Codex](https://openai.com/codex) |

## Measured

| Field             | Value                                                                                                                                                                                                          |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tokens in         | 1,085,773                                                                                                                                                                                                      |
| Tokens out        | 15,470                                                                                                                                                                                                         |
| Cache read tokens | 945,024                                                                                                                                                                                                        |
| Total tokens      | 1,101,243                                                                                                                                                                                                      |
| Cost (USD)        | ~$3.0                                                                                                                                                                                                          |
| Wall-clock time   | 7m 29s (user-provided run reference; rollout timestamps show ~7m 26s to the last pre-bundle token event)                                                                                                       |
| Number of prompts | 1                                                                                                                                                                                                              |
| Metrics source    | Codex rollout token_count events in `~/.codex/sessions/2026/06/14/rollout-2026-06-14T17-47-10-019ec587-2bf3-7a60-be4c-36b56ae80d0e.jsonl`; exp-bundle parser did not support Codex token_count schema directly |

> Any field that could not be measured is recorded as "not recorded" rather
> than estimated or omitted.

## Verdict

| Field   | Value                                                                                                                                          |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Outcome | success                                                                                                                                        |
| Summary | Delivered — browser-rendered 3D Flappy Bird-style static web game with click/tap/keyboard controls, scoring, restart, and Chrome render checks |
