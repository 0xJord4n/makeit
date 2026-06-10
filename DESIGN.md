# Design — `makeit`

**Status**: Validated design
**Skill location**: symlinked into `~/.claude/skills/makeit/` (global, invoked via `/makeit`)

---

## 1. Problem

Three recurring failures of agent-built projects:

1. **Generic specs** — a one-shot PRD fills gaps with plausible boilerplate instead of extracting substance from the user's head. Test: if the PRD could describe any product in the category, it is filler.
2. **Progressive loss** — every transformation (idea → PRD → spec → tasks → code) is lossy compression. Documents generated from other documents paraphrase and degrade.
3. **Never finished** — agents stop at "functional": no empty states, no loaders, no on-screen error handling, no responsive design, no UX sense. Root cause: the spec never names polish, and what is not specified does not exist.

Plus the slop specific to parallelization: N agents isolated in their worktrees reinvent the same helpers and the same components with proliferating boolean props.

## 2. Structural decisions

| Decision | Choice |
|---|---|
| Vision acquisition | **Mandatory PM interview first** — the skill never fills a gap on its own |
| Human checkpoints | **2 gates**: after foundations + inventory (Gate 1), after verified specs (Gate 2). Implementation is autonomous afterwards |
| Execution engine | **`Workflow` tool** for every fan-out; implementation agents in **isolated git worktrees** |
| Stack | **Agnostic** — decided during the interview, scaffolding via official CLIs |
| Skill architecture | **Hybrid** — PM phase and templates owned by the skill; execution delegated to native machinery (Workflow, CLIs, inherited global rules) |

## 3. Pipeline

```
/makeit "vision in a few sentences"
   │
   ▼
P1  PM INTERVIEW            interactive, 8 sections, ~10-20 min
   ▼
P2  FOUNDATIONS             VISION.md + ARCHITECTURE.md + compilable contracts
   ▼                        + CLI scaffolding + design tokens
P2.5 EXHAUSTIVE             parallel fan-out: 1 agent per job + cross-cutting agents
   │  DECOMPOSITION         + completeness critic (loop until 2 dry passes)
   ▼
🚪 GATE 1                   digest: vision + contracts + tagged feature inventory
   ▼
P3  SPECS                   fan-out: 1 spec per slice + adversarial cross-verification
   ▼
🚪 GATE 2                   verdict table; precise questions on open points
   ▼
P4  IMPLEMENTATION          waves following the dependency graph;
   │                        1 agent per slice in a worktree; TDD + DoD enforced
   ▼
P4i INTEGRATION             sequential merge in dependency order;
   │                        full suite + typecheck between EACH merge
   ▼
P4.5 DESLOPIFY              semantic duplicates + stack best practices + simplify
   ▼
P5  UX POLISH               design review + ux audit (persona) + responsiveness
   │                        + onboarding → fix → loop until 2 passes with no must-fix
   ▼
P6  FINAL E2E               full browser journeys + entire suite
```

## 4. Phase detail

### P1 — PM interview (8 sections, one question at a time)

1. **Problem & users** — concrete personas, who suffers from what today
2. **Jobs-to-be-done** — 3-5 jobs; each is a candidate slice
3. **Non-goals** — minimum 3, mandatory; the skill REFUSES to proceed without them
4. **Hard constraints** — budget, deadline, imposed integrations, compliance
5. **Stack** — choice + identification of scaffolding CLIs
6. **Prioritization** — must/should/won't; won'ts join the non-goals
7. **Measurable success criteria**
8. **UX & design intent** — 2-3 reference products, tone, v1 quality bar

Conduct rules: multiple choice whenever possible; vague answer → rephrase with concrete options, never autonomous gap-filling. Verbatim recorded in `docs/makeit/interview.md` — append-only, never summarized.

### P2 — Foundations

- `docs/makeit/VISION.md` — problem, personas, jobs, non-goals, constraints, criteria, UX intent. **Append-only**, later decisions added ADR-style.
- `docs/makeit/ARCHITECTURE.md` — modules + boundaries, data flow, stack with justifications traced to the interview.
- **Contracts = compilable code, not docs**: real DB schema (Drizzle/Prisma/…), shared types, API contracts (routes + req/res types), design tokens. Committed at Gate 1. A violation in P4 is a compile error.
- Repo skeleton scaffolded via official CLIs (CLI-first rule).

### P2.5 — Exhaustive decomposition (Workflow, parallel)

- 1 agent per job-to-be-done: sub-features, screens, flows, edge cases of ITS job.
- Cross-cutting agents (the implicit features everyone misses): auth & permissions; data lifecycle (full CRUD, deletion, export); notifications & emails; settings & admin; errors/offline/degraded; onboarding & first use.
- Completeness critic: compares against comparable products, asks "what is missing?" — loops until 2 passes with nothing new.
- Output: one file per feature + generated index (see §5). Every item tagged must/should/won't/out-of-non-goals.
- **Guardrail**: discovery expands, gates contract. The non-goals filter applies before Gate 1.

### Gate 1 — presented digest

1. Vision in 10 lines, non-goals highlighted
2. Architecture + justified stack
3. Feature index as a table, grouped by slice, tags visible
4. Contracts in brief: entities, endpoints

Structured answer (AskUserQuestion): approve / modify point X / remove feature Y. Modification → re-presentation. Nothing proceeds without explicit OK.

### P3 — Specs (Workflow, parallel)

- 1 agent per slice writes `docs/makeit/specs/<slice>.md`, grounded on: VISION.md, contracts, feature files referenced **by path** (never paraphrased).
- The spec template enforces: covered features (F-xxx), **the 5 UX states per screen** (ideal, empty, loading, error, partial), responsive, accessibility, test plan, Definition of Done.
- Adversarial cross-verification (distinct agents per lens): contract violation; hidden dependency on another slice; happy-path-only (= rejection); ambiguity (two possible readings = rejection).

