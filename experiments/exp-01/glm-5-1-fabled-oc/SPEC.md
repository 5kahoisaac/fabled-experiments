# SPEC — Experiment 01 · glm-5-1-fabled-oc

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

| Field        | Value                                                                                                                              |
|--------------|------------------------------------------------------------------------------------------------------------------------------------|
| Coding agent | OpenCode                                                                                                                           |
| Plugins      | `@nick-vi/opencode-type-inject@latest`, `opencode-openai-codex-auth@latest`, `opencode-historian@latest`, `oh-my-openagent@latest` |
| References   | [opencode.ai](https://opencode.ai/)                                                                                                |

## Inputs

| Field               | Value                                                                                               |
|---------------------|-----------------------------------------------------------------------------------------------------|
| Prompt count        | 1 original prompt, followed by repeated compact/continue recovery attempts                          |
| Prompt              | `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`         |
| Temperature         | 0.3                                                                                                 |
| Max thinking tokens | >32k                                                                                                |
| Tools enabled       | OpenCode default build-agent tools; Fabled references were read; todo tool was used during recovery |

## Measured

| Metric               | Value                                                                                                                          |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Input tokens         | not available from failed OpenCode stream logs                                                                                 |
| Output tokens        | not available from failed OpenCode stream logs                                                                                 |
| Cache read tokens    | not available from failed OpenCode stream logs                                                                                 |
| Cache write tokens   | not available from failed OpenCode stream logs                                                                                 |
| Total tokens         | not available from failed OpenCode stream logs                                                                                 |
| Est. cost (USD)      | not calculated; missing reliable token usage for failed streams                                                                |
| Wall-clock           | failed run spanned multiple compact/continue attempts; first repeated socket-failure loop began ~16 min after session creation |
| Runnable end-to-end? | No — OpenCode did not complete the Fabled task before the user stopped it                                                      |
| Files produced       | 0 confirmed from the failed OpenCode run                                                                                       |

## Verdict

- **Outcome:** Failed — OpenCode did not produce the requested 3D Flappy Bird deliverable under this run.
- **Notes:**
    - OpenCode successfully invoked `fabled` and read the Fabled examples, so the skill itself loaded.
    - The repeated failure was `AI_APICallError: Cannot connect to API: The socket connection was closed unexpectedly.`
    - The failure pattern was repeated GLM-5.1 stream starts followed by socket closure around the 60-second mark.
    - Root cause recorded in `REPORT.md`: OpenCode's generic `@ai-sdk/openai-compatible` streaming path was not robust
      for long Z.ai Coding Plan `glm-5.1` Fabled/task-generation streams.
    - Z.ai GLM-5.1 Coding Plan stream instability is a provider-side contributor; public reports describe socket closes,
      SSE truncation, malformed chunks, and idle-timeout behavior under long coding sessions.
    - Fabled was the trigger, not the primary root cause; it created a long, output-heavy task shape that made the
      stream failure more likely.
    - OMO was installed and may amplify routing/load, but this failed run was logged under `OpenCode-Builder`; OMO is
      not proven as the direct cause.
    - Compact/continue did not fix the problem because it repeated the same long-stream shape.
