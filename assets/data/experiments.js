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
 *     role      string   "baseline"   — pure Fable 5, no skill
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
window.EXPERIMENTS = [{
    id: "exp-01",
    title: "Experiment 01",
    date: "2026-06-13",
    status: "running",
    prompt: "Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.",
    folder: "experiments/exp-01/",
    doc: "experiments/exp-01/index.html",
    contenders: [{
        role: "baseline",
        label: "Fable 5",
        model: "claude-fable-5",
        skill: "—",
        agent: "Claude Chat (Web)",
        plugins: [],
        links: [{
            label: "Benchmarks",
            url: "https://openrouter.ai/anthropic/claude-fable-5#benchmarks"
        }, {
            label: "claude.ai",
            url: "https://claude.ai"
        }, ],
        dir: "experiments/exp-01/fable-5/",
        result: "experiments/exp-01/fable-5/index.html",
        spec: "experiments/exp-01/fable-5/SPEC.md",
        journey: "experiments/exp-01/fable-5/JOURNEY.md",
        tokens: "~90k (est.)",
        cost: "~$2.30 (est.)",
        time: "~4 min",
        prompts: 1,
        outcome: "Delivered — 36/36 logic assertions pass",
    }, {
        role: "challenger",
        label: "GLM 5.1 · OpenCode",
        model: "glm-5.1",
        skill: "fabled",
        agent: "OpenCode",
        plugins: [],
        links: [{
            label: "Benchmarks",
            url: "https://openrouter.ai/z-ai/glm-5.1#benchmarks"
        }, {
            label: "opencode.ai",
            url: "https://opencode.ai"
        }, ],
        dir: "experiments/exp-01/glm-5-1-fabled-oc/",
        result: "experiments/exp-01/glm-5-1-fabled-oc/index.html",
        spec: "experiments/exp-01/glm-5-1-fabled-oc/SPEC.md",
        journey: "experiments/exp-01/glm-5-1-fabled-oc/JOURNEY.md",
        report: "experiments/exp-01/glm-5-1-fabled-oc/result/REPORT.md",
        failed: true,
        tokens: "not logged (failed stream)",
        cost: "not calculated",
        time: "aborted — repeated ~60 s stream deaths",
        prompts: "1 prompt + repeated compact/continue recovery",
        outcome: "Failed — GLM-5.1 stream closed in a loop, no deliverable",
    }, {
        role: "control",
        label: "GLM 5.1 · Pi",
        model: "glm-5.1",
        skill: "—",
        agent: "Pi",
        plugins: [],
        links: [{
            label: "Benchmarks",
            url: "https://openrouter.ai/z-ai/glm-5.1#benchmarks",
        }, {
            label: "pi.dev",
            url: "https://pi.dev/",
        }, ],
        dir: "experiments/exp-01/glm-5-1-pi/",
        result: "experiments/exp-01/glm-5-1-pi/index.html",
        spec: "experiments/exp-01/glm-5-1-pi/SPEC.md",
        journey: "experiments/exp-01/glm-5-1-pi/JOURNEY.md",
        tokens: "~316k (31k in · 19k out · 267k cache)",
        cost: "~$0.50",
        time: "~7.6 min",
        prompts: 1,
        outcome: "Delivered — single-file 3D Flappy Bird, browser-verified end-to-end",
    }, {
        role: "challenger",
        label: "GLM 5.1 · Pi",
        model: "glm-5.1",
        skill: "fabled",
        agent: "Pi",
        plugins: [],
        links: [{
            label: "Benchmarks",
            url: "https://openrouter.ai/z-ai/glm-5.1#benchmarks"
        }, {
            label: "pi.dev",
            url: "https://pi.dev/",
        }, ],
        dir: "experiments/exp-01/glm-5-1-fabled/",
        result: "experiments/exp-01/glm-5-1-fabled/index.html",
        spec: "experiments/exp-01/glm-5-1-fabled/SPEC.md",
        journey: "experiments/exp-01/glm-5-1-fabled/JOURNEY.md",
        tokens: "~449k (40k in · 34k out · 374k cache)",
        cost: "~$0.73",
        time: "~8.3 min",
        prompts: 1,
        outcome: "Delivered — 72,086 logic assertions pass, Gate B clean",
    }, {
        role: "control",
        label: "GPT-5.5 · Codex",
        model: "gpt-5.5-codex",
        skill: "—",
        agent: "Codex",
        plugins: [],
        links: [{
            label: "Benchmarks",
            url: "https://openrouter.ai/openai/gpt-5.5#benchmarks"
        }, {
            label: "chatgpt.com",
            url: "https://chatgpt.com/codex/cloud"
        }],
        dir: "experiments/exp-01/gpt-5-5-codex/",
        result: "experiments/exp-01/gpt-5-5-codex/index.html",
        spec: "experiments/exp-01/gpt-5-5-codex/SPEC.md",
        journey: "experiments/exp-01/gpt-5-5-codex/JOURNEY.md",
        tokens: "3,019,341 (2,991,588 in · 27,753 out · 2,803,584 cache · 4,048 reasoning)",
        cost: "$5.27709",
        time: "1,243.055 s (~20.7 min)",
        prompts: 1,
        outcome: "Delivered — browser-verified 3D Three.js game, score reached 3, 0 final browser errors",
    }, {
        role: "challenger",
        label: "GPT-5.5 · Codex",
        model: "gpt-5.5-codex",
        skill: "fabled",
        agent: "Codex",
        plugins: ["OMO"],
        links: [{
            label: "Benchmarks",
            url: "https://openrouter.ai/openai/gpt-5.5#benchmarks"
        }, {
            label: "chatgpt.com",
            url: "https://chatgpt.com/codex/cloud"
        }],
        dir: "experiments/exp-01/gpt-5-5-codex-fabled/",
        result: "experiments/exp-01/gpt-5-5-codex-fabled/index.html",
        spec: "experiments/exp-01/gpt-5-5-codex-fabled/SPEC.md",
        journey: "experiments/exp-01/gpt-5-5-codex-fabled/JOURNEY.md",
        tokens: "196,410 (178,037 in · 18,373 out · 1,146,624 cache · 2,625 reasoning)",
        cost: "$2.87",
        time: ">=33m56s",
        prompts: 1,
        outcome: "Delivered — browser-verified 3D Flappy Bird, no page or console errors",
    },
    {
        role: "control",
        label: "GPT-5 Mini · Pi",
        model: "gpt-5-mini",
        skill: "—",
        agent: "Pi",
        plugins: [],
        links: [{
            label: "github.com/features/copilot",
            url: "https://github.com/features/copilot"
        }],
        dir: "experiments/exp-01/gpt-5-mini-gh-pi/",
        result: "experiments/exp-01/gpt-5-mini-gh-pi/index.html",
        spec: "experiments/exp-01/gpt-5-mini-gh-pi/SPEC.md",
        journey: "experiments/exp-01/gpt-5-mini-gh-pi/JOURNEY.md",
        report: "experiments/exp-01/gpt-5-mini-gh-pi/result/REPORT.md",
        failed: true,
        tokens: "2,073,066 (118,019 in · 42,087 out · 1,912,960 cache)",
        cost: "$0.1615",
        time: "~470 s active (~7.8 min, idle gaps excluded)",
        prompts: "8 (1 original prompt + 5 steering turns + 2 human-in-the-loop browser-error reports); gpt-5-mini accessed via GitHub Copilot",
        outcome: "Failed — developer aborted after unresolved browser errors",
    },
    ],
    winner: "tbd",
    notes: "Six single-prompt builds of the same game. Baseline is raw Fable 5; challengers include GLM-5.1 + Fabled on Pi, GLM-5.1 + Fabled on OpenCode, and gpt-5.5-codex + Fabled on Codex. OpenCode hit a fatal GLM-5.1 streaming loop (see its REPORT.md). Controls isolate the model bare vs. with the skill: GLM-5.1 on Pi (no Fabled) and gpt-5-mini on Pi (no Fabled, accessed via GitHub Copilot, failed). Codex Fabled used 196,410 total tokens plus 1,146,624 cached tokens for $2.874655 exact ($2.87 rounded); exact return time was not recorded, with a checked lower bound of 33m56s. The Codex no-skill control used 3,019,341 total tokens with 188,004 new input tokens, 2,803,584 cached input tokens, 27,753 output tokens, 1,243.055 s wall time, and $5.27709 calculated cost. The gpt-5-mini control (on Pi, model accessed via GitHub Copilot) used 2,073,066 total tokens (118,019 in · 42,087 out · 1,912,960 cache), $0.1615, ~470 s active wall-clock (idle gaps while testing in browser excluded; ~29.3 min calendar), 8 human turns (1 original prompt + 5 steering + 2 human-in-the-loop error reports), and failed verification.",
}, ];
