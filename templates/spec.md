# Spec — <slice>

> Grounding: `docs/makeit/VISION.md`, contracts (list paths), feature files below.
> Reference upstream artifacts by path. Never paraphrase their content.

## Covered features

| Id | Title | Path |
|---|---|---|
| F-xxx | … | docs/makeit/features/F-xxx-….md |

## Screens

### <Screen name>

| State | Behavior |
|---|---|
| Ideal | … |
| Empty (first use) | … |
| Loading | … |
| Error | … |
| Partial / degraded | … |

Repeat the 5-state table for EVERY screen. A screen without all 5 states fails adversarial verification.

**Responsive**: behavior at mobile / tablet / desktop breakpoints.
**Accessibility**: keyboard path, focus management, labels.

## Contract usage

Which entities and endpoints this slice uses — **by name, they already exist**. A name not found in the contracts is a spec bug.

## Test plan

| Behavior | Level | Note |
|---|---|---|
| … | unit / integration / E2E | … |

## Definition of Done

- [ ] All tests in the plan green (TDD)
- [ ] Typecheck + lint clean
- [ ] The 5 UX states implemented on screen for every screen above
- [ ] Self-check against this spec, item by item

## Open points

`OPEN-POINT:` markers for anything genuinely ambiguous — resolved at Gate 2, never self-resolved.
