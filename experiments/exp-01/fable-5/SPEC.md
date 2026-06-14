# SPEC — Experiment 01 · fable-5

> Run parameters for the **baseline** contender. Keep the field names identical
> across every model's `SPEC.md` so runs line up for side-by-side comparison.

## Identity

| Field               | Value            |
|---------------------|------------------|
| Experiment          | exp-01           |
| Role                | baseline         |
| Model id            | `claude-fable-5` |
| Skill               | — (none)         |
| Date                | 2026-06-13       |

## Tooling

| Field        | Value                              |
|--------------|------------------------------------|
| Coding agent | Claude Chat (Web)                  |
| Plugins      | -                                  |
| References   | [claude.ai](https://claude.ai/new) |

## Inputs

| Field               | Value                                                                                       |
|---------------------|---------------------------------------------------------------------------------------------|
| Prompt count        | 1                                                                                           |
| Prompt              | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Temperature         | not recorded                                                                                |
| Max thinking tokens | not recorded                                                                                |
| Tools enabled       | file create/edit, bash (node, python)                                                       |

## Measured

| Metric               | Value                                                                             |
|----------------------|-----------------------------------------------------------------------------------|
| Input tokens         | not measured — est. ~55k (incl. plan derivation)                                  |
| Output tokens        | not measured — est. ~35k; ~8.8k of it is on-disk artifacts                        |
| Total tokens         | not measured — est. ~180k (incl. cache/context across session)                   |
| Est. cost (USD)      | ~$10-18 (est., ~64% of 5h Pro quota at max effort)                                |
| Wall-clock           | ~5 min                                                                            |
| Runnable end-to-end? | Yes — opens in browser; 36/36 logic assertions pass                               |
| Files produced       | 4 — `flappy-bird-3d.html`, `test/logic.js`, `test/render.js`, `test/run-tests.js` |

## Verdict

- **Outcome:** Delivered — single-file 3D Flappy Bird, pure-logic split, 36 assertions passing, Gate B clean, zero
  placeholders.
- **Notes:** Token/cost/temperature/thinking figures are **estimates or unrecorded**, not instrument readings — only
  `~8.8k output tokens` is grounded in measured artifact sizes; everything else (input, thinking, total, cost) is a
  labeled guess. The ~$2.30 reflects this run doing the plan-derivation work that skill-equipped runs get for free, so
  it is *not* directly comparable to a skill-consuming run's cost. For a clean side-by-side, the real
  input/output/thinking split from a usage dashboard should replace the estimated rows.
