import { describe, expect, test, beforeEach, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  initState,
  loadState,
  setPhase,
  approveGate,
  recordConsent,
  setMilestone,
} from "./state";

let root: string;
const roots: string[] = [];

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "makeit-state-"));
  roots.push(root);
});

afterAll(() => roots.forEach((r) => rmSync(r, { recursive: true, force: true })));

describe("state", () => {
  test("init writes a valid default state", () => {
    initState(root, "full", ["web-ui", "api"], false, true);
    const s = loadState(root);
    expect(s.phase).toBe("P1");
    expect(s.surfaces).toEqual(["web-ui", "api"]);
    expect(s.designFirst).toBe(true);
    expect(s.gates.gate1).toBeNull();
  });

  test("rejects invalid mode, phase, and consent model", () => {
    expect(() => initState(root, "turbo", ["cli"], false, false)).toThrow("invalid mode");
    initState(root, "lite", ["cli"], false, false);
    expect(() => setPhase(root, "P99")).toThrow("invalid phase");
    expect(() => recordConsent(root, "gpt")).toThrow("invalid foundations model");
  });

  test("gate approvals advance the phase and enforce order", () => {
    initState(root, "full", ["web-ui"], false, false);
    expect(() => approveGate(root, 2, "2026-06-11", {})).toThrow("before gate 1");
    approveGate(root, 1, "2026-06-11", { inScope: 42, cut: 5 });
    let s = loadState(root);
    expect(s.phase).toBe("P3"); // designFirst false -> skips prototype
    expect(s.gates.gate1?.inScope).toBe(42);
    approveGate(root, 2, "2026-06-12", { slices: 6 });
    s = loadState(root);
    expect(s.phase).toBe("P4");
  });

  test("gate 1 routes to prototype when designFirst", () => {
    initState(root, "full", ["web-ui"], false, true);
    approveGate(root, 1, "2026-06-11", { inScope: 10, cut: 0 });
    expect(loadState(root).phase).toBe("prototype");
  });

  test("consent and milestone round-trip", () => {
    initState(root, "full", ["api"], true, false);
    recordConsent(root, "fable");
    setMilestone(root, "v0.1");
    const s = loadState(root);
    expect(s.modelConsent).toEqual({ asked: true, foundationsModel: "fable" });
    expect(s.milestone).toBe("v0.1");
    setMilestone(root, "none");
    expect(loadState(root).milestone).toBeNull();
  });
});
