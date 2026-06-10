#!/usr/bin/env bun
/**
 * Structured mutations for docs/makeit/state.json - the run-level state record.
 * The orchestrating LLM decides WHAT changes; this script performs the mutation
 * with schema and enum validation, so a malformed JSON or an invented phase
 * value can never reach the dispatch logic.
 *
 * Usage (root defaults to cwd):
 *   bun scripts/state.ts init --mode full --surfaces web-ui,api [--compliance] [--design-first] [--root DIR]
 *   bun scripts/state.ts set-phase P3
 *   bun scripts/state.ts approve-gate 1 --in-scope 42 --cut 5
 *   bun scripts/state.ts approve-gate 2 --slices 6
 *   bun scripts/state.ts consent --foundations session|opus|fable
 *   bun scripts/state.ts set-milestone v0.1 | none
 *   bun scripts/state.ts get
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const PHASES = [
  "P1",
  "P2",
  "P2.5",
  "gate1",
  "prototype",
  "P3",
  "gate2",
  "P4",
  "P4.5",
  "P5",
  "P6",
  "done",
] as const;
export const MODES = ["full", "lite", "adopt"] as const;
export const FOUNDATION_MODELS = ["session", "opus", "fable"] as const;

export interface GateRecord {
  approved: string;
  inScope?: number;
  cut?: number;
  slices?: number;
}

export interface RunState {
  mode: (typeof MODES)[number];
  phase: (typeof PHASES)[number];
  surfaces: string[];
  compliance: boolean;
  designFirst: boolean;
  milestone: string | null;
  gates: { gate1: GateRecord | null; gate2: GateRecord | null };
  modelConsent: { asked: boolean; foundationsModel: string | null };
}

function statePath(root: string): string {
  return join(root, "docs/makeit/state.json");
}

export function loadState(root: string): RunState {
  const path = statePath(root);
  if (!existsSync(path)) {
    throw new Error(`no state.json at ${path} - run "state.ts init" first`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as RunState;
}

export function saveState(root: string, state: RunState): void {
  mkdirSync(join(root, "docs/makeit"), { recursive: true });
  writeFileSync(statePath(root), JSON.stringify(state, null, 2) + "\n");
}

export function initState(
  root: string,
  mode: string,
  surfaces: string[],
  compliance: boolean,
  designFirst: boolean,
): RunState {
  if (!(MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid mode "${mode}" (expected: ${MODES.join(", ")})`);
  }
  if (surfaces.length === 0) {
    throw new Error("at least one surface profile is required");
  }
  const state: RunState = {
    mode: mode as RunState["mode"],
    phase: "P1",
    surfaces,
    compliance,
    designFirst,
    milestone: null,
    gates: { gate1: null, gate2: null },
    modelConsent: { asked: false, foundationsModel: null },
  };
  saveState(root, state);
  return state;
}

export function setPhase(root: string, phase: string): RunState {
  if (!(PHASES as readonly string[]).includes(phase)) {
    throw new Error(`invalid phase "${phase}" (expected: ${PHASES.join(", ")})`);
  }
  const state = loadState(root);
  state.phase = phase as RunState["phase"];
  saveState(root, state);
  return state;
}

export function approveGate(
  root: string,
  gate: 1 | 2,
  date: string,
  detail: { inScope?: number; cut?: number; slices?: number },
): RunState {
  const state = loadState(root);
  const record: GateRecord = { approved: date, ...detail };
  if (gate === 1) {
    state.gates.gate1 = record;
    state.phase = state.designFirst ? "prototype" : "P3";
  } else {
    if (!state.gates.gate1) throw new Error("cannot approve gate 2 before gate 1");
    state.gates.gate2 = record;
    state.phase = "P4";
  }
  saveState(root, state);
  return state;
}

export function recordConsent(root: string, foundationsModel: string): RunState {
  if (!(FOUNDATION_MODELS as readonly string[]).includes(foundationsModel)) {
    throw new Error(
      `invalid foundations model "${foundationsModel}" (expected: ${FOUNDATION_MODELS.join(", ")})`,
    );
  }
  const state = loadState(root);
  state.modelConsent = { asked: true, foundationsModel };
  saveState(root, state);
  return state;
}

export function setMilestone(root: string, milestone: string): RunState {
  const state = loadState(root);
  state.milestone = milestone === "none" ? null : milestone;
  saveState(root, state);
  return state;
}

function flagValue(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

if (import.meta.main) {
  const argv = process.argv.slice(2);
  const root = flagValue(argv, "--root") ?? process.cwd();
  const cmd = argv[0];
  try {
    switch (cmd) {
      case "init":
        initState(
          root,
          flagValue(argv, "--mode") ?? "full",
          (flagValue(argv, "--surfaces") ?? "").split(",").filter(Boolean),
          argv.includes("--compliance"),
          argv.includes("--design-first"),
        );
        break;
      case "set-phase":
        setPhase(root, argv[1]);
        break;
      case "approve-gate": {
        const gate = Number(argv[1]);
        if (gate !== 1 && gate !== 2) throw new Error("gate must be 1 or 2");
        const today = new Date().toISOString().slice(0, 10);
        approveGate(root, gate, flagValue(argv, "--date") ?? today, {
          inScope: flagValue(argv, "--in-scope") ? Number(flagValue(argv, "--in-scope")) : undefined,
          cut: flagValue(argv, "--cut") ? Number(flagValue(argv, "--cut")) : undefined,
          slices: flagValue(argv, "--slices") ? Number(flagValue(argv, "--slices")) : undefined,
        });
        break;
      }
      case "consent":
        recordConsent(root, flagValue(argv, "--foundations") ?? "");
        break;
      case "set-milestone":
        setMilestone(root, argv[1] ?? "none");
        break;
      case "get":
        break;
      default:
        throw new Error(`unknown command "${cmd}" - see header for usage`);
    }
    console.log(JSON.stringify(loadState(root), null, 2));
  } catch (e) {
    console.error(`state.ts: ${(e as Error).message}`);
    process.exit(1);
  }
}
