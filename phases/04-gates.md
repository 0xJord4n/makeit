# Gates — The Two Human Checkpoints

The only human interruptions after the interview. Everything presented must be a digest with paths to the full artifacts — never a file dump, never a paraphrase that replaces the source.

Display at each gate: **estimated agent volume and indicative token cost** for the upcoming phases, and the current session model.

## Gate 1 — after Decomposition

Present, in this order:

1. **Vision in 10 lines** — non-goals highlighted first
2. **Architecture summary** — module map + stack with its one-line justification, surface profile(s)
3. **Feature inventory table** — from FEATURES.md, grouped by candidate slice, tags visible, `out-of-scope` items shown last with the non-goal they collided with
4. **Contracts in brief** — entities of the data model, endpoint list
5. **Human setup tasks** — the `HUMAN-TASKS.md` checklist: what only the user can do (accounts, keys, domains), and which features block on each

Then a structured question (AskUserQuestion): **Approve / Modify / Cut**. For Modify or Cut: apply, regenerate the index, re-present the digest. Loop until explicit approval.

**Milestone split (large inventories)**: if the in-scope must/should count exceeds ~60 features, propose splitting into milestones (v0.1, v0.2, …) at this gate. The user assigns milestones; record them in feature frontmatter (`milestone:`). Each milestone then runs P3 → P6 as its own pass over the same `docs/makeit/` — the index accumulates, nothing is re-interviewed.

Record approval twice, in the same step: the ADR entry in VISION.md ("Gate 1 approved <date>: N features in scope, M cut, milestones: …") AND `state.json` (`gates.gate1 = {approved, inScope, cut}`, `phase` advanced). state.json is what dispatch reads; the ADR is the story.

## Optional — Prototype Checkpoint (design-first products)

If the interview recorded **design-first: yes**, insert between Gate 1 and Phase 3: build throwaway prototypes of the 2-3 highest-stakes screens (use the `prototype` / `frontend-design` skills if installed), present variants, the user picks. Outcomes: updated design tokens + a reference screenshot set specs can point to. Strictly time-boxed to those screens — this is a checkpoint, not a design phase.

## Gate 2 — after Specs + Adversarial Verification

Present the verdict table:

| Slice | Scope (features) | Verdict | Open points |
|---|---|---|---|
| auth | F-001, F-012, F-031 | ✅ 3/3 lenses passed | — |
| dashboard | F-101… | ⚠️ 2/3 | data refresh strategy |

For each open point, ask **one precise closed question** ("Option A: poll every 30s — simpler. Option B: websocket — live but adds infra. Which?"). Never ask "is this fine?".

Answers are written into the relevant spec + an ADR entry. Re-run the failed verification lens on amended specs. When the table is all green → explicit approval → Phase 4 starts and runs to the final report without interrupting the user.

Record approval twice: the ADR entry ("Gate 2 approved <date>: K slices, wave plan: …") AND `state.json` (`gates.gate2`, `phase: "P4"`).

## Change Control — vision changes between or during phases

When the user changes scope/vision after a gate (new feature, pivot, cut):

1. **Pause** the running phase (let in-flight agents finish their current unit; launch nothing new)
2. **Impact analysis** from the index: which features, specs, and slices are invalidated or affected
3. **Present a digest**: affected items, re-work cost estimate, contract impact
4. User approves the change plan → ADR entry in VISION.md, artifacts updated, index regenerated
5. **Resume** — re-gate only the affected parts (an invalidated spec goes back through adversarial verify; untouched slices continue)

Never absorb a vision change silently into a running wave — that is how context drift kills runs.

## Rules

- Nothing proceeds past a gate without explicit approval
- Every modification at a gate is traceable (ADR entry, regenerated index)
- The user can cut scope at a gate; the skill never re-adds cut items
