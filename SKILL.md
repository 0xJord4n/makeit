---
name: makeit
description: Use when starting a new project from scratch and the user wants it taken from raw vision to a finished, polished product — or when resuming a project that was started with makeit (a docs/makeit/ directory exists). Triggers include "bootstrap this project", "build my idea", "start a new project A to Z", "/makeit".
---

# makeit — Vision to Finished Product

## Overview

makeit turns a raw product vision into a finished, polished project through a gated, massively parallel pipeline. It acts as an uncompromising product manager first (it extracts substance from the user — it never invents it), then orchestrates parallel agents for decomposition, spec writing, implementation, de-slopping, and UX polish.

**Core principle: what is not specified does not exist.** Every mechanism in this skill exists to make information explicit before it is needed — non-goals kill generic specs upstream; the 5 UX states and the Definition of Done kill "compiles, ship it" downstream.

Read `DESIGN.md` for the full rationale. This file is a router: detect state, dispatch to the right phase file, load nothing else.

## State Detection

On invocation, check for `docs/makeit/` in the current project:

| State | Action |
|---|---|
| No `docs/makeit/` | New run → start Phase 1 (`phases/01-interview.md`) |
| `interview.md` exists, no `VISION.md` | Resume Phase 1 |
| `VISION.md` exists, no `features/` | Resume Phase 2 (`phases/02-foundations.md`) |
| `features/` exists, Gate 1 not approved | Resume Phase 2.5 / Gate 1 (`phases/03-decomposition.md`, `phases/04-gates.md`) |
| Gate 1 approved, specs incomplete | Resume Phase 3 (`phases/05-specs.md`) |
| Gate 2 approved, slices not all `integrated` | Resume Phase 4 (`phases/06-implementation.md`) |
| All integrated, deslopify not done | Resume Phase 4.5 (`phases/07-deslopify.md`) |
| Deslopify done, polish loop open | Resume Phase 5/6 (`phases/08-polish.md`) |

Gate approvals and per-feature statuses live in feature frontmatter and `docs/makeit/FEATURES.md` (generated — never hand-edit it; run `scripts/gen-index.ts`). State lives 100% in files: any session can resume by reading the index.

## Pipeline

```
P1 Interview → P2 Foundations → P2.5 Decomposition → 🚪GATE 1
→ P3 Specs (parallel + adversarial verify) → 🚪GATE 2
→ P4 Implementation (waves, worktrees) → P4i Integration (sequential)
→ P4.5 Deslopify → P5 UX Polish (loop) → P6 Final E2E
```

Phases 2.5, 3, 4, 4.5, and 5 fan out via the `Workflow` tool. The two gates are the only human checkpoints after the interview; everything else runs autonomously.

## Hard Rules

1. **Never fill a gap the user left open.** Vague answer → rephrase with concrete options. No exceptions, including under time pressure.
2. **Reference, never paraphrase.** Downstream artifacts point to upstream paths. Copying content forward is how loss happens.
3. **Discovery expands, gates contract.** Agents may propose features; only the human cuts scope, at the gates.
4. **Contracts are read-only during implementation.** An agent that believes a contract is wrong stops and reports. Silent contract edits in a worktree are forbidden.
5. **The index is generated.** Never hand-edit `FEATURES.md` or `features-index.json`; edit feature frontmatter, then regenerate.
6. **Display cost estimates at every gate** before the user approves the next fan-out.

## Phase Files

| Phase | File | Loads when |
|---|---|---|
| P1 Interview | `phases/01-interview.md` | New run or interview incomplete |
| P2 Foundations | `phases/02-foundations.md` | Interview done |
| P2.5 Decomposition | `phases/03-decomposition.md` | Foundations committed |
| Gates 1 & 2 | `phases/04-gates.md` | Before each gate |
| P3 Specs | `phases/05-specs.md` | Gate 1 approved |
| P4 + Integration | `phases/06-implementation.md` | Gate 2 approved |
| P4.5 Deslopify | `phases/07-deslopify.md` | Integration green |
| P5/P6 Polish + E2E | `phases/08-polish.md` | Deslopify done |

Templates for every artifact are in `templates/`. The index generator is `scripts/gen-index.ts` (run with `bun`).

## Common Mistakes

| Mistake | Correction |
|---|---|
| Writing specs before Gate 1 approval | Gate 1 exists to cut scope before spec tokens are spent |
| One giant FEATURES.md with full detail | Detail lives in `features/F-xxx-*.md`; the index stays scannable |
| Spec describes only the happy path | Adversarial verify rejects it — 5 UX states are mandatory |
| Agent "fixes" a contract in its worktree | Stop-and-report protocol; orchestrator owns contracts |
| Declaring done when tests pass | DoD includes the 5 UX states on screen + polish loop completion |
