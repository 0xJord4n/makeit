# Phase 5 — UX Polish Loop + Phase 6 — Final E2E

The phase that kills "functional but not finished". Runs against the real app in a browser — never against the code alone.

## Setup

Start the dev server (or resolve a live target). Every audit below operates on the running app.

## Audit Fan-Out (parallel, each writes findings with screenshots/evidence)

| Audit | Skill (if installed) | Hunts |
|---|---|---|
| Visual design | design-review | Layout, typography, spacing, hierarchy, consistency vs design tokens |
| UX journeys | ux-audit — **with the persona from interview §1** | Real user threads: first contact, empty states, keyboard-only, destructive actions, interrupted workflows, wrong turns |
| Responsiveness | responsiveness-check | Breakpoints, overflow, mobile nav |
| Onboarding | onboarding-ux | First-run experience, empty states, guidance, defaults |

The persona matters: the loop tests the product as THE user from the interview, not as a generic tester.

## Fix Loop

```
audits → dedupe findings → rank (must-fix / should-fix / nice)
   → fix agents in parallel (with the deslopify report in their prompts)
   → full suite + re-run the audits that produced must-fixes
   → loop
```

**Stop condition: 2 consecutive passes with zero must-fix findings.** Not "looks good now" — two clean passes.

## Phase 6 — Final E2E

1. Full browser journeys: every job-to-be-done from the interview, end to end, as the persona
2. Entire test suite, final run
3. Final report:
   - Delivered features vs the index (every F-xxx accounted for: `polished` / cut at gate / escalated)
   - ADR deviations accumulated during the run
   - **Remaining debt, explicit** — what a reviewer should look at first
   - How to run, test, deploy

Flip final statuses, regenerate the index one last time. The index IS the project's state of record.

## Exit Criteria

Report delivered. The run is complete.
