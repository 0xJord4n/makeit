# Spec — <slice>

> Surface profile: <web-ui | mobile | cli | api | library | service> (see `surfaces.md`)
> Grounding: `docs/makeit/VISION.md`, contracts (list paths), feature files below.
> Reference upstream artifacts by path. Never paraphrase their content.

## Covered features

| Id | Title | Path |
|---|---|---|
| F-xxx | … | docs/makeit/features/F-xxx-….md |

## Units

A unit is what the profile audits: a screen (web-ui/mobile), a command (cli), an endpoint
(api), an exported symbol group (library), a job type (service).

### <Unit name>

| State (from the profile's table in `surfaces.md`) | Behavior |
|---|---|
| … | … |

Example for `web-ui`: Ideal / Empty (first use) / Loading / Error / Partial-degraded.
Example for `cli`: Nominal output / Empty-missing input / Progress / Errors + exit codes / Interruption.

Repeat the full state table for EVERY unit. A unit missing any state of its profile fails
adversarial verification.

**Profile cross-cutting notes** — per `surfaces.md`:
web-ui/mobile: responsive breakpoints + accessibility (keyboard, focus, labels).
cli/library: help/docs surface. api: error-shape consistency. service: observability.

## Contract usage

Which entities and endpoints this slice uses — **by name, they already exist**. A name not found in the contracts is a spec bug.

## Test plan

| Behavior | Level | Note |
|---|---|---|
| … | unit / integration / E2E | … |

## Definition of Done

- [ ] All tests in the plan green (TDD)
- [ ] Typecheck + lint clean (or contract test suite green on untyped stacks)
- [ ] Every unit above has ALL its profile states implemented and observable
- [ ] Self-check against this spec, item by item

## Open points

`OPEN-POINT:` markers for anything genuinely ambiguous — resolved at Gate 2, never self-resolved.