### Gate 2 — verdict table

| Slice | Scope | Verdict | Open points |
|---|---|---|---|

Open points → one precise closed question ("option A or B for X?"), never "is this fine?". Approval → P4 starts with no further interruption.

### P4 — Implementation in waves (Workflow, worktrees)

- Dependency graph (frontmatter `deps`) resolved into waves; intra-wave parallelism.
- Each agent's prompt: path to ITS spec + feature files + contracts (read-only) + design tokens + DoD: green tests (TDD) + typecheck + lint + **5 UX states on screen** + self-check against the spec.
- **Slice failure**: marked `failed` in the index, does not block its wave; 1 retry with failure context injected; 2nd failure → escalated to the human in the integration report.
- **Contract discovered wrong**: silent modification in a worktree is strictly forbidden. Stop + report → orchestrator pauses dependent slices, fixes the contract, ADR entry in VISION.md, relaunches.

### P4i — Sequential integration

Merge in dependency order; **full suite + typecheck between each merge**. Trivial conflict: resolved; substantive conflict: escalated.

### P4.5 — Deslopify (Workflow, parallel then fixes)

- Semantic duplicate hunting — the slop specific to parallelization (N isolated agents reinvent the same helpers)
- If React/Next: react best practices (waterfalls, re-renders, bundle), composition patterns (boolean prop proliferation), Next.js best practices (RSC boundaries, data patterns), web interface guidelines
- Other stacks: common core (duplicates + simplify) + the framework's best-practices skill if installed
- Code simplification pass — reuse, "200 lines that should be 50"
- Harness: every fix runs against the full suite; a refactor that breaks behavior is rejected.
- Detected patterns are injected into the P5 fix agents' prompts.

### P5 — UX polish (loop)

Design review + UX audit (with the **interview persona**) + responsiveness check + onboarding audit in parallel → deduplicated findings → fix agents → re-verification. Stop: 2 consecutive passes with no must-fix.

### P6 — Final E2E

Full browser journeys + entire suite. Final report: delivered features vs index, ADR deviations, remaining debt made explicit.

## 5. Artifacts & formats

```
docs/makeit/
├── interview.md              # verbatim, append-only
├── VISION.md                 # append-only + ADR
├── ARCHITECTURE.md
├── FEATURES.md               # GENERATED INDEX — never hand-edited
├── features-index.json       # same index, for agents/scripts (jq)
├── features/
│   └── F-xxx-<slug>.md       # MD + YAML frontmatter (id, title, tag,
│                             #   slice, status, deps) + prose body
└── specs/
    └── <slice>.md
```

- **Single source of truth**: the feature files' frontmatter. The index (MD for humans, JSON for machines) is regenerated by script (glob + YAML parse) after each phase. Zero concurrent-write conflicts, zero drift possible.
- Statuses: `inventoried → spec-ready → implementing → integrated → polished` (+ `failed`).
- **Resume**: project state lives entirely in files. Re-invoking `/makeit` detects the phase from the index and resumes. No hidden session state.

## 6. Cross-cutting principles

1. **Reference, never paraphrase** — every downstream artifact points to upstream artifact paths.
2. **Discovery expands, gates contract** — the agent never arbitrates scope; the human does.
3. **Contracts are code** — inter-slice inconsistency becomes a compile error.
4. **What is not specified does not exist** — therefore the 5 UX states, responsive, and the DoD live in the template, not in hope.
5. **Cost displayed at gates** — estimated agent volume for upcoming phases; agent model = session model (the user steers via `/model`).

## 7. Repository structure

```
makeit/
├── SKILL.md                  # router: state detection + phase dispatch
├── DESIGN.md                 # this document
├── phases/
│   ├── 01-interview.md       # 8-section PM framework + conduct rules
│   ├── 02-foundations.md
│   ├── 03-decomposition.md   # job agents + cross-cutting agents + critic prompts
│   ├── 04-gates.md           # Gate 1 / Gate 2 digest formats
│   ├── 05-specs.md           # spec template usage + adversarial lenses
│   ├── 06-implementation.md  # agent prompts, waves, failures, integration
│   ├── 07-deslopify.md       # stack-conditional reviewer selection
│   └── 08-polish.md          # UX loop + final E2E
├── templates/
│   ├── feature.md            # frontmatter + mandatory sections
│   ├── spec.md               # 5 UX states, DoD, test plan
│   └── vision.md
└── scripts/
    └── gen-index.ts          # frontmatter → FEATURES.md + features-index.json
```

Progressive disclosure: SKILL.md stays small (state detection + dispatch); each phase file is loaded only when it executes.

## 8. Out of scope (v1)

- Simultaneous multi-project runs, multi-human teams
- Specific deployment backends (existing deploy skills take over)
- Resuming an existing project (the skill targets greenfield; improving existing code has other tools)
- Mobile: supported through stack agnosticism, but the P5 polish loop is web-first (installed UX audit skills are browser-based) — documented limitation

## 9. Known risks & mitigations

| Risk | Mitigation |
|---|---|
| Interview too long, user abandons | Systematic multiple choice; 8 framed sections; ~10-20 min announced |
| Scope explosion in P2.5 | Non-goals filter before Gate 1; the human cuts at the gate |
| A spec that "lied" discovered in P4 | Compilable contracts + stop-and-report protocol |
| High token cost | Estimates at gates; steerable model; waves bounded by the graph |
| Compaction/crash mid-run | State 100% in files; resume by reading the index |
