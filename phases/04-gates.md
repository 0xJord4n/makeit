# Gates — The Two Human Checkpoints

The only human interruptions after the interview. Everything presented must be a digest with paths to the full artifacts — never a file dump, never a paraphrase that replaces the source.

Display at each gate: **estimated agent volume and indicative token cost** for the upcoming phases, and the current session model.

## Gate 1 — after Decomposition

Present, in this order:

1. **Vision in 10 lines** — non-goals highlighted first
2. **Architecture summary** — module map + stack with its one-line justification
3. **Feature inventory table** — from FEATURES.md, grouped by candidate slice, tags visible, `out-of-scope` items shown last with the non-goal they collided with
4. **Contracts in brief** — entities of the data model, endpoint list

Then a structured question (AskUserQuestion): **Approve / Modify / Cut**. For Modify or Cut: apply, regenerate the index, re-present the digest. Loop until explicit approval.

Record approval as an ADR entry in VISION.md ("Gate 1 approved <date>: N features in scope, M cut").

## Gate 2 — after Specs + Adversarial Verification

Present the verdict table:

| Slice | Scope (features) | Verdict | Open points |
|---|---|---|---|
| auth | F-001, F-012, F-031 | ✅ 3/3 lenses passed | — |
| dashboard | F-101… | ⚠️ 2/3 | data refresh strategy |

For each open point, ask **one precise closed question** ("Option A: poll every 30s — simpler. Option B: websocket — live but adds infra. Which?"). Never ask "is this fine?".

Answers are written into the relevant spec + an ADR entry. Re-run the failed verification lens on amended specs. When the table is all green → explicit approval → Phase 4 starts and runs to the final report without interrupting the user.

Record approval as an ADR entry ("Gate 2 approved <date>: K slices, wave plan: …").

## Rules

- Nothing proceeds past a gate without explicit approval
- Every modification at a gate is traceable (ADR entry, regenerated index)
- The user can cut scope at a gate; the skill never re-adds cut items
