/**
 * Experiment data — single source of truth for the showcase.
 *
 * Loaded as a plain script (works on file:// — no fetch/CORS needed).
 * To add a new experiment, append an object to the array below.
 *
 * Schema:
 *   id          string   unique slug, also used for anchors
 *   title       string   short experiment name
 *   episode     string   optional, e.g. "Ep.1"
 *   date        string   ISO date "YYYY-MM-DD"
 *   status      string   "ready" | "running" | "planned"
 *   prompt      string   the exact single prompt every build received
 *   folder      string   relative path to this experiment's folder
 *   doc         string   relative path to the experiment write-up (web-viewable)
 *   contenders  array    one entry per build — N builds, compared to each other
 *     role      string   "baseline"   — pure Fable 5, no Fabled skill
 *                        "challenger" — any model + Fabled + tools (may succeed OR fail)
 *                        "control"    — any model WITHOUT Fabled, as a controlled reference
 *     label     string   display name
 *     model     string   model id
 *     skill     string   skill used, or "—"
 *     agent     string   coding agent / harness used (e.g. "Claude Code", "OpenCode", "Pi")
 *     plugins   array    plugins/extensions actually used during this session
 *                         (string[]) — not the full set installed/enabled in
 *                         the agent; that list belongs in SPEC.md instead
 *     links     array    reference links, each { label, url }
 *     dir       string   the MODEL_NAME folder for this run
 *     result    string   root HTML recording the build result (dir/index.html)
 *     spec      string   SPEC.md — params of this run (for comparing)
 *     journey   string   JOURNEY.md — the thinking process
 *     report    string   optional REPORT.md — incident report for a failed/abnormal run
 *     failed    boolean  optional — true marks the build as failed (distinct styling)
 *     tokens    string   total tokens
 *     cost      string   est. USD
 *     time      string   wall-clock
 *     prompts   number|string  prompt turns (1 for a clean single-prompt run)
 *     outcome   string   short verdict
 *   winner      string   the `dir` of the winning build, or "tbd"
 *   notes       string   freeform caption
 *
 * Layout — one folder per experiment, one sub-folder per MODEL_NAME:
 *   experiments/<id>/
 *     index.html                overview of the experiment
 *     <MODEL_NAME>/
 *       index.html              root HTML recording the result
 *       SPEC.md                 params of the run (for side-by-side compare)
 *       JOURNEY.md              the thinking process
 *       REPORT.md               optional — incident report when a run failed
 *
 * Markdown docs (SPEC.md / JOURNEY.md / REPORT.md) open in the in-browser viewer:
 *   viewer.html?doc=<relative path to .md>
 */
