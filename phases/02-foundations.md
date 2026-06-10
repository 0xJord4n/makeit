# Phase 2 — Foundations

Sequential, autonomous. Everything here is derived from `docs/makeit/interview.md` — trace every choice back to an interview answer. This phase produces the stable ground that makes the parallel phases safe.

## 1. VISION.md

Write `docs/makeit/VISION.md` from the interview verbatim, using `templates/vision.md`:

- Problem, personas, jobs-to-be-done
- **Non-goals, prominently** — this section heads the file after the problem
- Hard constraints, success criteria, UX intent
- `## Decisions (ADR)` section, initially with the stack decision: "Chose X over Y because Z (interview §5)"

**Append-only forever.** Later phases add ADR entries; nothing is ever rewritten or summarized. Downstream artifacts reference this file by path — they never copy its content.

## 2. ARCHITECTURE.md

Write `docs/makeit/ARCHITECTURE.md`:

- Module map with explicit boundaries — for each module: what it does, its public interface, what it depends on
- Data flow between modules
- Stack with justifications traced to the interview

## 3. Contracts — code, not docs

This is the load-bearing step. Contracts are **compilable artifacts committed to the repo**, so that an inter-slice inconsistency in Phase 4 becomes a compile error instead of an integration bug:

| Contract | Form |
|---|---|
| Data model | Real schema file (Drizzle / Prisma / SQL migrations — per chosen stack) |
| API surface | Route definitions + request/response types (shared TS types, OpenAPI, or equivalent) |
| Module interfaces | Shared types package / exported interfaces |
| Design tokens | Colors, spacing, typography derived from UX intent (§8) — parallel slices produce consistent screens |

## 4. Scaffolding

Scaffold the repo skeleton with **official CLIs only** (never hand-write what a CLI generates). Run `--help` first; use `@latest`; prefer non-interactive flags. Commit the skeleton, then commit the contracts.

## Exit Criteria

VISION.md + ARCHITECTURE.md written; contracts compile (`typecheck` passes on the skeleton); everything committed. Then load `phases/03-decomposition.md`.
