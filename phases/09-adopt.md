# Adopt Mode — Existing Codebase (Brownfield)

Brings an already-started project into the makeit pipeline. The greenfield pipeline relies on
clean foundations (contracts frozen before any code); an existing codebase has code that
respects no contract. Adopt mode reverse-engineers the artifacts from reality — then the
normal pipeline takes over for the delta.

**Honesty rule: adopt mode documents what IS, it does not silently fix what is broken.**

## 1. Abbreviated Interview

The product exists; the interview documents intent and direction (one question at a time,
same conduct rules as `phases/01-interview.md`):

1. What is this product, who uses it today? (persona)
2. What is the goal of this adoption — what should exist that doesn't? (the delta = the jobs-to-be-done)
3. **Non-goals — still mandatory, minimum 3** (for the delta)
4. Hard constraints + the two mandatory questions (i18n, compliance)
5. Surface profile(s) — observed from the code, confirmed with the user
6. Prioritization of the delta; success criteria; UX/DX intent (or "match the existing")

## 2. Extraction — artifacts from reality

Parallel fan-out (Workflow). **Model routing: extraction agents run on `sonnet`**; the
coherence audit (§3) and the user-facing decision stay on the session model:

| Agent | Produces |
|---|---|
| Architecture mapper | ARCHITECTURE.md from the actual module structure and data flow |
| Contract extractor | The contracts AS THEY ARE: real schema files declared as the data-model contract; actual route signatures as the API contract; existing shared types |
| Feature inventorier | One feature file per existing capability, `status: already-built`, grounded in the code (path references) |
| Test & tooling assessor | What test suite, typecheck, lint exist; their current pass state — verbatim, no sugarcoating |
| Convention extractor | Naming, patterns, design tokens (if UI) from the existing code — new slices must match, not fight, the codebase |

VISION.md is written from the interview + extraction, ADR section opens with "Adopted <date>:
contracts extracted from code, not designed".

## 3. Coherence Audit — the guardrail

Before anything proceeds, audit the extraction:

| Found | Severity |
|---|---|
| Two sources of truth for the same data (duplicated schema, parallel models) | Major |
| API surface contradicting the schema (fields that don't exist, dead routes) | Major |
| No test suite, or suite red | Major |
| Typecheck failing / no typecheck on an untyped stack | Major |
| Mixed conventions, dead code, drift | Minor (recorded, not blocking) |

**If ANY major incoherence is found: STOP. Present the findings and these options:**

1. **Stabilize first** (recommended) — a stabilization plan (fix the majors, get the suite
   green) runs as a mini Phase 4 wave BEFORE any new feature work. Honest cost estimate.
2. **Proceed with documented risk** — majors recorded as ADR entries + a `RISKS.md`; new
   slices must not touch the incoherent areas (enforced in spec verification).
3. **Abort adopt** — the user keeps using /spec for incremental work.

Never silently absorb a broken foundation — the pipeline's guarantees (contract = compile
error, integration always green) are void on majors, and pretending otherwise is lying.

## 4. Handoff to the Normal Pipeline

From here the standard pipeline runs **for the delta**: P2.5 decomposition (new features only;
cross-cutting agents check the existing app for gaps too — missing forgot-password is a
finding even if "already built" surrounds it) → Gate 1 (inventory shows `already-built`
alongside the delta) → P3 specs → Gate 2 → P4 waves → P4.5 → P5 → P6.

Two adopt-specific rules downstream:

- **Convention compliance**: implementation agents receive the convention extract — new code
  matches the existing style, not the agent's preferences.
- **`already-built` features are read-only context**: a delta slice that needs to MODIFY an
  existing feature declares it (`deps` on the F-xxx), which pulls that feature's code paths
  into its spec grounding.

## Exit Criteria

Interview + extraction + coherence audit done; user chose a path through the guardrail;
docs/makeit/ fully populated. Then load `phases/03-decomposition.md`.
