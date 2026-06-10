#!/usr/bin/env bun
/**
 * Flips a feature's status in its frontmatter, with enum validation, then
 * regenerates the index. The LLM decides WHICH feature moves to WHAT status;
 * this script performs the YAML edit so hand-editing (and its typos) never
 * touches the frontmatter.
 *
 * Usage: bun scripts/set-status.ts <F-id> <status> [--root DIR]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { collectFeatures, generate, VALID_STATUSES } from "./gen-index";

export function setStatus(root: string, id: string, status: string): string {
  if (!VALID_STATUSES.has(status)) {
    throw new Error(
      `invalid status "${status}" (expected: ${[...VALID_STATUSES].join(", ")})`,
    );
  }
  const feature = collectFeatures(root).find((f) => f.id === id);
  if (!feature) {
    throw new Error(`no feature with id "${id}"`);
  }
  const path = join(root, feature.path);
  const src = readFileSync(path, "utf8");
  const updated = src.replace(
    /^(status:\s*)\S[^\n#]*?(\s*(?:#.*)?)$/m,
    `$1${status}$2`,
  );
  if (updated === src && feature.status !== status) {
    throw new Error(`could not locate the status line in ${feature.path}`);
  }
  writeFileSync(path, updated);
  generate(root);
  return `${id}: ${feature.status} -> ${status}`;
}

if (import.meta.main) {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf("--root");
  const root = rootFlag >= 0 ? argv[rootFlag + 1] : process.cwd();
  try {
    console.log(setStatus(root, argv[0] ?? "", argv[1] ?? ""));
  } catch (e) {
    console.error(`set-status.ts: ${(e as Error).message}`);
    process.exit(1);
  }
}
