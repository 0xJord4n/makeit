export const meta = {
  name: 'makeit-decomposition',
  description: 'Phase 2.5 - exhaustive feature decomposition: per-job sweep, cross-cutting sweep, completeness critic loop',
  phases: [
    { title: 'Sweep', detail: 'one agent per job + one per cross-cutting lens' },
    { title: 'Critic', detail: 'loop until 2 consecutive dry passes' },
  ],
}

/*
 * args contract:
 * {
 *   docsDir: "docs/makeit",
 *   visionPath, architecturePath: string,
 *   contractPaths: string[],
 *   featureTemplatePath: string,            // templates/feature.md (skill repo path)
 *   newFeatureCmd: "bun <skill>/scripts/new-feature.ts",
 *   genIndexCmd: "bun <skill>/scripts/gen-index.ts",
 *   jobs: [{ name, brief }],                // jobs-to-be-done from the interview
 *   crossCutting: string[],                 // lens names per phases/03-decomposition.md
 *   references: string,                     // comparable products from interview section 8
 *   model: "sonnet"                         // routing tier (never above session ceiling)
 * }
 */

const MODEL = args.model ?? 'sonnet'

const WRITTEN = {
  type: 'object',
  properties: {
    written: { type: 'number' },
    ids: { type: 'array', items: { type: 'string' } },
    humanTasks: { type: 'array', items: { type: 'string' } },
  },
  required: ['written', 'ids', 'humanTasks'],
  additionalProperties: false,
}

const ground = `Read ${args.visionPath}, ${args.architecturePath}, the contracts (${args.contractPaths.join(', ')}), and the feature file template at ${args.featureTemplatePath}. To create each feature: run \`${args.newFeatureCmd} <F-id> --title "..." --slice <slice> --tag <tag> [--deps F-xxx,F-yyy]\` (it scaffolds valid frontmatter and refuses duplicates - NEVER author frontmatter by hand), then fill the prose sections with Edit. Do not arbitrate scope: tag must/should/wont with a one-line rationale; items colliding with a non-goal get tag out-of-scope citing it. Anything only a human can do (external accounts, API keys, domains, store listings) goes as a line into ${args.docsDir}/HUMAN-TASKS.md, NOT as a feature. Return the ids you created and any human tasks you appended.`

phase('Sweep')
const sweeps = await parallel([
  ...args.jobs.map((j, i) => () =>
    agent(
      `${ground}\n\nYour assignment - job-to-be-done "${j.name}" (${j.brief}): enumerate every sub-feature, screen/command/endpoint, flow, and edge case required to deliver this job completely. Use id range F-${(i + 1) * 100} to F-${(i + 1) * 100 + 99}.`,
      { label: `job:${j.name}`, phase: 'Sweep', model: MODEL, schema: WRITTEN },
    ),
  ),
  ...args.crossCutting.map((lens, i) => () =>
    agent(
      `${ground}\n\nYour assignment - cross-cutting sweep "${lens}": scan the WHOLE product through this single lens and write the implicit features everyone misses. Use id range F-${1000 + (i + 1) * 100} to F-${1000 + (i + 1) * 100 + 99}.`,
      { label: `lens:${lens}`, phase: 'Sweep', model: MODEL, schema: WRITTEN },
    ),
  ),
])
const swept = sweeps.filter(Boolean)
log(`sweep done: ${swept.reduce((n, r) => n + r.written, 0)} features from ${swept.length}/${sweeps.length} agents`)

phase('Critic')
let dry = 0
let round = 0
while (dry < 2 && round < 6) {
  round++
  const res = await agent(
    `First run \`${args.genIndexCmd}\` to refresh the index, then read ${args.docsDir}/FEATURES.md. ${ground}\n\nYour assignment - completeness critic, round ${round}: compare the inventory against comparable products (${args.references}). What is missing entirely - a feature, a screen, a transactional email, an admin view, a legal/consent page? Write ONLY genuinely new feature files (id range F-${9000 + round * 100}+). Return written: 0 with empty ids if nothing is missing.`,
    { label: `critic:round-${round}`, phase: 'Critic', model: MODEL, schema: WRITTEN },
  )
  if (!res || res.written === 0) dry++
  else dry = 0
  log(`critic round ${round}: ${res?.written ?? 0} new (dry ${dry}/2)`)
}

return {
  agents: sweeps.length,
  criticRounds: round,
  converged: dry >= 2,
}
