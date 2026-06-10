# makeit

[![CI](https://github.com/0xJord4n/makeit/actions/workflows/ci.yml/badge.svg)](https://github.com/0xJord4n/makeit/actions/workflows/ci.yml)

**A Claude Code skill that takes a project from raw vision to a finished, polished product — through a gated, massively parallel agent pipeline.**

You give the vision. It interviews you like an uncompromising product manager, decomposes the product exhaustively, writes verified specs in parallel, implements slices in parallel git worktrees, de-slops the assembled codebase, and loops on polish until nothing is left to fix. You approve twice; everything else is autonomous.

Works for **any kind of software** — web apps, mobile, CLIs, APIs, libraries, background services — via surface profiles (`surfaces.md`), and for **existing codebases** via adopt mode. Small one-session projects get **lite mode**: mini-interview, direct build, parallel check fan-out — the quality DNA without the ceremony.

## Why

Agent-built projects fail in three repeatable ways:

| Failure | Cause | makeit's answer |
|---|---|---|
| **Generic specs** | One-shot PRDs fill gaps with plausible boilerplate | Mandatory PM interview — the skill never invents what you didn't say; non-goals are required |
| **Progressive loss** | Every doc generated from another doc is lossy compression | Single source of truth, append-only, referenced by path — never paraphrased |
| **Never finished** | Specs never name polish, so agents stop at "compiles" | Profile-defined complete states per unit (screen, command, endpoint, export, job), enforced DoD, and a polish loop that only stops after 2 clean passes |

Plus the slop unique to parallel agents (N worktrees reinventing the same helper) — handled by a dedicated deslopify phase that runs the moment the codebase is assembled.

## Pipeline

```
/makeit "your vision in a few sentences"     (or: adopt an existing codebase)

P0  Triage                one-session scope → lite mode; brownfield → adopt; else full pipeline
[P-adopt]                 brownfield only: abbreviated interview, contracts extracted
                          from code, coherence audit with a stop-or-stabilize guardrail
P1  PM Interview          8 sections, ~10-20 min, one question at a time
P2  Foundations           VISION.md + architecture + compilable contracts + seed data
P2.5 Decomposition        parallel fan-out + completeness critic + human-task detection
🚪 GATE 1                 you approve scope (vision, contracts, inventory, human tasks)
                          [+ optional prototype checkpoint for design-first products]
P3  Specs                 parallel writers + adversarial cross-verification
🚪 GATE 2                 you resolve open points, approve
P4  Implementation        dependency waves, one agent per slice, isolated worktrees
P4i Integration           sequential merges, full suite between each
P4.5 Deslopify            semantic duplicates, stack best practices, simplify
P5  Polish                profile-driven loop (UX audits for UI, DX audits for
                          CLI/API/library, ops audits for services) — until 2 clean passes
P6  Final verification    full journeys per surface + final report
```

Two human checkpoints. Everything else runs autonomously, with cost estimates shown before each fan-out. Mid-run vision changes go through change control (pause → impact analysis → ADR → resume), never absorbed silently.

**Model routing**: fan-out agents (decomposition, specs, implementation, audits) run on Sonnet; mechanical sweeps drop to Haiku; high-leverage phases (interview, foundations, gates) stay on your session model — upgradable to Opus/Fable only through a one-time consent question at run start. No silent upgrades, ever.

## Key mechanics

- **Contracts are code.** DB schema, API types, shared interfaces, and design tokens are committed and compilable before any spec is written. Inter-slice inconsistency becomes a compile error, not an integration surprise.
- **Index + detail files.** Every feature is a file with YAML frontmatter; `FEATURES.md` and `features-index.json` are *generated* from them. One source of truth, zero write conflicts between parallel agents, zero drift.
- **Resume for free.** All state lives in files. Session crashed or compacted? Re-invoke `/makeit` — it reads the index and resumes at the right phase.
- **Failure protocol.** A failing slice never blocks its wave; one retry with context, then human escalation. An agent that believes a contract is wrong must stop and report — silent contract edits are forbidden.

## Install

```bash
git clone https://github.com/0xJord4n/makeit.git
ln -s "$(pwd)/makeit" ~/.claude/skills/makeit
```

Requires [Claude Code](https://claude.com/claude-code) with the `Workflow` tool available (multi-agent orchestration). Optional but recommended companion skills, used automatically when installed: `design-review`, `ux-audit`, `responsiveness-check`, `onboarding-ux`, `finding-duplicate-functions`, plus your stack's best-practices skills.

## Use

In any empty or freshly created project directory:

```
/makeit "a tool for freelance designers to collect client feedback in one place"
```

Answer the interview honestly — especially the non-goals. The quality of everything downstream is decided there.

## Repository layout

```
SKILL.md          entry point: triage + state detection (state.json) + phase dispatch
DESIGN.md         full design rationale and decisions
surfaces.md       surface profiles: complete-state tables + polish audits per medium
LESSONS.md        skill-level learnings upstreamed from real runs
phases/           one guide per pipeline phase, incl. lite + adopt modes
workflows/        canned Workflow scripts for every fan-out phase (deterministic
                  orchestration — invoked via scriptPath + args, never re-authored)
templates/        feature, spec, and vision artifact templates
scripts/          structured-mutation CLIs ("the LLM decides, the code mutates"):
                  state.ts (run state), new-feature.ts (scaffolding), set-status.ts
                  (status flips), gen-index.ts (derived indexes + graph validation),
                  check-workflows.ts (workflow-script validator) - all tested
tests/            pressure-scenario regression suite for the skill itself
```

## License

[MIT](LICENSE)
