#!/usr/bin/env bun
/**
 * Scaffolds a feature file with guaranteed-valid frontmatter, then regenerates
 * the index. Agents call this to CREATE the file, then fill the prose sections
 * with Edit - they never author frontmatter by hand.
 *
 * Usage: bun scripts/new-feature.ts <F-id> --title "..." --slice <name> --tag <tag>
 *          [--deps F-001,F-002] [--milestone v0.1] [--root DIR]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { collectFeatures, generate, VALID_TAGS } from "./gen-index";

export interface NewFeature {
  id: string;
  title: string;
  slice: string;
  tag: string;
  deps: string[];
  milestone: string;
}

export function newFeature(root: string, f: NewFeature): string {
  if (!/^F-\d+$/.test(f.id)) throw new Error(`invalid id "${f.id}" (expected F-<number>)`);
  if (!f.title) throw new Error("--title is required");
  if (!f.slice) throw new Error("--slice is required");
  if (!VALID_TAGS.has(f.tag)) {
    throw new Error(`invalid tag "${f.tag}" (expected: ${[...VALID_TAGS].join(", ")})`);
  }
  const featuresDir = join(root, "docs/makeit/features");
  mkdirSync(featuresDir, { recursive: true });
  if (existsSync(featuresDir) && collectFeatures(root).some((x) => x.id === f.id)) {
    throw new Error(`duplicate id ${f.id}`);
  }
  const slug = f.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const relPath = `docs/makeit/features/${f.id}-${slug}.md`;
  const content = `---
id: ${f.id}
title: ${f.title}
tag: ${f.tag}
slice: ${f.slice}
status: inventoried
deps: [${f.deps.join(", ")}]
milestone: "${f.milestone}"
---

## Description

(fill: what this feature does and for whom, grounded in a job or cross-cutting concern)

## Sub-features

- (fill)

## Screens & flows

(fill: name every screen/command/endpoint this touches)

## Edge cases

- (fill)

## Notes

(fill or remove; reference other features as F-xxx, never copy their content)
`;
  writeFileSync(join(root, relPath), content);
  generate(root);
  return relPath;
}

function flagValue(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

if (import.meta.main) {
  const argv = process.argv.slice(2);
  try {
    const path = newFeature(flagValue(argv, "--root") ?? process.cwd(), {
      id: argv[0] ?? "",
      title: flagValue(argv, "--title") ?? "",
      slice: flagValue(argv, "--slice") ?? "",
      tag: flagValue(argv, "--tag") ?? "must",
      deps: (flagValue(argv, "--deps") ?? "").split(",").filter(Boolean),
      milestone: flagValue(argv, "--milestone") ?? "",
    });
    console.log(path);
  } catch (e) {
    console.error(`new-feature.ts: ${(e as Error).message}`);
    process.exit(1);
  }
}
