# REPORT — Incident

## Executive Summary

This run was marked as failed after the developer was unable to get the delivered web build to run in the browser. Repeated console errors from CDN/example-module imports and intermittent 404/500 responses prevented reliable verification. After multiple remediation attempts the developer aborted the verification.

## What Was Being Run

- **Model**: gpt-5-mini
- **Skill**: —
- **Agent**: GitHub Copilot
- **Variant**: `gpt-5-mini-gh-pi`
- **Prompt**: Create a webbed Flappy Bird video game, but 3D and I want it to look pretty and playable.

## Evidence

- Browser console logs captured during local testing included:
  - "Failed to resolve module specifier 'three'" (bare specifier resolution issue)
  - CDN requests to skypack/unpkg returning 404 and 500 for example modules (EffectComposer, FilmPass, ShaderPass)
  - Mixed import-map and direct CDN attempts leading to race conditions and inconsistent module resolution.

## Performance Signals

- Session metrics (from pi session JSONL usage field, scoped first prompt → give-up):
  - Tokens in: 118,019
  - Tokens out: 42,087
  - Cache read tokens: 1,912,960
  - Total tokens: 2,073,066
  - Cost: $0.1615
  - Wall-clock: ~470 s (~7.8 min active; idle gaps while testing in browser excluded)
- On mid-range hardware the page frequently dropped frames when postprocessing passes were active.
- On mobile/low-end devices the game was effectively unplayable until heavy passes were disabled.

## Root-Cause Ranking

1. Environment-dependent module resolution (bare specifiers vs CDN ESM builds)
2. Reliance on third-party CDNs (skypack/unpkg) that sometimes redirect or 404 example modules
3. Postprocessing defaults that are too heavy for some targets and were not dynamically gated early enough

## Assessments

- The delivered code contained multiple reasonable fixes, but they were applied iteratively and left timing/compat issues in place.
- The run is valuable as a failure case showing real-world CDN and environment issues that can break otherwise correct builds.

## Known Public Issues

- Some CDNs occasionally return 500 on example module builds; using a single trusted ESM source or vendor-locking dependencies reduces this class of failure.

## Debug Progress

- Attempted remediation: added import-map, switched example imports between skypack/unpkg, inlined a small vignette shader to remove an import, introduced low-quality fallbacks for heavy postprocessing.
- Result: partial improvement but remaining runtime import/404/500 errors and inconsistent behavior across browsers.

## Recommended Mitigations

1. Vendor-lock Three and example modules (check them into the showcase assets or ship a bundled build) to remove CDN dependency.
2. Simplify postprocessing or gate heavy passes behind a performance probe at startup.
3. Add an in-page debug overlay with captured console output to aid reproducing failures on CI or other machines.

## Bottom Line

This run is recorded as a failed build for the showcase. It surfaces a real integration problem (module resolution and CDN reliability) that should be addressed before re-running verification and tagging the run as successful.
