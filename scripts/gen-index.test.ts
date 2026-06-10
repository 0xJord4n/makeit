import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  generate,
  parseFrontmatter,
  validateFeatures,
  type Feature,
} from "./gen-index";

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

const feat = (id: string, deps: string[] = [], over: Partial<Feature> = {}): Feature => ({
  id,
  title: id,
  tag: "must",
  slice: "core",
  status: "inventoried",
  deps,
  milestone: "",
  path: `docs/makeit/features/${id}.md`,
  ...over,
});

describe("validateFeatures", () => {
  test("accepts a valid acyclic graph", () => {
    expect(validateFeatures([feat("F-001"), feat("F-002", ["F-001"])])).toEqual([]);
  });

  test("rejects invalid tag and status", () => {
    const errors = validateFeatures([
      feat("F-001", [], { tag: "maybe" }),
      feat("F-002", [], { status: "shipped" }),
    ]);
    expect(errors.some((e) => e.includes('invalid tag "maybe"'))).toBe(true);
    expect(errors.some((e) => e.includes('invalid status "shipped"'))).toBe(true);
  });

  test("rejects duplicate ids and dangling deps", () => {
    const errors = validateFeatures([
      feat("F-001"),
      feat("F-001"),
      feat("F-002", ["F-999"]),
    ]);
    expect(errors.some((e) => e.includes("duplicate id F-001"))).toBe(true);
    expect(errors.some((e) => e.includes('dep "F-999" does not exist'))).toBe(true);
  });

  test("detects dependency cycles", () => {
    const errors = validateFeatures([
      feat("F-001", ["F-002"]),
      feat("F-002", ["F-003"]),
      feat("F-003", ["F-001"]),
    ]);
    expect(errors.some((e) => e.includes("dependency cycle"))).toBe(true);
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
    expect(md).toContain("| F-101 | Feature F-101 | must | inventoried | F-001 | - |");
    expect(json[0].milestone).toBe("");
  });
});
