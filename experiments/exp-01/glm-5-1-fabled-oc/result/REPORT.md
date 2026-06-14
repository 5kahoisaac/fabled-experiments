# Incident Report: OpenCode Fabled Task Failure With GLM-5.1

## Executive Summary

Running the Fabled 3D Flappy Bird build in OpenCode failed because the `glm-5.1` stream from `zai-coding-plan`
repeatedly died during long generation. The task itself did not fail because Fabled could not load, and it did not fail
because the game requirements were impossible. It failed because OpenCode's LLM stream to Z.ai kept closing around the
60-second mark.

Strongest root cause: OpenCode's generic `@ai-sdk/openai-compatible` streaming path is brittle with Z.ai Coding Plan
`glm-5.1` during long reasoning/tool/code-generation turns.

Second root cause: Z.ai GLM-5.1 Coding Plan streams have known reliability issues under long sessions, including socket
closes, malformed/truncated SSE chunks, timeout behavior, and fatal client parse failures.

Fabled was the trigger, not the root cause. It creates a large, long-running single-task shape, so it makes the stream
bug much easier to hit.

oh-my-openagent (OMO) is not proven to be the direct cause. It is installed and may amplify risk by routing to `glm-5.1`
and allowing high concurrency, but the failed run was logged under `agent=OpenCode-Builder`, not an OMO
Sisyphus/background agent.

## What Was Being Run

User task:

`Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.`

Workflow:

`/fabled`

Working directory:

`/Users/isaac_ng/Documents/flappy-bird`

Target model/provider:

`zai-coding-plan/glm-5.1`

OpenCode version in log:

`1.17.4`

Relevant failed session:

`ses_142f6fa75ffeWJ0LcJ6g5FC7o7`

## Evidence From OpenCode Log

Global log inspected:

`/Users/isaac_ng/.local/share/opencode/log/opencode.log`

Key log facts:

- `2026-06-12T18:12:25.610Z`: OpenCode created the flappy-bird session with `model.id=glm-5.1` and
  `model.providerID=zai-coding-plan`.
- `2026-06-12T18:12:25.622Z`: OpenCode recorded `command=fabled`.
- `2026-06-12T18:12:25.708Z`: OpenCode started streaming from `providerID=zai-coding-plan modelID=glm-5.1`.
- `2026-06-12T18:14:16-18:14:22Z`: OpenCode read Fabled reference files.
- `2026-06-12T18:27:52.497Z`: OpenCode started another `glm-5.1` stream.
- `2026-06-12T18:28:52.675Z`: the stream failed about 60 seconds later.

Observed error:

```text
AI_APICallError: Cannot connect to API: The socket connection was closed unexpectedly.
```

The same pattern repeated many times:

- `18:28:54 -> 18:29:54`, failure after about 60s
- `18:29:58 -> 18:30:59`, failure after about 60s
- `18:31:07 -> 18:32:07`, failure after about 60s
- `18:33:54 -> 18:34:54`, failure after about 60s
- `18:41:54 -> 18:42:54`, failure after about 60s
- `18:42:56 -> 18:43:57`, failure after about 60s
- `18:44:01 -> 18:45:01`, failure after about 60s

Important log path:

```text
llm.runtime=ai-sdk llm.provider=zai-coding-plan llm.model=glm-5.1
providerID=zai-coding-plan pkg=@ai-sdk/openai-compatible using bundled provider
```

This means OpenCode was using the AI SDK OpenAI-compatible provider path.

## Performance Signals During The Failure Window

The failure window also shows several performance and runtime-pressure signals. None alone proves root cause, but
together they explain why this task was likely to trigger the stream failure.

### Large Skill Surface Loaded

At startup, OpenCode reports:

```text
message=init count=262
```

During the same startup, the log emits many `duplicate skill name` warnings. Examples include `fabled`, `tdd-workflow`,
`verification-loop`, `frontend-slides`, `backend-patterns`, `coding-standards`, `strategic-compact`, and many others.

Observed effects:

- More startup/indexing work.
- Larger command/skill surface available to the session.
- More duplicate-resolution noise.
- More prompt/tool metadata pressure if the runtime includes broad skill/tool context.

This does not directly cause a socket close, but it makes OpenCode sessions heavier and may increase time-to-first-use
and context/tool overhead.

### Long Silent Model Phases Before The Hard Failure Loop

The first part of the Fabled run had long stream intervals without immediate socket errors:

- `18:12:25 -> 18:14:10`: about 105 seconds before the next visible stream/log step.
- `18:16:50 -> 18:26:33`: about 9 minutes 43 seconds before the loop exited.

This suggests GLM-5.1 could sometimes hold long reasoning/generation phases without obvious progress in the log. Later,
after continuation and todo setup, the run entered the repeated socket-death pattern around 60 seconds.

Interpretation:

- The model/provider can spend long periods thinking or generating for Fabled.
- The task shape creates silent gaps that are dangerous for SSE/streaming transports.
- Once the stream hits the provider/client idle/connection failure mode, `continue` repeats the same failure shape.

