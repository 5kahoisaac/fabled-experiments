# SPEC — Experiment 01 · glm-5-1-fabled

> Run parameters for the **challenger** contender. Field names match the
> baseline `SPEC.md` so the two runs line up for side-by-side comparison.

## Identity

| Field      | Value      |
|------------|------------|
| Experiment | exp-01     |
| Role       | challenger |
| Model id   | `glm-5.1`  |
| Skill      | `fabled`   |
| Date       | 2026-06-13 |

## Tooling

| Field        | Value                     |
|--------------|---------------------------|
| Coding agent | Pi                        |
| Plugins      | -                         |
| References   | [pi.dev](https://pi.dev/) |

## Inputs

| Field               | Value                                                                                       |
|---------------------|---------------------------------------------------------------------------------------------|
| Prompt count        | 1                                                                                           |
| Prompt              | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.` |
| Temperature         | not recorded (zai provider default)                                                         |
| Max thinking tokens | `medium` (set by pi)                                                                        |
| Tools enabled       | read, bash, edit, write (pi built-ins)                                                      |

## Measured

| Metric               | Value                                                                                        |
|----------------------|----------------------------------------------------------------------------------------------|
| Input tokens         | 40,379                                                                                       |
| Output tokens        | 34,235                                                                                       |
| Cache read tokens    | 374,400                                                                                      |
| Cache write tokens   | 0                                                                                            |
| Total tokens         | 449,014                                                                                      |
| Est. cost (USD)      | $0.73 (input $0.057 + output $0.151 + cache-read $0.524, at $0.0014/$0.0044 per kToken)      |
| Wall-clock           | 498 s (~8.3 min)                                                                             |
| Runnable end-to-end? | Yes — opens in browser; 72,086/72,086 logic assertions pass; Gate B clean (0 banned strings) |
| Files produced       | 2 — `flappy-bird-3d.html` (843 lines, 27 KB), `test-logic.js` (245 lines, 8.8 KB)            |

## Verdict

- **Outcome:** Delivered — single-file 3D Flappy Bird, pure-logic/render split with `==LOGIC-START==`/`==LOGIC-END==`
  markers, 72k assertions passing (25 distinct behaviors + 600 s pipe-recycling stress invariant), Gate B clean, zero
  placeholders.
- **Notes:**
    - Token counts are **instrument readings** from pi's session JSONL (`usage` field on each assistant message), not
      estimates. Cost ($0.73) calculated from GLM-5.1 pricing: input $0.0014/kToken, output $0.0044/kToken,
      cache read assumed same rate as input. If cache read is free or discounted, cost drops to ~$0.21.
    - The 374k cache-read tokens reflect pi's aggressive prompt caching across 13 assistant turns within one prompt.
    - Wall-clock (498 s) is wall time from first to last API response for prompt 1, measured from session timestamps.
    - Compared to baseline: ~2× the measured assertions (72k vs 36), ~2 fewer test files (consolidated into one), same
      deliverable shape (single HTML + test runner). Baseline's cost (~$2.30) is an estimate; this run's $0.73 is
      calculated from published GLM-5.1 per-token rates applied to instrument readings.
    - The Fabled skill added ~6 KB of process overhead to the prompt context (skill file + matched example), which is
      included in the 40k input tokens.
