# SPEC

## Identity

| Field | Value |
|---|---|
| Model | `gpt-5.5` |
| Skill | `fabled` |
| Agent | `Codex` |
| Role | `challenger` |
| Variant | `gpt-5-5-no-omo-codex-fabled` |

## Tooling

| Field | Value |
|---|---|
| Plugins installed | Atlassian Rovo, Browser, Documents, Figma, GitHub, Presentations, Spreadsheets |
| Plugins used this session | Browser capabilities via Node REPL/Playwright verification |
| Tools | shell, apply_patch, Serena project activation, Node REPL, Playwright, screenshot inspection |

## Prompt

`$fabled Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Metrics

| Field | Value |
|---|---|
| Tokens in | 2,732,909 |
| Tokens out | 25,186 |
| Cache read tokens | 2,557,824 |
| Reasoning output tokens | 3,599 |
| Total tokens | 2,758,095 |
| Cost (USD) | ~$4.82 |
| Wall-clock time | ~17m 48s |
| Number prompts | 1 |
| Metrics source | Codex session log `token_count` event at `2026-06-14T10:07:19.533Z`; the exp-bundle parser returned null because this Codex log stores usage under `event_msg.payload.type = token_count`, not top-level `usage`. |

## Outcome

| Field | Value |
|---|---|
| Outcome | success |
| Summary | Delivered a browser-verified 3D Flappy Bird style game with keyboard, pointer, touch controls, scoring, restart, pure logic tests, desktop/mobile screenshots, and a clean banned-string scan. |