### Repeated 60-Second Stream Deaths

The strongest performance signal remains the repeated cadence:

```text
start stream -> about 60s silence/work -> socket connection closed unexpectedly
```

The log repeatedly shows `message="stream error"` for the same provider/model/session, almost exactly one minute after
each stream starts. This matches public reports of idle timeout, connection-pooling, stream watchdog, or provider/proxy
timeout failures.

### Cancellation And Restart Did Not Fix It

The user canceled twice around:

- `18:40:25`: process aborted.
- `18:41:26`: process aborted again.

OpenCode then created/reloaded instances and resumed the same session. The stream error pattern continued under a new
run id.

Interpretation:

- This was not a single poisoned process state.
- Restarting/re-entering the session did not change the failing stream behavior.
- The persistent factor was the task/model/provider/stream shape.

### LSP And Config Load Were Not The Bottleneck

During restart, OpenCode loaded config and enabled LSP servers quickly:

```text
loading path=/Users/isaac_ng/.config/opencode/opencode.json
enabled LSP servers ...
all formatters are disabled
init
```

This shows local project boot was not the main bottleneck. The failure occurred after the LLM stream began.

## Why The Task Got Fucked

The task failed because the agent kept retrying the same dangerous shape:

```text
large Fabled task
-> long GLM-5.1 generation stream
-> OpenCode @ai-sdk/openai-compatible stream path
-> Z.ai stream closes around 60s
-> OpenCode surfaces fatal stream error
-> compact/continue retries the same long-stream shape
-> repeat failure
```

Compaction did not fix it because the underlying failure was not just context size. The stream kept dying after
continuation too. The continuation loop resumed the task, but it did not change the transport behavior, provider timeout
behavior, stream parser behavior, or task chunking strategy.

## Root-Cause Ranking

1. **OpenCode/Z.ai stream compatibility bug**: highly likely. Evidence: repeated 60-second socket failures, generic
   `@ai-sdk/openai-compatible` path, public OpenCode issues for similar failures.

2. **Z.ai GLM-5.1 stream instability**: highly likely. Evidence: public Z.ai/OpenCode reports about GLM-5.1 SSE
   truncation, malformed stream chunks, and connection failures.

3. **Fabled long-task shape**: likely trigger. Fabled asks for full-file generation, verification, no placeholders, and
   multi-phase planning. That increases stream length.

4. **OMO plugin interference**: possible amplifier, unlikely direct cause. OMO is installed and config references
   `zai-coding-plan/glm-5.1`, but the failure was logged under `OpenCode-Builder`.

5. **Local network only**: possible but not primary. Similar public failures exist, and another client reportedly works
   in the same environment.

## Fabled Assessment

Fabled loaded successfully.

Evidence:

- The log records `command=fabled`.
- OpenCode read Fabled references:
  `/Users/isaac_ng/.agents/skills/fabled/references/examples/index.md`
- OpenCode read Fabled references:
  `/Users/isaac_ng/.agents/skills/fabled/references/examples/web-3d-game.md`

Fabled made the workload harder, but the crash was not a Fabled validation failure. It was an LLM stream failure.

## OMO Assessment

OMO is active in the local OpenCode config:

```json
"plugin": [
"@nick-vi/opencode-type-inject@latest",
"opencode-openai-codex-auth@latest",
"opencode-historian@latest",
"oh-my-openagent@latest"
]
```

OMO config includes high Z.ai concurrency:

```json
"providerConcurrency": {
"zai-coding-plan": 10
},
"modelConcurrency": {
"zai-coding-plan/glm-5.1": 10
}
```

OMO config also includes:

```json
"staleTimeoutMs": 60000
```

The 60-second value is suspicious because the failures happened around 60 seconds. However, the failed Fabled stream was
logged as:

```text
agent=OpenCode-Builder
```

not as an OMO Sisyphus/background agent. The error was emitted by the LLM stream layer, not by OMO task management.

Conclusion: OMO may increase risk elsewhere, especially under concurrent/background use. It is not proven to be the
direct cause of this Fabled failure.

## Known Public Issues

Related public issues found:

- `anomalyco/opencode#1692`: `The socket connection was closed unexpectedly`; maintainers discuss provider connection
  drops and retry behavior.
- `anomalyco/opencode#4349`: Z.ai coding model connection/timeout issue; suggests increasing `zai-coding-plan` provider
  timeout.
- `anomalyco/opencode#23442`: `zai-coding-plan/glm-5.1` SSE JSON parse failures and malformed/truncated stream chunks.
- `zai-org/GLM-5#66`: GLM-5.1 streaming chunks can be truncated/malformed, breaking OpenCode and other clients.
- `anomalyco/opencode#22803`: OpenAI-compatible streaming failures in reasoning/tool-using agent runs.
- `anomalyco/opencode#30221`: transient network error retry classification gaps, including Z.ai/GLM context.
- `anomalyco/opencode#2898`: GLM Coding Plan frequent errors/timeouts.

Additional performance-related feedback found:

