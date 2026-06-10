import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generate, parseFrontmatter } from "./gen-index";

const FEATURE = (id: string, slice: string, deps = "[]") => `---
id: ${id}
title: Feature ${id}
tag: must            # must | should | wont | out-of-scope
slice: ${slice}
status: inventoried
deps: ${deps}
---

## Description

Test feature.
`;

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "makeit-test-"));
  mkdirSync(join(root, "docs/makeit/features"), { recursive: true });
  writeFileSync(join(root, "docs/makeit/features/F-001-a.md"), FEATURE("F-001", "auth"));
  writeFileSync(
    join(root, "docs/makeit/features/F-101-b.md"),
    FEATURE("F-101", "dashboard", "[F-001]"),
  );
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("parseFrontmatter", () => {
  test("extracts fields and strips inline comments", () => {
    const fm = parseFrontmatter(FEATURE("F-001", "auth"));
    expect(fm.id).toBe("F-001");
    expect(fm.tag).toBe("must");
    expect(fm.slice).toBe("auth");
  });

  test("returns empty object when no frontmatter", () => {
    expect(parseFrontmatter("# Just markdown")).toEqual({});
  });
});

describe("generate", () => {
  test("derives both indexes from frontmatter", () => {
    expect(generate(root)).toBe(2);

    const json = JSON.parse(
      readFileSync(join(root, "docs/makeit/features-index.json"), "utf8"),
    );
    expect(json).toHaveLength(2);
    expect(json[0].id).toBe("F-001");
    expect(json[1].deps).toEqual(["F-001"]);

    const md = readFileSync(join(root, "docs/makeit/FEATURES.md"), "utf8");
    expect(md).toContain("## auth");
    expect(md).toContain("## dashboard");
    expect(md).toContain("| F-101 | Feature F-101 | must | inventoried | F-001 |");
  });
});
