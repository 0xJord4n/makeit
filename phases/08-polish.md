# Phase 5 — Polish Loop + Phase 6 — Final Verification

The phase that kills "functional but not finished". Always runs against the REAL artifact —
the running app, the installed CLI, the served API, the imported package — never against the
code alone.

## Setup

Per surface profile (from VISION.md):

- **web-ui / mobile**: start the dev server / simulator; seed data loaded; sign in with the
  test accounts from `docs/makeit/test-accounts.md` (the audits must see a REAL, populated,
  authenticated app)
- **cli**: install the binary the way a user would (the documented install path)
- **api**: serve it; have the contract test client ready
- **library**: create a scratch consumer project that installs the package the documented way
- **service**: run it against a real queue/scheduler with seed jobs

## Audit Fan-Out (parallel; each writes findings with evidence)

Select the audit column of the slice's profile in `surfaces.md`:

| Profile | Audits (skill if installed, else generic checklist agent per surfaces.md rule 5) |
|---|---|
| web-ui | design-review; ux-audit **with the interview persona**; responsiveness-check; onboarding-ux |
| mobile | simulator journeys (Maestro/Detox if available); onboarding; platform-convention review |
| cli | DX audit: every `--help` complete/consistent; error messages actionable; README quickstart executed verbatim in a clean shell; exit codes verified |
| api | contract tests vs spec; error-shape consistency sweep; docs (OpenAPI or equivalent) verified against real responses |
| library | README examples executed verbatim in the scratch consumer; public API review (`design-an-interface` lens); docs coverage of exports |
| service | logs-diagnosable check (kill it mid-job, read the logs cold); restart recovery; idempotency probe; health/metrics exposure |

The persona matters on UI surfaces: the loop tests the product as THE user from the interview,
not as a generic tester. On non-UI surfaces the persona is the consuming developer/operator.

## Fix Loop

```
audits → dedupe findings → rank (must-fix / should-fix / nice)
   → fix agents in parallel (with the deslopify report in their prompts)
   → full suite + re-run the audits that produced must-fixes
   → loop
```

**Stop condition: 2 consecutive passes with zero must-fix findings.** Not "looks good now" —
two clean passes.

## Phase 6 — Final Verification

1. Full journeys per surface: every job-to-be-done from the interview, end to end, as the
   persona — browser for web-ui, clean-shell session for cli, contract client for api,
   scratch consumer for library, kill-and-recover scenario for service
2. Security pass when `compliance: true`: run the security review against the integrated tree
3. Entire test suite, final run
4. Final report:
   - Delivered features vs the index (every F-xxx accounted for: `polished` / cut at gate /
     `blocked-on-human` with its task / escalated)
   - ADR deviations accumulated during the run
   - **Remaining debt, explicit** — what a reviewer should look at first
   - How to run, test, deploy

Flip final statuses, regenerate the index one last time. The index IS the project's state of
record. If milestones were defined, report against the current milestone only and name what
the next milestone starts with.

## Exit Criteria

Report delivered. The run (or milestone) is complete.
