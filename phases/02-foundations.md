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
| Design tokens (UI surfaces) | Colors, spacing, typography derived from UX intent (§8) — or extracted from the user's existing brand/design system if one was named. Parallel slices produce consistent screens |

**Untyped stacks**: if the language is not statically typed by default, "contract violation = compile error" must be restored by other means — configure the strict type checker at scaffolding time (pyright strict / mypy --strict / `tsconfig` strict for JS migration) or, where that is impossible, generate executable contract tests next to each contract. Foundations exit criteria adapt accordingly: contracts verified by typecheck OR by the contract test suite.

**Monorepo (multi-surface products)**: scaffold the monorepo (e.g. turborepo) with contracts in a shared package imported by every surface. Slices are namespaced per surface (`web/auth`, `api/auth`); the dependency graph spans packages.

## 4. Scaffolding

Scaffold the repo skeleton with **official CLIs only** (never hand-write what a CLI generates). Run `--help` first; use `@latest`; prefer non-interactive flags. Commit the skeleton, then commit the contracts.

## 5. Test Accounts & Seed Data

If the product has auth or persistent data, foundations must produce:

- A **seed script** (idempotent) creating realistic demo data
- **Test accounts** (per role if roles exist) with documented credentials in `docs/makeit/test-accounts.md` (gitignored if the repo is public)

Without these, the Phase 5 polish loop audits an empty app behind a login wall — which audits nothing. The seed script is also each implementation agent's local fixture.

## Exit Criteria

VISION.md + ARCHITECTURE.md written; contracts verified (typecheck passes, or contract test suite green on untyped stacks); seed + test accounts in place when applicable; everything committed. Then load `phases/03-decomposition.md`.
