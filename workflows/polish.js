export const meta = {
  name: 'makeit-polish',
  description: 'Phase 5 - profile-driven audit/fix loop until 2 consecutive passes with zero must-fix',
  phases: [
    { title: 'Audit', detail: 'parallel auditors per surface profile' },
    { title: 'Fix', detail: 'one fix agent per round (integrated tree - no parallel writes)' },
  ],
}

/*
 * args contract:
 * {
 *   auditors: [{ name, prompt, mechanical: boolean }],
 *     // prompts built by the orchestrator from phases/08-polish.md + surfaces.md
 *     // (per profile, with the persona, against the running artifact)
 *   deslopifyReportPath: string,             // injected into fix prompts
 *   testCommand: string,
 *   model: "sonnet",
 *   sweepModel: "haiku"                      // mechanical auditors only
 * }
 *
 * Fixes are applied by ONE agent per round: auditors run against the integrated
 * tree, and parallel fixers on overlapping files would conflict. Verification
 * parallelizes; mutation does not.
 */

const MODEL = args.model ?? 'sonnet'
const SWEEP = args.sweepModel ?? 'haiku'

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['must-fix', 'should-fix', 'nice'] },
          detail: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['title', 'severity', 'detail', 'evidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['findings'],
  additionalProperties: false,
}

const FIXED = {
  type: 'object',
  properties: {
    fixed: { type: 'array', items: { type: 'string' } },
    couldNotFix: { type: 'array', items: { type: 'string' } },
  },
  required: ['fixed', 'couldNotFix'],
  additionalProperties: false,
}

let clean = 0
let round = 0
const history = []

while (clean < 2 && round < 8) {
  round++
  phase('Audit')
  const audits = await parallel(
    args.auditors.map((a) => () =>
      agent(a.prompt, {
        label: `audit:${a.name}:r${round}`,
        phase: 'Audit',
        model: a.mechanical ? SWEEP : MODEL,
        schema: FINDINGS,
      }),
    ),
  )
  const all = audits.filter(Boolean).flatMap((r) => r.findings)
  const mustFix = all.filter((f) => f.severity === 'must-fix')
  history.push({ round, mustFix: mustFix.length, total: all.length })

  if (mustFix.length === 0) {
    clean++
    log(`round ${round}: clean (${clean}/2)`)
    continue
  }
  clean = 0
  log(`round ${round}: ${mustFix.length} must-fix of ${all.length} findings`)

  phase('Fix')
  await agent(
    `Fix ALL of these must-fix findings on the integrated tree. Read ${args.deslopifyReportPath} first and do not reintroduce the anti-patterns it lists. After your fixes, run the full suite (${args.testCommand}) - a fix that breaks behavior is not a fix. Findings:\n${mustFix.map((f) => `- [${f.title}] ${f.detail} (evidence: ${f.evidence})`).join('\n')}`,
    { label: `fix:r${round}`, phase: 'Fix', model: MODEL, schema: FIXED },
  )
}

return { rounds: round, converged: clean >= 2, history }
