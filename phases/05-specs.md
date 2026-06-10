# Phase 3 — Parallel Specs + Adversarial Verification

Workflow fan-out: one writer agent per slice, then adversarial cross-verification per spec. Specs are written against frozen contracts — that is what makes parallel writing safe.

## Spec Writer Agents (parallel, one per slice)

Prompt skeleton:
> Write the spec for slice "<slice>" at `docs/makeit/specs/<slice>.md` using `templates/spec.md`. Ground every statement in: VISION.md (path), the contracts (paths), and the feature files you implement — reference them as F-xxx + path, NEVER copy their content. Cover each feature's screens with the 5 UX states. Use the design tokens. If something is ambiguous in a feature file, write an OPEN-POINT marker — do not resolve it yourself.

A spec must contain (enforced by the template):

- Covered features: ids + paths
- Per screen: the **5 UX states** — ideal, empty (first use!), loading, error, partial/degraded
- Responsive behavior + accessibility notes
- Contract usage: which entities, which endpoints (by name — they exist already)
- Test plan: unit/integration/E2E intent per behavior
- Definition of Done: green tests + typecheck + lint + the 5 states on screen + self-check against this spec
- `OPEN-POINT:` markers for anything genuinely ambiguous

## Adversarial Verification (parallel, per spec, distinct lenses)

Each spec is attacked by independent agents, one per lens — diversity catches what redundancy cannot:

| Lens | Rejects when |
|---|---|
| Contract compliance | The spec invents an endpoint/field, or misuses an existing one |
| Hidden coupling | The spec silently depends on another slice's internals (must use contracts only) |
| Happy-path-only | Any screen missing one of the 5 UX states — **automatic rejection** |
| Ambiguity | A requirement readable two ways without an OPEN-POINT marker |

Verdicts: pass / reject with the exact sentence at fault. Rejected specs go back to their writer with the findings; verify again. Two rejection rounds on the same spec → escalate to Gate 2 as an open point rather than looping forever.

## Exit Criteria

Every spec passed all lenses or has explicit OPEN-POINTs; feature statuses flipped to `spec-ready`; index regenerated. Then load `phases/04-gates.md` for Gate 2.
