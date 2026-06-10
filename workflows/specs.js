export const meta = {
  name: 'makeit-specs',
  description: 'Phase 3 - parallel spec writing with adversarial cross-verification per slice',
  phases: [
    { title: 'Write', detail: 'one writer per slice' },
    { title: 'Verify', detail: 'one agent per lens per spec; max 2 rounds then escalate' },
  ],
}

/*
 * args contract:
 * {
 *   docsDir: "docs/makeit",
 *   visionPath: string,
 *   contractPaths: string[],
 *   surfacesPath: string,                    // surfaces.md (skill repo path)
 *   specTemplatePath: string,                // templates/spec.md (skill repo path)
 *   slices: [{ name, profile, featurePaths: string[] }],
 *   compliance: boolean,                     // enrolls the security lens
 *   model: "sonnet"
 * }
 */

const MODEL = args.model ?? 'sonnet'

const WROTE = {
  type: 'object',
  properties: {
    specPath: { type: 'string' },
    openPoints: { type: 'array', items: { type: 'string' } },
  },
  required: ['specPath', 'openPoints'],
  additionalProperties: false,
}

const VERDICT = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['pass', 'reject'] },
    findings: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'findings'],
  additionalProperties: false,
}

const LENSES = [
  'contract-compliance: reject if the spec invents an endpoint/field or misuses an existing one',
  'hidden-coupling: reject if the spec silently depends on another slice internals instead of the contracts',
  'happy-path-only: reject if ANY unit is missing a state from ITS surface profile table in the surfaces file - check the profile column, do not just count rows',
  'ambiguity: reject if a requirement is readable two ways without an OPEN-POINT marker',
  ...(args.compliance
    ? ['security: reject if a regulated flow lacks an authz check, audit trail, or data-handling statement']
    : []),
]

function writePrompt(s, rejections) {
  const base = `Write the spec for slice "${s.name}" (surface profile: ${s.profile}) at ${args.docsDir}/specs/${s.name}.md using the template at ${args.specTemplatePath}. Ground every statement in ${args.visionPath}, the contracts (${args.contractPaths.join(', ')}), the ${s.profile} profile state table in ${args.surfacesPath}, and the feature files you implement (${s.featurePaths.join(', ')}) - reference them by id + path, NEVER copy their content. Every unit gets the FULL state table of the ${s.profile} profile. Anything genuinely ambiguous gets an OPEN-POINT marker - do not resolve it yourself. Use a depth cue: reason about what could make each requirement wrong before writing it.`
  return rejections
    ? `${base}\n\nYour previous version was REJECTED by adversarial verification. Fix exactly these findings (rewrite the spec file in place):\n- ${rejections.join('\n- ')}`
    : base
}

function verifyPrompt(s, lens) {
  return `You are an adversarial verifier with a single lens: ${lens}. Read ${args.docsDir}/specs/${s.name}.md, the contracts (${args.contractPaths.join(', ')}), and the ${s.profile} profile column in ${args.surfacesPath}. Apply ONLY your lens, strictly. verdict: pass or reject; on reject, each finding must cite the exact sentence or missing element at fault.`
}

const results = await pipeline(
  args.slices,
  (s) => agent(writePrompt(s), { label: `write:${s.name}`, phase: 'Write', model: MODEL, schema: WROTE }),
  async (wrote, s) => {
    if (!wrote) return { slice: s.name, status: 'failed', openPoints: [], findings: ['writer agent failed'] }
    let openPoints = wrote.openPoints
    for (let round = 1; round <= 2; round++) {
      const verdicts = await parallel(
        LENSES.map((lens) => () =>
          agent(verifyPrompt(s, lens), {
            label: `verify:${s.name}:${lens.split(':')[0]}`,
            phase: 'Verify',
            model: MODEL,
            schema: VERDICT,
          }),
        ),
      )
      const rejects = verdicts.filter(Boolean).filter((v) => v.verdict === 'reject')
      if (rejects.length === 0) return { slice: s.name, status: 'pass', openPoints, findings: [] }
      const findings = rejects.flatMap((r) => r.findings)
      if (round === 2) return { slice: s.name, status: 'escalate', openPoints, findings }
      const rewrite = await agent(writePrompt(s, findings), {
        label: `rewrite:${s.name}`,
        phase: 'Write',
        model: MODEL,
        schema: WROTE,
      })
      if (rewrite) openPoints = rewrite.openPoints
    }
  },
)

const out = results.filter(Boolean)
log(`specs: ${out.filter((r) => r.status === 'pass').length} pass, ${out.filter((r) => r.status === 'escalate').length} escalated, ${out.filter((r) => r.status === 'failed').length} failed`)
return out
