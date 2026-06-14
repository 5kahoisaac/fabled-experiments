# JOURNEY — Experiment 01 · glm-5.1 · OpenCode

> The **failure process** for this run: how the task started, where it stalled,
> what repeated, and what the logs showed. This is the qualitative companion to
> the failed-run numbers in `SPEC.md`.

## Setup recap

- Model: `glm-5.1`
- Agent: OpenCode `OpenCode-Builder`
- Skill: `fabled`
- Prompt: `Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

## Timeline

1. **Started the Fabled path normally.**  
   OpenCode created the session with `glm-5.1`, invoked `fabled`, and began the builder loop.

2. **Loaded the right references.**  
   It read the Fabled example index and the 3D web-game example. The skill was not missing or broken at load time.

3. **Did the planning work but did not ship.**  
   The run produced a clear internal plan for a one-file 3D Flappy Bird game, but no final game file was confirmed from this failed OpenCode run.

4. **Entered the bad continue loop.**  
   After the first continue/recovery attempt, OpenCode repeatedly started a new `zai-coding-plan/glm-5.1` stream.

5. **Hit the same transport failure repeatedly.**  
   Each retry died around the 60-second mark with `The socket connection was closed unexpectedly`.

6. **Compact did not help.**  
   Compaction preserved enough task state to continue, but it did not change the provider stream behavior. The same long-stream shape failed again.

7. **Cancel/restart did not clear it.**  
   The session was canceled and OpenCode reloaded, but the resumed session hit the same stream failure pattern.

8. **Root cause moved below the task layer.**  
   The evidence pointed away from game logic or Fabled itself and toward OpenCode/Z.ai streaming behavior for long `glm-5.1` coding turns.

## Observations

- The model got far enough to plan the build, but the run never reached reliable file delivery.
- The failure was repetitive and mechanical, not a creative or reasoning failure.
- The strongest signal was the repeated ~60-second stream death.
- The large Fabled task shape likely triggered the issue, but did not cause it alone.
- OMO was present, but the failed run was logged under `OpenCode-Builder`, so OMO was not proven as the direct cause.

## Takeaway

- This run failed as a transport/runtime reliability test, not as a Flappy Bird implementation test. `glm-5.1` plus OpenCode's generic Z.ai stream path could not survive the long Fabled build shape.
