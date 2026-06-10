// Validates makeit workflow scripts the way the Workflow runtime parses them:
// body runs inside an async function scope with the runtime globals injected.
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let fail = 0;
for (const f of process.argv.slice(2)) {
  const src = await Bun.file(f).text();
  const metaMatch = src.match(/^export const meta = \{[\s\S]*?\n\}\n/m);
  if (!metaMatch) { console.log(`FAIL ${f}: no meta block`); fail = 1; continue; }
  try {
    JSON.parse; // noop
    // meta must be a pure literal: eval it in isolation
    new Function(`return ${metaMatch[0].replace("export const meta = ", "")}`)();
    const body = src.replace(metaMatch[0], "");
    new AsyncFunction("args", "agent", "parallel", "pipeline", "phase", "log", "workflow", "budget", body);
    if (/Date\.now|Math\.random|new Date\(\)/.test(body)) { console.log(`FAIL ${f}: forbidden Date.now/Math.random/new Date()`); fail = 1; continue; }
    console.log(`OK ${f}`);
  } catch (e) {
    console.log(`FAIL ${f}: ${(e as Error).message}`); fail = 1;
  }
}
process.exit(fail);
