# Phase 2.5 — Exhaustive Decomposition

Parallel fan-out via the `Workflow` tool. Goal: an inventory so complete that nothing is discovered mid-implementation. The features everyone misses are never the main jobs — they are the implicit ones (forgot-password, delete-my-account, the confirmation email, the settings page). The cross-cutting agents exist for exactly those.

## Fan-Out Structure

**Per-job agents** (parallel) — one agent per job-to-be-done from the interview:
> Read VISION.md, ARCHITECTURE.md, and the contracts. For the job "<job>", enumerate every sub-feature, screen, flow, and edge case required to deliver it. For each item, write a feature file using `templates/feature.md` into `docs/makeit/features/` with a unique F-xxx id (your assigned range: F-<n>00–F-<n>99). Do not arbitrate scope — tag with your best guess (must/should/won't) and note the rationale.

**Cross-cutting agents** (parallel with the above) — one agent per sweep angle, each scans the WHOLE product through one lens:

| Agent | Lens |
|---|---|
| auth & permissions | signup, login, forgot-password, sessions, roles, invitations |
| data lifecycle | full CRUD per entity, soft/hard delete, export, import, retention |
| notifications | emails (transactional!), in-app, digests, preferences |
| settings & admin | profile, billing-readiness, workspace settings, admin views |
| failure modes | error screens/outputs, offline, degraded states, rate limits, validation |
| onboarding & first use | first-run experience, empty states, sample data, guidance (UI) / quickstart, install path (cli, library) |
| security & compliance | *enrolled when `compliance: true` in VISION.md* — authz matrix, audit trail, data retention/deletion duties, secrets handling, regulated-flow requirements |

Lenses adapt to the surface profiles in VISION.md (a `cli` product's "onboarding" is its install + first-command experience, not a tour). Each agent writes feature files in its own id range — no shared-file writes, no conflicts.

**Human setup task detection**: every agent flags items that an agent CANNOT do — external accounts (Stripe, OAuth apps, app-store listings), domain/DNS, API keys, paid plan activations. These go to `docs/makeit/HUMAN-TASKS.md` as a checklist (task, why, blocking which features), NOT into the feature inventory. Gate 1 presents this list; the user can complete tasks anytime before the slices that need them.

**Completeness critic** (loop) — after each round:
> Compare the inventory index against comparable products (name them from interview §8 references). What is missing — a feature, a screen, an email, an admin view, a legal page? Return only NEW items.

Loop until **2 consecutive critic passes return nothing new**.

## Merge

1. Run `scripts/gen-index.ts` → regenerates `FEATURES.md` + `features-index.json` from frontmatter
2. Dedupe: semantically identical features → keep one, merge content, delete the other, regenerate
3. Apply the non-goals filter: anything colliding with a non-goal gets tagged `out-of-scope` with the non-goal cited — visible at Gate 1, not silently dropped

## Guardrail

**Discovery expands, gates contract.** Agents propose; only the human cuts — at Gate 1. Never delete a discovered feature yourself (except true duplicates); tag it.

## Exit Criteria

2 dry critic passes; index regenerated; every feature tagged. Then load `phases/04-gates.md` for Gate 1.
