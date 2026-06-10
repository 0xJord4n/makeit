# makeit

[![skills.sh](https://skills.sh/b/0xJord4n/makeit)](https://skills.sh/0xJord4n/makeit)
[![CI](https://github.com/0xJord4n/makeit/actions/workflows/ci.yml/badge.svg)](https://github.com/0xJord4n/makeit/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/0xJord4n/makeit)](https://github.com/0xJord4n/makeit/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**From raw vision to a finished, polished product — through a gated, massively parallel agent pipeline.**

You give the vision. makeit interviews you like an uncompromising product manager, decomposes the product exhaustively, writes adversarially-verified specs in parallel, implements slices in parallel git worktrees, de-slops the assembled codebase, and loops on polish until nothing is left to fix. You approve twice; everything else is autonomous.

Works for **any kind of software** — web, mobile, CLI, API, library, background service — and for **existing codebases** (adopt mode). Small one-session projects get a lite lane instead of the full machinery.

## Quickstart (30 seconds)

```bash
npx skills add 0xJord4n/makeit
```

Then, in an empty project directory:

```
/makeit "a tool for freelance designers to collect client feedback in one place"
```

Answer the interview honestly — especially the non-goals. The quality of everything downstream is decided there.

<details>
<summary>Other install methods</summary>

```bash
# Try without installing
npx skills use 0xJord4n/makeit | claude

# Target specific agents
npx skills add 0xJord4n/makeit -a claude-code -g

# Manual (Claude Code)
git clone https://github.com/0xJord4n/makeit.git
ln -s "$(pwd)/makeit" ~/.claude/skills/makeit
```

Requires an agent with multi-agent orchestration (Claude Code's `Workflow` tool) for the parallel phases, and [bun](https://bun.sh) for the helper scripts. Optional companion skills, used automatically when installed: `design-review`, `ux-audit`, `responsiveness-check`, `onboarding-ux`, `finding-duplicate-functions`, plus your stack's best-practices skills.

</details>

## Why This Exists

Agent-built projects fail in four repeatable ways. Every mechanism in makeit targets one of them.

### #1 — The specs are generic

A one-shot PRD fills the gaps with plausible boilerplate, because nobody extracted what only YOU know. Test: if the PRD could describe any product in the category, it's filler.

**The fix:** a mandatory [PM interview](./phases/01-interview.md) — one question at a time, multiple choice, and a hard rule: *the skill never fills a gap you left open*. Non-goals (minimum 3) are required before anything proceeds; they are what make a spec yours instead of anyone's.

### #2 — Information degrades at every step

Idea → PRD → spec → tasks → code: every transformation is lossy compression. Documents generated from other documents paraphrase and drift.

**The fix:** a single source of truth ([VISION.md](./templates/vision.md), append-only with ADR-style decisions), artifacts that **reference upstream paths instead of paraphrasing content**, and [contracts that are compilable code](./phases/02-foundations.md) — an inter-slice inconsistency becomes a compile error, not an integration surprise.

### #3 — It's never actually finished

Agents stop at "compiles" because the spec never named polish — and what is not specified does not exist. No empty states, no loaders, no error screens, no UX sense.

**The fix:** [surface profiles](./surfaces.md) define the **complete states** every unit must implement (per screen for web, per command for CLI — including exit codes and Ctrl-C, per endpoint for APIs…). A happy-path-only spec is automatically rejected at verification, and the [polish loop](./phases/08-polish.md) only stops after **two consecutive audit passes with zero must-fix findings**.

### #4 — Parallel agents create their own slop

N agents in isolated worktrees each reinvent the same `formatDate()`, the same fetch hook, the same button with six boolean props. Nobody saw it because nobody had the whole codebase in view.

**The fix:** a dedicated [deslopify phase](./phases/07-deslopify.md) that runs the moment the codebase is assembled — semantic duplicate hunting, stack best practices, simplification — with the full test suite as the harness.

## The Pipeline

```
/makeit "your vision"               (or: adopt an existing codebase)

P0  Triage                one-session scope → lite mode; brownfield → adopt
P1  PM Interview          8 sections, ~10-20 min, one question at a time
P2  Foundations           VISION.md + architecture + compilable contracts + seed data
P2.5 Decomposition        parallel fan-out + completeness critic + human-task detection
🚪 GATE 1                 you approve scope (vision, contracts, inventory, human tasks)
P3  Specs                 parallel writers + adversarial cross-verification
🚪 GATE 2                 you resolve open points, approve
P4  Implementation        dependency waves, one agent per slice, isolated worktrees
P4i Integration           sequential merges, full suite between each
P4.5 Deslopify            semantic duplicates, stack best practices, simplify
P5  Polish                profile-driven audit/fix loop until 2 clean passes
P6  Final verification    full journeys per surface + final report
```

Two human checkpoints. Everything else runs autonomously, with cost estimates before each fan-out. Mid-run vision changes go through [change control](./phases/04-gates.md) — pause, impact analysis, ADR, resume — never absorbed silently.

## Three Modes

| Mode | When | What you get |
|---|---|---|
| **Lite** | One-session scope (single page/script/tool, 1-2 jobs, no persistent data) | Mini-interview in one round, direct build, parallel check fan-out, one clean re-check — the quality DNA without the ceremony |
| **Full** | Real product scope (3+ jobs) | The whole pipeline above |
| **Adopt** | Existing codebase | Contracts extracted from real code, inventory with `already-built` status, and a coherence-audit guardrail: major incoherences → stop and offer stabilize / proceed-with-documented-risk / abort |

The triage routes between them honestly — including telling you when makeit is oversized for the job.

## Engineering Inside

- **The LLM decides, the code mutates.** Every structured artifact changes only through a validated script: run state via [`state.ts`](./scripts/state.ts), feature scaffolding via [`new-feature.ts`](./scripts/new-feature.ts), status flips via [`set-status.ts`](./scripts/set-status.ts), derived indexes via [`gen-index.ts`](./scripts/gen-index.ts) — which validates the dependency graph (enums, dangling deps, **cycles**) and refuses to index a broken one. A typo can't corrupt a run.
- **Deterministic orchestration.** Every fan-out phase ships a [canned Workflow script](./workflows/) — invoked with `scriptPath` + args, never re-authored from prose. Control flow is code; only the work inside each agent is LLM.
- **Resume for free.** All state lives in files (`state.json` + feature frontmatter). Session crashed or compacted? Re-invoke `/makeit` — it reads the state and resumes exactly where it was.
- **Model routing with consent.** Fan-out agents run on Sonnet, mechanical sweeps on Haiku, high-leverage phases on your session model — upgradable to Opus/Fable only through a one-time consent question. No silent upgrades, ever.
- **Pressure-tested rules.** Every hard rule is locked by a [regression suite of pressure scenarios](./tests/pressure-scenarios.md) (9/9): agents under stacked temptation — "skip the interview, I'm in a hurry", "just edit the contract, nobody will notice", "this deserves a stronger model" — hold the line.

## Repository Layout

```
SKILL.md          entry point: triage + state detection + phase dispatch
DESIGN.md         full design rationale and decisions
surfaces.md       surface profiles: complete-state tables + polish audits per medium
LESSONS.md        skill-level learnings upstreamed from real runs
phases/           one guide per pipeline phase, incl. lite + adopt modes
workflows/        canned Workflow scripts for every fan-out phase
templates/        feature, spec, and vision artifact templates
scripts/          structured-mutation CLIs + index generator + validators (tested)
tests/            pressure-scenario regression suite for the skill itself
```

## License

[MIT](LICENSE)
