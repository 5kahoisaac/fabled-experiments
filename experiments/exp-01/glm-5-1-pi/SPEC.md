# SPEC — Experiment 01 · glm-5-1-pi

> Run parameters for the **control** contender. Field names match the
> baseline and challenger SPECs so the runs line up for side-by-side comparison.

## Identity

| Field      | Value            |
|------------|------------------|
| Experiment | exp-01           |
| Role       | control          |
| Model id   | `glm-5.1`        |
| Skill      | — (none invoked) |
| Agent      | Pi               |
| Date       | 2026-06-13       |
| Variant    | `glm-5-1-pi`     |

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
| Max thinking tokens | not recorded                                                                                |
| Tools enabled       | read, bash, edit, write (pi built-ins)                                                      |

## Measured

| Metric               | Value                                                                                   |
|----------------------|-----------------------------------------------------------------------------------------|
| Input tokens         | 30,857                                                                                  |
| Output tokens        | 18,710                                                                                  |
| Cache read tokens    | 266,880                                                                                 |
| Cache write tokens   | 0                                                                                       |
| Total tokens         | 316,447                                                                                 |
| Est. cost (USD)      | $0.50 (input $0.043 + output $0.082 + cache-read $0.374, at $0.0014/$0.0044 per kToken) |
| Wall-clock           | 454 s (~7.6 min)                                                                        |
| Runnable end-to-end? | Yes — opens in browser; full READY → PLAY → DEAD → retry lifecycle; 0 console errors    |
| Files produced       | 1 — `flappy-bird-3d.html` (single self-contained file, 26 KB)                           |

## Verdict

- **Outcome:** Delivered — single-file 3D Flappy Bird (Three.js), browser-verified end-to-end via
  headless automation: WebGL canvas rendering at 1280×577, zero console errors, full game lifecycle
  (start → flap → collision → game-over → retry) exercised, retry path confirmed.
- **Notes:**
    - Token counts are **instrument readings** from pi's session JSONL (`usage` field), build-isolated
      to the 11 assistant turns of the actual build (rows 0–21 of the session). The packaging/metadata
      turns that followed (invoking `exp-bundle` to write this record) are explicitly excluded so the
      numbers describe the build, not the bookkeeping.
    - Cost ($0.50) calculated from GLM-5.1 published per-token rates: input/cache-read $0.0014/kToken,
      output $0.0044/kToken. If cache-read is free or discounted, cost drops to ~$0.13.
    - This is the **control** run: same model (`glm-5.1`) and agent (`Pi`) as the `glm-5-1-fabled`
      challenger, but with **no `Fabled` skill** in the context. It isolates what GLM-5.1 + Pi produce
      on the bare prompt, against what the skill adds.
    - Unlike the challenger (which split pure logic from rendering and shipped a 245-line test harness
      with 72,086 assertions), this control shipped a single self-contained HTML file and verified the
      shipped game directly in a real browser rather than via extracted-logic unit tests.
    - No `Fabled` process overhead in the prompt context — compare its 30,857 input tokens (incl. system
      prompt + tools) against the challenger's 40,379 (which carried the ~6 KB skill file + example).
