# Phase 4.5 — Deslopify

Runs right after integration — the first moment the assembled codebase is visible as a whole — and before UX polish (no point polishing code about to be refactored).

**Why this phase exists:** parallel implementation creates its own slop type. N agents working in isolated worktrees each reinvent the same `formatDate()`, the same fetch hook, the same button component with 6 boolean props. Nobody saw it because nobody had the whole codebase in view.

## Review Fan-Out (Workflow, parallel)

**Common core (every stack):**

| Reviewer | Hunts |
|---|---|
| Semantic duplicates | Functions/components that do the same thing under different names across slices (use `finding-duplicate-functions` if installed) |
| Simplification | Reuse opportunities, "200 lines that should be 50", dead abstraction (use `/simplify` / code-simplifier if installed) |

**Stack-conditional (select by the stack chosen in the interview):**

| Stack | Reviewers |
|---|---|
| React / Next.js | react best-practices (waterfalls, re-renders, bundle), composition patterns (boolean prop proliferation → compound components), Next.js best practices (RSC boundaries, data patterns), web interface guidelines |
| Other | The framework's best-practices skill if installed (e.g. nestjs-best-practices); otherwise common core only |

Check the installed skill list at runtime; enroll what exists, note what was skipped.

## Fix Pass

Deduplicate findings → fix agents per module (parallel where files don't overlap) → **full suite + typecheck after every fix batch**. A refactor that breaks behavior is rejected — the test suite is what makes this phase safe to automate.

## Handoff

Write the detected anti-patterns into a short `docs/makeit/deslopify-report.md`. Phase 5 fix agents receive it in their prompts — so the polish loop does not reintroduce the slop just cleaned.

## Exit Criteria

No remaining must-fix findings; suite green. Then load `phases/08-polish.md`.
