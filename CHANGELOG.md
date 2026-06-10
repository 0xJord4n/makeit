# Changelog

All notable changes to makeit are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [1.0.0] - 2026-06-11

First public release. Full pipeline, three modes, surface-agnostic, pressure-tested (9/9).

### Pipeline

- PM interview (8 sections, mandatory non-goals, no-invention hard rule)
- Foundations: append-only VISION.md with ADR log, compilable contracts (schema, API types, design tokens), seed data + test accounts
- Exhaustive decomposition: per-job + cross-cutting agent fan-out, completeness critic loop, human-setup-task detection
- Two human gates with structured digests, cost estimates, and milestone splitting for large inventories
- Parallel spec writing with adversarial cross-verification (contract, coupling, happy-path, ambiguity, security lenses)
- Waved implementation in isolated git worktrees: retry-once, blocked-on-human stubbing, contract stop-and-report protocol, sequential integration with full suite between merges
- Deslopify phase: semantic duplicate hunting + stack best practices on the assembled tree
- Profile-driven polish loop (2 clean passes required) + final per-surface verification
- Optional prototype checkpoint for design-first products; change control for mid-run vision changes

### Modes

- **Full** - the pipeline above, for real product scope (3+ jobs)
- **Lite** - one-session projects: bundled mini-interview, direct build, parallel check fan-out
- **Adopt** - existing codebases: contracts extracted from code, coherence-audit guardrail (stabilize / documented-risk / abort)

### Surface profiles

web-ui, mobile, cli, api, library, service - each with its own complete-state table and polish audit set (`surfaces.md`)

### Engineering

- "The LLM decides, the code mutates": state.ts, new-feature.ts, set-status.ts, gen-index.ts (graph validation: enums, dangling deps, cycle detection)
- Canned Workflow scripts for every fan-out phase (deterministic orchestration via scriptPath + args)
- state.json as the authoritative, resumable run record
- Model routing: sonnet fan-outs, haiku sweeps, consent-gated opus/fable upgrades for foundations
- 21 unit tests, workflow-script validator, CI (test + typecheck + workflow check)
- Pressure-scenario regression suite: 9/9 (interview discipline, contract read-only, state dispatch, adversarial verify, lite-mode routing, adopt guardrail, cli profile, model-routing ceiling)

[1.0.0]: https://github.com/0xJord4n/makeit/releases/tag/v1.0.0
