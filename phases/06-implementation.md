# Phase 4 — Implementation in Waves + Sequential Integration

The parallel heart — and the place where "fully parallel" tools die. The rules below exist to keep N writers from producing globally inconsistent code.

## Wave Planning

Build the dependency graph from spec/feature frontmatter `deps`. Resolve into **waves**: wave 1 = slices with no mutual dependencies (e.g. auth, design-system); wave 2 = slices depending only on wave 1; etc. Parallelism inside a wave, sequence between waves.

## Implementation Agents (Workflow, `isolation: 'worktree'`, one per slice)

Prompt must contain:

- Path to ITS spec + the feature files it covers (read, don't paraphrase)
- Contracts: **read-only**
- Design tokens
- Method: TDD (red → green → refactor), per the spec's test plan
- **Definition of Done**: all tests green + typecheck + lint + **the 5 UX states implemented on screen** + a self-check pass against the spec, item by item
- Deliverable: clean branch + a report (what was built, deviations, test counts)

## Failure Protocol

| Event | Action |
|---|---|
| Slice fails (tests never green, agent stuck) | Mark `failed` in frontmatter; **do not block its wave**; retry ONCE with the failure context injected |
| Second failure | Stop retrying; escalate in the integration report with diagnosis |
| 3+ slices failing on the same ground | Architectural signal — stop the run, surface to the human |
| **Agent believes a contract is wrong** | FORBIDDEN to edit the contract in its worktree. Stop + report. Orchestrator: pause dependent slices → fix contract → ADR entry in VISION.md → relaunch affected agents |

The contract rule is the single most important rule of this phase. A silent contract edit in one worktree is invisible to every other agent and detonates at integration.

## Sequential Integration

Merge worktree branches **in dependency order**, one at a time:

1. Merge slice branch
2. Run the FULL suite + typecheck (not just the slice's tests)
3. Green → next. Red → trivial conflict: integration agent fixes; substantive conflict: escalate with both sides' context
4. Flip integrated features to `integrated`; regenerate index

A contract violation that survived somehow explodes here as a compile error — that is by design, this is the net.

## Exit Criteria

All slices `integrated` (or explicitly escalated); full suite green on the integrated tree. Then load `phases/07-deslopify.md`.