window.EXPERIMENTS = [
    {
        id: "exp-01",
        title: "Experiment 01",
        date: "2026-06-13",
        status: "running",
        prompt:
            "Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.",
        folder: "experiments/exp-01/",
        doc: "experiments/exp-01/index.html",
        contenders: [
            {
                role: "baseline",
                label: "Fable 5",
                model: "claude-fable-5",
                skill: "—",
                agent: "Claude Chat (Web)",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/anthropic/claude-fable-5#benchmarks",
                    },
                    {
                        label: "Claude",
                        url: "https://claude.ai",
                    },
                ],
                dir: "experiments/exp-01/fable-5/",
                result: "experiments/exp-01/fable-5/index.html",
                spec: "experiments/exp-01/fable-5/SPEC.md",
                journey: "experiments/exp-01/fable-5/JOURNEY.md",
                tokens: "~180,000 total (est., incl. cache/context across session)",
                cost: "~$10-18 (est., ~64% of 5h Pro quota at max effort)",
                time: "~5 min (est.)",
                prompts: 1,
                outcome: "Delivered — 36/36 logic assertions pass",
            },
            {
                role: "challenger",
                label: "GLM 5.1",
                model: "glm-5.1",
                skill: "fabled",
                agent: "OpenCode",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/z-ai/glm-5.1#benchmarks",
                    },
                    {
                        label: "OpenCode",
                        url: "https://opencode.ai",
                    },
                ],
                dir: "experiments/exp-01/glm-5-1-fabled-oc/",
                result: "experiments/exp-01/glm-5-1-fabled-oc/index.html",
                spec: "experiments/exp-01/glm-5-1-fabled-oc/SPEC.md",
                journey: "experiments/exp-01/glm-5-1-fabled-oc/JOURNEY.md",
                report: "experiments/exp-01/glm-5-1-fabled-oc/result/REPORT.md",
                failed: true,
                tokens: "not logged",
                cost: "n/a",
                time: "n/a (aborted — repeated ~60 s stream deaths)",
                prompts: "1 prompt + repeated compact/continue recovery",
                outcome: "Failed — GLM-5.1 stream closed in a loop, no deliverable",
            },
            {
                role: "control",
                label: "GLM 5.1",
                model: "glm-5.1",
                skill: "—",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/z-ai/glm-5.1#benchmarks",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/glm-5-1-pi/",
                result: "experiments/exp-01/glm-5-1-pi/index.html",
                spec: "experiments/exp-01/glm-5-1-pi/SPEC.md",
                journey: "experiments/exp-01/glm-5-1-pi/JOURNEY.md",
                tokens: "~316,000 total (31,000 in · 19,000 out · 267,000 cache)",
                cost: "~$0.50",
                time: "~7.6 min",
                prompts: 1,
                outcome:
                    "Delivered — single-file 3D Flappy Bird, browser-verified end-to-end",
            },
            {
                role: "challenger",
                label: "GLM 5.1",
                model: "glm-5.1",
                skill: "fabled",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/z-ai/glm-5.1#benchmarks",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/glm-5-1-fabled/",
                result: "experiments/exp-01/glm-5-1-fabled/index.html",
                spec: "experiments/exp-01/glm-5-1-fabled/SPEC.md",
                journey: "experiments/exp-01/glm-5-1-fabled/JOURNEY.md",
                tokens: "~449,000 total (40,000 in · 34,000 out · 374,000 cache)",
                cost: "~$0.73",
                time: "~8.3 min",
                prompts: 1,
                outcome: "Delivered — 72,086 logic assertions pass, Gate B clean",
            },
            {
                role: "control",
                label: "Qwen 3.6 35B A3B (local)",
                model: "qwen3.6-35b-a3b-ud-mlx-4bit",
                skill: "—",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/qwen/qwen3.6-35b-a3b#benchmarks",
                    },
                    {
                        label: "oMLX",
                        href: "https://omlx.ai/",
                    },
                    {
                        label: "Qwen",
                        url: "https://github.com/QwenLM/Qwen3",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi/",
                result: "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi/index.html",
                spec: "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi/SPEC.md",
                journey: "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi/JOURNEY.md",
                tokens: "139,363 total (130,806 in · 8,557 out)",
                cost: "$0 (local on-device MLX inference)",
                time: "~2.6 min (158s)",
                prompts: "2 (1 original + 1 corrective bug-fix turn)",
                outcome:
                    "Delivered — single-file 3D Flappy Bird; one-line bug-fix turn resolved",
            },
            {
                role: "challenger",
                label: "Qwen 3.6 35B A3B (local)",
                model: "qwen3.6-35b-a3b-ud-mlx-4bit",
                skill: "fabled",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/qwen/qwen3.6-35b-a3b#benchmarks",
                    },
                    {
                        label: "oMLX",
                        url: "https://omlx.ai/",
                    },
                    {
                        label: "Qwen",
                        url: "https://github.com/QwenLM/Qwen3",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled/",
                result:
                    "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled/index.html",
                spec: "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled/SPEC.md",
                journey:
                    "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled/JOURNEY.md",
                report:
                    "experiments/exp-01/qwen3.6-35b-a3b-ud-mlx-4bit-pi-fabled/result/REPORT.md",
                failed: true,
                tokens: "506,052 total (474,880 in · 31,172 out)",
                cost: "$0 (local on-device MLX inference)",
                time: "~13.3 min (796s)",
                prompts:
                    "3 (1 original build + 2 corrective bug-fix turns; build still unplayable)",
                outcome:
                    "Failed — game built but unplayable across 3 prompts; bird spawned on gap boundary (instant collision) + pipe mesh-index drift; never browser-verified",
            },
            {
                role: "control",
                label: "Gemma 4 26B A4B (local)",
                model: "gemma-4-26B-A4B-it-MLX-8bit",
                skill: "—",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/google/gemma-4-26b-a4b-it#benchmarks",
                    },
                    {
                        label: "oMLX",
                        url: "https://omlx.ai/",
                    },
                    {
                        label: "Gemma",
                        url: "https://ai.google.dev/gemma",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi/",
                result: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi/index.html",
                spec: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi/SPEC.md",
                journey: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi/JOURNEY.md",
                tokens: "610,997 total (606,084 in · 4,913 out)",
                cost: "$0 (local on-device MLX inference)",
                time: "~9.8 min (591s)",
                prompts: "4 (1 original + 3 steering: vite-hang recovery, render() bug-fix, make-bundleable)",
                outcome: "Delivered (caveat) — multi-file Three.js+Vite 3D Flappy Bird; vite build compiles to static dist/; NOT browser-verified for gameplay; absolute /assets paths mean file:// won't load, a static server is still required",
            },
            {
                role: "challenger",
                label: "Gemma 4 26B A4B (local)",
                model: "gemma-4-26B-A4B-it-MLX-8bit",
                skill: "fabled",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/google/gemma-4-26b-a4b-it#benchmarks",
                    },
                    {
                        label: "oMLX",
                        url: "https://omlx.ai/",
                    },
                    {
                        label: "Gemma",
                        url: "https://ai.google.dev/gemma",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi-fabled/",
                result: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi-fabled/index.html",
                spec: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi-fabled/SPEC.md",
                journey: "experiments/exp-01/gemma-4-26b-a4b-it-mlx-8bit-pi-fabled/JOURNEY.md",
                tokens: "843,823 total (822,446 in · 21,377 out)",
                cost: "$0 (local on-device MLX inference)",
                time: "~24.7 min (1,483s)",
                prompts: "6 (1 original build + 5 corrective: continue, file-not-stored, 3× inverted-control fix)",
                outcome: "Delivered (caveat) — single-file Three.js r158 3D Flappy Bird with logic/render split; flight physics correct only in the final (6th) iteration after three user-driven control-bug corrections; static-trace verified (node --check OK), NOT browser-verified",
            },
            {
                role: "control",
                label: "GPT-5 Mini",
                model: "gpt-5-mini",
                skill: "—",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Copilot",
                        url: "https://github.com/features/copilot",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-mini-gh-pi/",
                result: "experiments/exp-01/gpt-5-mini-gh-pi/index.html",
                spec: "experiments/exp-01/gpt-5-mini-gh-pi/SPEC.md",
                journey: "experiments/exp-01/gpt-5-mini-gh-pi/JOURNEY.md",
                report: "experiments/exp-01/gpt-5-mini-gh-pi/result/REPORT.md",
                failed: true,
                tokens: "2,073,066 total (118,019 in · 42,087 out · 1,912,960 cache)",
                cost: "$0.1615",
                time: "~7.8 min (470s)",
                prompts:
                    "8 (1 original prompt + 5 steering turns + 2 human-in-the-loop browser-error reports)",
                outcome: "Failed — developer aborted after unresolved browser errors",
            },
            {
                role: "challenger",
                label: "GPT-5 Mini",
                model: "gpt-5-mini",
                skill: "fabled",
                agent: "Pi",
                plugins: [],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Copilot",
                        url: "https://github.com/features/copilot",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-mini-gh-pi-fabled/",
                result: "experiments/exp-01/gpt-5-mini-gh-pi-fabled/index.html",
                spec: "experiments/exp-01/gpt-5-mini-gh-pi-fabled/SPEC.md",
                journey: "experiments/exp-01/gpt-5-mini-gh-pi-fabled/JOURNEY.md",
                tokens: "78,402 total (16,185 in · 14,345 out · 47,872 cache)",
                cost: "$0.0339",
                time: "~2.1 min (127s)",
                prompts: "2 (1 original + 1 additional — file not written on turn 1)",
                outcome:
                    "Delivered — single-file 3D Flappy Bird (three.js 0.152.2), static-trace verification only (not browser-executed)",
            },
            {
                role: "control",
                label: "GPT-5.5",
                model: "gpt-5.5",
                skill: "—",
                agent: "Pi",
                plugins: ["frontend-design", "agent-browser"],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Codex",
                        url: "https://openai.com/codex",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-5-pi/",
                result: "experiments/exp-01/gpt-5-5-pi/index.html",
                spec: "experiments/exp-01/gpt-5-5-pi/SPEC.md",
                journey: "experiments/exp-01/gpt-5-5-pi/JOURNEY.md",
                tokens: "~287,200 total (76,000 in · 8,200 out · 203,000 cache)",
                cost: "$0.730",
                time: "~3.5 min (209.731s)",
                prompts: 1,
                outcome:
                    "Delivered — browser-verified playable multi-file Three.js 3D Flappy Bird build",
            },
            {
                role: "challenger",
                label: "GPT-5.5",
                model: "gpt-5.5",
                skill: "fabled",
                agent: "Pi",
                plugins: ["frontend-design"],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Codex",
                        url: "https://openai.com/codex",
                    },
                    {
                        label: "Pi",
                        url: "https://pi.dev/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-5-pi-fabled/",
                result: "experiments/exp-01/gpt-5-5-pi-fabled/index.html",
                spec: "experiments/exp-01/gpt-5-5-pi-fabled/SPEC.md",
                journey: "experiments/exp-01/gpt-5-5-pi-fabled/JOURNEY.md",
                tokens: "~173,000 total (29,000 in · 10,000 out · 134,000 cache)",
                cost: "$0.516",
                time: "~3.6 min (216.149s)",
                prompts: 1,
                outcome:
                    "Delivered — HTTP-verified playable single-file Three.js build",
            },
            {
                role: "control",
                label: "GPT-5.5",
                model: "gpt-5.5",
                skill: "—",
                agent: "Codex",
                plugins: ["Browser"],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Codex",
                        url: "https://openai.com/codex",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-5-no-omo-codex/",
                result: "experiments/exp-01/gpt-5-5-no-omo-codex/index.html",
                spec: "experiments/exp-01/gpt-5-5-no-omo-codex/SPEC.md",
                journey: "experiments/exp-01/gpt-5-5-no-omo-codex/JOURNEY.md",
                tokens: "1,101,243 total (1,085,773 in · 15,470 out · 945,024 cache)",
                cost: "~$3.0",
                time: "7m 29s",
                prompts: 1,
                outcome:
                    "Delivered — 3D Skyline Flap static web game, Chrome-render verified",
            },
            {
                role: "challenger",
                label: "GPT-5.5",
                model: "gpt-5.5",
                skill: "fabled",
                agent: "Codex",
                plugins: ["Browser"],
                links: [
                    {
                        label: "Codex",
                        url: "https://openai.com/codex/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-5-no-omo-codex-fabled/",
                result: "experiments/exp-01/gpt-5-5-no-omo-codex-fabled/index.html",
                spec: "experiments/exp-01/gpt-5-5-no-omo-codex-fabled/SPEC.md",
                journey: "experiments/exp-01/gpt-5-5-no-omo-codex-fabled/JOURNEY.md",
                tokens:
                    "2,758,095 total (2,732,909 in · 25,186 out · 2,557,824 cache · 3,599 reasoning)",
                cost: "~$4.82",
                time: "~17m 48s",
                prompts: 1,
                outcome:
                    "Delivered — browser-verified 3D Flappy Bird with logic tests and desktop/mobile screenshots",
            },
            {
                role: "control",
                label: "GPT-5.5",
                model: "gpt-5.5",
                skill: "—",
                agent: "Codex",
                plugins: ["OMO"],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Codex",
                        url: "https://openai.com/codex",
                    },
                    {
                        label: "LazyCodex",
                        url: "https://lazycodex.ai/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-5-codex/",
                result: "experiments/exp-01/gpt-5-5-codex/index.html",
                spec: "experiments/exp-01/gpt-5-5-codex/SPEC.md",
                journey: "experiments/exp-01/gpt-5-5-codex/JOURNEY.md",
                tokens:
                    "3,019,341 total (2,991,588 in · 27,753 out · 2,803,584 cache · 4,048 reasoning)",
                cost: "$5.28",
                time: "~20.7 min (1,243.1s)",
                prompts: 1,
                outcome:
                    "Delivered — browser-verified 3D Three.js game, score reached 3, 0 final browser errors",
            },
            {
                role: "challenger",
                label: "GPT-5.5",
                model: "gpt-5.5",
                skill: "fabled",
                agent: "Codex",
                plugins: ["OMO"],
                links: [
                    {
                        label: "Benchmarks",
                        url: "https://openrouter.ai/openai/gpt-5.5#benchmarks",
                    },
                    {
                        label: "Codex",
                        url: "https://openai.com/codex",
                    },
                    {
                        label: "LazyCodex",
                        url: "https://lazycodex.ai/",
                    },
                ],
                dir: "experiments/exp-01/gpt-5-5-codex-fabled/",
                result: "experiments/exp-01/gpt-5-5-codex-fabled/index.html",
                spec: "experiments/exp-01/gpt-5-5-codex-fabled/SPEC.md",
                journey: "experiments/exp-01/gpt-5-5-codex-fabled/JOURNEY.md",
                tokens:
                    "196,410 total (178,037 in · 18,373 out · 1,146,624 cache · 2,625 reasoning)",
                cost: "$2.87",
                time: "~34 min (>=1,980s)",
                prompts: 1,
                outcome:
                    "Delivered — browser-verified 3D Flappy Bird, no page or console errors",
            }
        ],
        winner: "tbd",
        notes:
            "<p>Rated as a Four Quadrants comparison across all contenders:</p>" +
            "<ol>" +
            "<li>Cost</li>" +
            "<li>Running time</li>" +
            "<li>Whether the result matches expectation (browser-verified playable build vs. failed/incomplete)</li>" +
            "<li>Total tokens used (a proxy for how 'single-prompt clean' the run was — high token counts often reflect cache reuse from steering turns or error recovery, not just raw build size)</li>" +
            "</ol>" +
            "<p>See each contender's tokens/cost/time/outcome fields and <code>SPEC.md</code> for the underlying numbers.</p>",
    },
];
