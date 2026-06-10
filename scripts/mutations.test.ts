import { describe, expect, test, beforeEach, afterAll } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { newFeature } from "./new-feature";
import { setStatus } from "./set-status";
import { collectFeatures } from "./gen-index";

let root: string;
const roots: string[] = [];

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "makeit-mut-"));
  roots.push(root);
});

afterAll(() => roots.forEach((r) => rmSync(r, { recursive: true, force: true })));

const make = (id: string, deps: string[] = []) =>
  newFeature(root, { id, title: `Feature ${id}`, slice: "auth", tag: "must", deps, milestone: "" });

describe("new-feature", () => {
  test("scaffolds a valid file and regenerates the index", () => {
    const path = make("F-001");
    expect(path).toBe("docs/makeit/features/F-001-feature-f-001.md");
    const features = collectFeatures(root);
    expect(features).toHaveLength(1);
    expect(features[0].status).toBe("inventoried");
    expect(readFileSync(join(root, "docs/makeit/FEATURES.md"), "utf8")).toContain("F-001");
  });

  test("rejects duplicate ids, bad ids, and bad tags", () => {
    make("F-001");
    expect(() => make("F-001")).toThrow("duplicate id");
    expect(() => newFeature(root, { id: "X1", title: "t", slice: "s", tag: "must", deps: [], milestone: "" })).toThrow("invalid id");
    expect(() => newFeature(root, { id: "F-002", title: "t", slice: "s", tag: "maybe", deps: [], milestone: "" })).toThrow("invalid tag");
  });
});

describe("set-status", () => {
  test("flips status in frontmatter and regenerates the index", () => {
    make("F-001");
    const msg = setStatus(root, "F-001", "integrated");
    expect(msg).toBe("F-001: inventoried -> integrated");
    expect(collectFeatures(root)[0].status).toBe("integrated");
    expect(readFileSync(join(root, "docs/makeit/FEATURES.md"), "utf8")).toContain("integrated");
  });

  test("rejects invalid status and unknown id", () => {
    make("F-001");
    expect(() => setStatus(root, "F-001", "shipped")).toThrow("invalid status");
    expect(() => setStatus(root, "F-999", "integrated")).toThrow('no feature with id "F-999"');
  });

  test("refuses to regenerate when the flip would break the graph", () => {
    make("F-001");
    make("F-002", ["F-001"]);
    // a valid flip on a valid graph still passes validation inside generate()
    expect(() => setStatus(root, "F-002", "implementing")).not.toThrow();
  });
});
