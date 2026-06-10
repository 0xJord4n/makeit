# Surface Profiles

A surface profile parameterizes the spec template (which "complete states" table applies) and
the polish loop (which audits run). The profile is chosen during interview section 5 — one per
deliverable surface; a monorepo product can combine several (e.g. `web-ui` + `api`).

The underlying principle is surface-independent: **agents stop at the happy path because
nothing names the rest.** Each profile names the rest for its medium.

## Profile table

| Profile | Deliverable | Complete states (replaces "5 UX states") | Polish loop audits |
|---|---|---|---|
| `web-ui` | Browser app/site | ideal / empty (first use) / loading / error / partial-degraded — per screen | design review, UX audit (persona), responsiveness, onboarding — browser-based |
| `mobile` | iOS/Android app | same 5 as web-ui, per screen + offline + permission-denied | simulator-based journeys (Maestro/Detox if available), onboarding, platform-convention review |
| `cli` | Command-line tool | nominal output / empty-missing input / progress (long ops) / errors + exit codes / interruption (Ctrl-C, broken pipe) — per command | DX audit: `--help` complete and consistent, error messages actionable, README quickstart executed verbatim, exit codes verified |
| `api` | HTTP/RPC service | 2xx nominal / empty result / validation errors / auth + rate-limit / 5xx + partial failure — per endpoint | contract tests vs the spec, error-shape consistency, OpenAPI (or equivalent) verified against real behavior, load sanity |
| `library` | Package/SDK | nominal usage / boundary inputs / error types raised / public API ergonomics — per exported symbol group | DX audit: README examples executed verbatim, API review (naming, consistency, minimal surface), semver sanity, docs coverage of public API |
| `service` | Worker/daemon/job | nominal run / empty queue / retry-on-failure / poison message / shutdown + restart recovery — per job type | ops audit: logs are diagnosable, metrics/health exposed, idempotency verified, restart recovery exercised |

## Rules

1. **The profile is chosen at interview §5 and recorded in VISION.md.** Multi-surface products
   list one profile per surface; each slice declares its surface in its spec.
2. **Adversarial verification uses the profile's table.** "Happy-path-only" rejection means: a
   unit (screen / command / endpoint / symbol group / job) missing any state from ITS profile
   column.
3. **The polish loop (phase 08) runs the profile's audit column.** Browser-based audits never
   run for `cli`/`api`/`library`/`service` — their DX/ops equivalents do.
4. **Definition of Done inherits the profile.** "5 UX states on screen" reads as "all complete
   states of the slice's profile, implemented and observable".
5. **A surface with no installed audit skill falls back** to a generic checklist audit by a
   subagent using this file's state column — degraded but never skipped.
