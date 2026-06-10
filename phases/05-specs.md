# Phase 3 — Parallel Specs + Adversarial Verification

Workflow fan-out: one writer agent per slice, then adversarial cross-verification per spec. Specs are written against frozen contracts — that is what makes parallel writing safe.

## Spec Writer Agents (parallel, one per slice)

Prompt skeleton:
> Write the spec for slice "<slice>" (surface profile: <profile>) at `docs/makeit/specs/<slice>.md` using `templates/spec.md`. Ground every statement in: VISION.md (path), the contracts (paths), the profile's complete-state table in `surfaces.md`, and the feature files you implement — reference them as F-xxx + path, NEVER copy their content. Cover each unit (screen / command / endpoint / symbol group / job) with ALL states from the profile's table. Use the design tokens (UI surfaces). If something is ambiguous in a feature file, write an OPEN-POINT marker — do not resolve it yourself.

A spec must contain (enforced by the template):

- Covered features: ids + paths; the slice's **surface profile**
- Per unit: the profile's **complete-state table** from `surfaces.md` (for web-ui: ideal, empty, loading, error, partial; for cli: nominal, empty input, progress, errors+exit codes, interruption; etc.)
- Profile-specific cross-cutting notes (web-ui/mobile: responsive + accessibility; cli/library: help/docs surface; api: error-shape consistency; service: observability)
- Contract usage: which entities, which endpoints (by name — they exist already)
- Test plan: unit/integration/E2E intent per behavior
- Definition of Done: green tests + typecheck + lint + all profile states implemented and observable + self-check against this spec
- `OPEN-POINT:` markers for anything genuinely ambiguous

## Adversarial Verification (parallel, per spec, distinct lenses)

Each spec is attacked by independent agents, one per lens — diversity catches what redundancy cannot:

| Lens | Rejects when |
|---|---|
| Contract compliance | The spec invents an endpoint/field, or misuses an existing one |
| Hidden coupling | The spec silently depends on another slice's internals (must use contracts only) |
| Happy-path-only | Any unit (screen/command/endpoint/symbol group/job) missing a state from ITS profile's table in `surfaces.md` — **automatic rejection** |
| Ambiguity | A requirement readable two ways without an OPEN-POINT marker |
| Security (when `compliance: true`) | A regulated flow without authz check, audit trail, or data-handling statement |

Verdicts: pass / reject with the exact sentence at fault. Rejected specs go back to their writer with the findings; verify again. Two rejection rounds on the same spec → escalate to Gate 2 as an open point rather than looping forever.

## Exit Criteria

Every spec passed all lenses or has explicit OPEN-POINTs; feature statuses flipped to `spec-ready`; index regenerated. Then load `phases/04-gates.md` for Gate 2.
