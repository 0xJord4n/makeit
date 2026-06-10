import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Run the checker as a subprocess against given file contents; return exit code. */
function check(content: string): number {
  const dir = mkdtempSync(join(tmpdir(), "makeit-wf-"));
  const file = join(dir, "candidate.js");
  writeFileSync(file, content);
  const proc = Bun.spawnSync(["bun", join(import.meta.dir, "check-workflows.ts"), file]);
  return proc.exitCode;
}

const VALID = `export const meta = {
  name: 'x',
  description: 'y',
}

phase('Go')
const r = await agent('do', { schema: { type: 'object' } })
return r
`;

describe("check-workflows", () => {
  test("accepts a valid workflow script", () => {
    expect(check(VALID)).toBe(0);
  });

  test("rejects a script without a meta block", () => {
    expect(check("const a = 1\n")).toBe(1);
  });

  test("rejects a syntax error in the body", () => {
    expect(check(VALID + "\nconst broken = {\n")).toBe(1);
  });

  test("rejects forbidden Date.now", () => {
    expect(check(VALID.replace("await agent('do'", "Date.now(); await agent('do'"))).toBe(1);
  });
});
