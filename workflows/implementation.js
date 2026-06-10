export const meta = {
  name: 'makeit-implementation',
  description: 'Phase 4 - waved implementation in isolated worktrees, retry-once, sequential integration',
  phases: [
    { title: 'Implement', detail: 'parallel within a wave, worktree isolation' },
    { title: 'Integrate', detail: 'sequential merges, full suite between each' },
  ],
}

/*
 * args contract:
 * {
 *   docsDir: "docs/makeit",
 *   contractPaths: string[],
 *   surfacesPath: string,
 *   designTokensNote: string,                // "" for non-UI surfaces
 *   testCommand, typecheckCommand: string,
 *   waves: [ [ { slice, profile, specPath, featurePaths: string[] } ] ],
 *   model: "sonnet"
 * }
 *
 * Stops launching further waves on a contract-blocked report (a wrong contract
 * affects every dependent slice - the orchestrator must fix it first, per
 * phases/06-implementation.md, then resume with resumeFromRunId).
 */

const MODEL = args.model ?? 'sonnet'

const REPORT = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'failed', 'blocked-on-contract', 'blocked-on-human'] },
    branch: { type: 'string' },
    detail: { type: 'string' },
  },
  required: ['status', 'branch', 'detail'],
  additionalProperties: false,
}

const INTEGRATION = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['merged', 'conflict-escalated', 'suite-red'] },
    detail: { type: 'string' },
  },
  required: ['status', 'detail'],
  additionalProperties: false,
}

function implPrompt(s, previousFailure) {
  const base = `Implement slice "${s.slice}" (profile: ${s.profile}) from its spec at ${s.specPath}. Read the spec, the feature files it covers (${s.featurePaths.join(', ')}), and the ${s.profile} state table in ${args.surfacesPath}. The contracts (${args.contractPaths.join(', ')}) are READ-ONLY: if you believe one is wrong, STOP, do not edit it, return status blocked-on-contract with the exact gap in detail. If you hit an unfinished human setup task (missing API key, external account), stub it at the contract boundary with a clear marker, finish everything else, and return blocked-on-human. ${args.designTokensNote} Method: strict TDD per the spec test plan. Definition of Done: all tests green + ${args.typecheckCommand} + lint + every unit's profile states implemented and observable + item-by-item self-check against the spec. Deliver a clean branch and report it.`
  return previousFailure
    ? `${base}\n\nThis is your single RETRY. The previous attempt failed: ${previousFailure}. Diagnose that first, then proceed.`
    : base
}

const results = []
let contractBlocked = false

for (let w = 0; w < args.waves.length && !contractBlocked; w++) {
  const wave = args.waves[w]
  phase('Implement')
  log(`wave ${w + 1}/${args.waves.length}: ${wave.map((s) => s.slice).join(', ')}`)

  const reports = await parallel(
    wave.map((s) => () =>
      agent(implPrompt(s), { label: `impl:${s.slice}`, phase: 'Implement', model: MODEL, isolation: 'worktree', schema: REPORT })
        .then(async (r) => {
          if (r && r.status === 'failed') {
            const retry = await agent(implPrompt(s, r.detail), {
              label: `retry:${s.slice}`,
              phase: 'Implement',
              model: MODEL,
              isolation: 'worktree',
              schema: REPORT,
            })
            return { slice: s.slice, ...(retry ?? { status: 'failed', branch: '', detail: 'retry agent died' }), retried: true }
          }
          return { slice: s.slice, ...(r ?? { status: 'failed', branch: '', detail: 'agent died' }), retried: false }
        }),
    ),
  )

  phase('Integrate')
  for (const r of reports.filter(Boolean)) {
    if (r.status === 'blocked-on-contract') {
      contractBlocked = true
      results.push(r)
      log(`CONTRACT BLOCKED by ${r.slice} - halting further waves: ${r.detail}`)
      continue
    }
    if (r.status !== 'done') {
      results.push(r)
      log(`${r.slice}: ${r.status} - ${r.detail}`)
      continue
    }
    const integ = await agent(
      `Integrate branch "${r.branch}" (slice ${r.slice}) into the main tree. Merge it, then run the FULL suite (${args.testCommand}) and ${args.typecheckCommand}. Trivial conflicts: resolve. Substantive conflicts or a red suite you cannot trivially fix: do NOT force it - return conflict-escalated or suite-red with the exact failure. On success, flip the slice's feature statuses to integrated in their frontmatter.`,
      { label: `integrate:${r.slice}`, phase: 'Integrate', model: MODEL, schema: INTEGRATION },
    )
    results.push({ ...r, integration: integ ?? { status: 'conflict-escalated', detail: 'integration agent died' } })
  }
}

const merged = results.filter((r) => r.integration && r.integration.status === 'merged').length
log(`implementation done: ${merged}/${results.length} merged${contractBlocked ? ' (HALTED on contract block)' : ''}`)
return { results, contractBlocked }
