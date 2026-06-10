---
name: makeit
description: Use when starting a new software project of any kind (web, mobile, CLI, API, library, background service) and the user wants it taken from raw vision to a finished, polished product — when adopting an existing codebase into a structured delivery pipeline — or when resuming a project that was started with makeit (a docs/makeit/ directory exists). Triggers include "bootstrap this project", "build my idea", "start a new project A to Z", "adopt this codebase", "/makeit".
---

# makeit — Vision to Finished Product

## Overview

makeit turns a raw product vision into a finished, polished project through a gated, massively parallel pipeline. It acts as an uncompromising product manager first (it extracts substance from the user — it never invents it), then orchestrates parallel agents for decomposition, spec writing, implementation, de-slopping, and polish.

**Core principle: what is not specified does not exist.** Every mechanism in this skill exists to make information explicit before it is needed — non-goals kill generic specs upstream; complete-state tables and the Definition of Done kill "compiles, ship it" downstream.

It is surface-agnostic: `surfaces.md` defines profiles (web-ui, mobile, cli, api, library, service) that parameterize specs and the polish loop. It handles greenfield (full pipeline) and brownfield (adopt mode, `phases/09-adopt.md`).

Read `DESIGN.md` for the full rationale. This file is a router: triage, detect state, dispatch to the right phase file, load nothing else.

## Entry Triage — first, honestly

Before anything, assess whether makeit is the right tool:

| Situation | Action |
|---|---|
| Project fits in one session (single page/script/component, one job, no persistent data) | **Decline and redirect**: "makeit is oversized for this — use /spec or build it directly." A pipeline with 2 gates and dozens of agents on a landing page wastes the user's money. |
| ML/data-science training pipelines, hardware/embedded | Decline — out of scope, say so plainly |
| Existing codebase, no `docs/makeit/` | Offer **adopt mode** → `phases/09-adopt.md` |
| Empty/new project, real product scope | Full pipeline → Phase 1 |
| `docs/makeit/` exists | Resume → state detection below |

When in doubt between "too small" and "real scope", ask one question: "Roughly how many distinct things must a user be able to do? (1-2 → /spec is faster; 3+ → makeit)".

## State Detection

On invocation with an existing `docs/makeit/`:

| State | Action |
|---|---|
| `interview.md` exists, no `VISION.md` | Resume Phase 1 (`phases/01-interview.md`) |
| `VISION.md` exists, no `features/` | Resume Phase 2 (`phases/02-foundations.md`) |
| `features/` exists, Gate 1 not approved | Resume Phase 2.5 / Gate 1 (`phases/03-decomposition.md`, `phases/04-gates.md`) |
| Gate 1 approved, specs incomplete | Resume Phase 3 (`phases/05-specs.md`) |
| Gate 2 approved, slices not all `integrated` | Resume Phase 4 (`phases/06-implementation.md`) |
| All integrated, deslopify not done | Resume Phase 4.5 (`phases/07-deslopify.md`) |
| Deslopify done, polish loop open | Resume Phase 5/6 (`phases/08-polish.md`) |

Gate approvals live as ADR entries in VISION.md; per-feature statuses live in feature frontmatter and the generated `FEATURES.md` (never hand-edit it; run `scripts/gen-index.ts`). State lives 100% in files: any session can resume by reading the index.

Feature statuses: `inventoried → spec-ready → implementing → integrated → polished`, plus `failed`, `blocked-on-human` (waiting on a human setup task), and `already-built` (adopt mode).

## Pipeline

```
P0 Triage → [P-adopt if brownfield] → P1 Interview → P2 Foundations
→ P2.5 Decomposition → 🚪GATE 1 [+ optional prototype checkpoint]
→ P3 Specs (parallel + adversarial verify) → 🚪GATE 2
→ P4 Implementation (waves, worktrees) → P4i Integration (sequential)
→ P4.5 Deslopify → P5 Polish (profile-driven loop) → P6 Final verification
```

Phases 2.5, 3, 4, 4.5, and 5 fan out via the `Workflow` tool. The two gates are the only planned human checkpoints after the interview; `blocked-on-human` tasks and change control (below) are the unplanned ones.

## Hard Rules

1. **Never fill a gap the user left open.** Vague answer → rephrase with concrete options. No exceptions, including under time pressure.
2. **Reference, never paraphrase.** Downstream artifacts point to upstream paths. Copying content forward is how loss happens.
3. **Discovery expands, gates contract.** Agents may propose features; only the human cuts scope, at the gates.
4. **Contracts are read-only during implementation.** An agent that believes a contract is wrong stops and reports. Silent contract edits in a worktree are forbidden.
5. **The index is generated.** Never hand-edit `FEATURES.md` or `features-index.json`; edit feature frontmatter, then regenerate.
6. **Display cost estimates at every gate** before the user approves the next fan-out.
7. **Complete states are profile-defined.** Every spec and every DoD uses the slice's surface profile from `surfaces.md` — never assume web.

## Change Control — vision changes mid-run

If the user changes scope/vision after a gate: **pause the running phase** → impact analysis from the index (which features, specs, slices are invalidated) → present a digest (affected items + re-work cost) → user approves → ADR entry + artifacts updated + index regenerated → resume. Never absorb a vision change silently into a running wave.

## Phase Files

| Phase | File | Loads when |
|---|---|---|
| Adopt (brownfield) | `phases/09-adopt.md` | Existing codebase, no docs/makeit/ |
| P1 Interview | `phases/01-interview.md` | New run or interview incomplete |
| P2 Foundations | `phases/02-foundations.md` | Interview done |
| P2.5 Decomposition | `phases/03-decomposition.md` | Foundations committed |
| Gates 1 & 2 | `phases/04-gates.md` | Before each gate |
| P3 Specs | `phases/05-specs.md` | Gate 1 approved |
| P4 + Integration | `phases/06-implementation.md` | Gate 2 approved |
| P4.5 Deslopify | `phases/07-deslopify.md` | Integration green |
| P5/P6 Polish + verification | `phases/08-polish.md` | Deslopify done |

Surface profiles: `surfaces.md`. Templates: `templates/`. Index generator: `scripts/gen-index.ts` (bun).

## Common Mistakes

| Mistake | Correction |
|---|---|
| Running the full pipeline on a one-session project | Entry triage exists to say "use /spec" — saying no is part of the job |
| Assuming web: "5 UX states per screen" on a CLI | The profile's state table applies — per command/endpoint/symbol/job |
| Writing specs before Gate 1 approval | Gate 1 exists to cut scope before spec tokens are spent |
| One giant FEATURES.md with full detail | Detail lives in `features/F-xxx-*.md`; the index stays scannable |
| Spec describes only the happy path | Adversarial verify rejects it — the profile's complete states are mandatory |
| Agent "fixes" a contract in its worktree | Stop-and-report protocol; orchestrator owns contracts |
| Absorbing a mid-run vision change into the current wave | Change control: pause, impact analysis, ADR, then resume |
| Declaring done when tests pass | DoD includes the profile's complete states + polish loop completion |
