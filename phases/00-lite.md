# Lite Mode — One-Session Projects

For projects that fit in one session (single deliverable, 1-2 jobs, no persistent data).
The full pipeline's coordination machinery (gates, contracts, index, worktrees, decomposition)
only pays off when there are multiple slices to coordinate — here it would be pure overhead.
What still pays off at any scale: extracting real content from the user, the profile's
complete states, and **parallel verification**.

**The asymmetry that shapes this mode:** implementation of a single deliverable is sequential
(one writer — parallel writers on one artifact produce conflicts, not speed), but checking
parallelizes perfectly. So: build alone, verify in a fan-out.

## Step 1 — Mini-interview (ONE bundled round)

A single AskUserQuestion round, max 4 questions — not the 8-section march:

1. The real content/details the deliverable needs (names, copy, data, behavior — **the
   no-invention rule fully applies**; placeholder content is a lite-mode failure)
2. Non-goals in one line ("anything this should NOT do/include?")
3. Quality bar (quick utility vs showable)
4. Surface profile — only if not obvious from the request

## Step 2 — Build directly

One writer (you), straight to it. TDD where tests make sense (logic, parsing); build-then-verify
for purely declarative artifacts (static page, config). Keep the profile's complete-state table
from `surfaces.md` open while building — the states that apply (error, empty, responsive…)
are built in, not bolted on.

## Step 3 — Parallel check fan-out

The one place parallelism pays at this scale. Launch 2-4 checkers simultaneously, per profile:

| Profile | Parallel checkers |
|---|---|
| web-ui | design review; profile-states + content sweep (no lorem ipsum, no invented facts); responsiveness |
| cli | `--help` + error messages; quickstart executed verbatim in a clean shell; exit codes |
| api | contract/shape consistency; error responses; docs vs real behavior |
| library | README examples executed; public API review |
| service | logs diagnosable; restart recovery |

Each checker returns findings with evidence.

## Step 4 — Fix, then ONE clean re-check

Fix all must-fix findings, re-run only the checkers that found them. **Stop at 1 clean pass**
(not the full pipeline's 2 — calibrated to stakes). Then a 2-line report: what was built,
what the checks verified.

## Escape hatch upward

If during lite mode the scope reveals itself bigger (a 3rd job appears, persistent data shows
up, the user keeps adding), **stop and say so**: "this outgrew lite mode — full pipeline?".
Never stretch lite mode around a real product; that recreates the unfinished-project problem
the full pipeline exists to solve.

## What lite mode never drops

- The no-invention rule (Step 1 asks; placeholders are a failure)
- The profile's complete states (built in at Step 2, verified at Step 3)
- Evidence-based verification (Step 3 checks the real artifact, not the code)