- `anomalyco/opencode#15350`: `ECONNRESET with zai-coding-plan provider (api.z.ai)`. Reports failures after about 40-100
  seconds, same endpoint family, curl works while OpenCode fails. The report hypothesizes Bun HTTP connection pooling,
  Z.ai idle timeout, and stale keep-alive reuse. Suggested fixes include disabling keep-alive for Z.ai, retrying with a
  fresh connection on `ECONNRESET`, or reducing connection pool lifetime for streaming endpoints.

- `anomalyco/opencode#12233`: `StreamIdleTimeoutError` during large tool input generation. Describes a 60-second no-data
  timeout, retry loop, and the model repeatedly attempting the same large failing operation. This resembles the Fabled
  failure shape: large output/tool/code generation, a silent stream gap, then retrying the same thing.

- `anomalyco/opencode#25509`: AI SDK `streamText()` default `stepMs` timeout can hard-limit long tool executions to 120
  seconds if OpenCode does not pass timeout settings through correctly. Not the same 60-second socket error, but it is
  another OpenCode long-task timeout problem in the same stack layer.

- `anomalyco/opencode#25587`: provider `chunkTimeout` not propagated to Vercel AI SDK `streamText`, meaning provider
  timeout config may not fully protect the SDK stream consumer from idle timeout behavior.

- `anomalyco/opencode#31281`: large tool outputs can stall SSE with `Upstream idle timeout exceeded` while the provider
  processes a large `tool_result`. This matches the broader class: long silent gap during provider processing kills the
  event stream even though work is still active.

- `vercel/ai#12949`: Z.ai/GLM stream through AI Gateway can hit idle timeouts during tool-call streaming, especially
  when GLM generates tool-call arguments in one bulk batch instead of streaming incrementally. The issue reports
  30-second silence gaps and remote connection resets. It also mentions GLM reasoning parts being skipped by generic
  OpenAI conversion paths.

These issues make this look like a known OpenCode/Z.ai/provider-stream reliability class, not a one-off broken skill.

## Online Feedback Pattern

Across the related issues, the recurring feedback is consistent:

- Z.ai/GLM often works for short prompts but fails or stalls in long coding/tool sessions.
- Curl or another client can work while OpenCode fails, which points to client/runtime handling, not just credentials or
  endpoint availability.
- Failures often appear after fixed idle windows: 30 seconds, 60 seconds, 120 seconds, or 40-100 seconds depending on
  layer.
- Long tool-call argument generation is risky because some GLM models emit bulk tool input instead of steady
  token-by-token chunks.
- Generic OpenAI-compatible adapters can mishandle provider-specific reasoning parts, SSE framing, timeout propagation,
  and retry classification.
- Several suggested fixes are client-side resilience fixes: fresh connection retry, timeout propagation, split-on-
  `data:` fallback, skip malformed chunk and continue, disable/adjust keep-alive, and provider-aware reasoning handling.

The Fabled failure fits this online pattern closely.

## Debug Progress

1. Confirmed the failing task was a Fabled run in `/Users/isaac_ng/Documents/flappy-bird`.

2. Confirmed Fabled loaded and read reference examples.

3. Confirmed repeated failures occur at the LLM stream layer.

4. Confirmed repeated failures happen around 60 seconds.

5. Confirmed OpenCode uses `ai-sdk` and `@ai-sdk/openai-compatible` for this provider path.

6. Checked OMO config and found it is active, but not the logged owner of the failed run.

7. Found public OpenCode and Z.ai issues matching this failure class.

8. Confirmed the current root cause is transport/client/provider behavior, not source-code generation logic.

9. Checked the local failure window for performance signals and found heavy skill initialization, many duplicate skill
   warnings, long silent GLM phases, repeated 60-second stream deaths, and cancellation/restart not resolving the issue.

10. Gathered additional online feedback showing similar OpenCode/Z.ai and AI SDK timeout/stream failure classes,
    especially in long coding/tool sessions.

## Recommended Mitigations

Add provider timeout override in `~/.config/opencode/opencode.json`:

```json
{
  "provider": {
    "zai-coding-plan": {
      "options": {
        "timeout": 600000
      }
    }
  }
}
```

Reduce OMO concurrency while testing:

```json
"providerConcurrency": {
"zai-coding-plan": 1
},
"modelConcurrency": {
"zai-coding-plan/glm-5.1": 1
}
```

Avoid `glm-5.1` for Fabled one-shot builds in OpenCode until streaming is reliable.

For Fabled tasks, force smaller phases:

```text
Use Fabled, but do not write the full file in one model turn. First produce the contract, then write files in separate tool edits, then verify.
```

If OpenCode supports non-streaming for this provider, test it. If non-streaming works, the failure is specifically
SSE/stream handling.

## Bottom Line

The task got fucked because OpenCode kept putting a long Fabled build through a fragile GLM-5.1 streaming path. The
model/provider stream repeatedly closed around 60 seconds, and OpenCode did not recover by chunking, resuming, or
switching transport. Fabled triggered the stress case. OMO may amplify `glm-5.1` usage but is not proven as the direct
cause for this `OpenCode-Builder` run.
