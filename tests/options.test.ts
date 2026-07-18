import { describe, expect, it } from "vitest";

import { LaunchOptions, type LaunchOptionsEditResult, validateLaunchOption } from "../src/domain/options";

const success = (result: LaunchOptionsEditResult): LaunchOptions => {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.value;
};

describe("LaunchOptions", () => {
  it("preserves an unedited source exactly", () => {
    const source = "  FOO='a b'\t%command%  ";
    expect(LaunchOptions.parse(source).toString()).toBe(source);
  });

  it("rejects edits when parsing failed", () => {
    const options = LaunchOptions.parse("%command% && bad");
    const result = options.setDxvkAsync(true);

    expect(options.editable).toBe(false);
    expect(result).toEqual({ ok: false, value: options, error: "document-not-editable" });
  });

  it("validates structured definitions", () => {
    expect(validateLaunchOption({ kind: "environment", name: "BAD-NAME", value: "1" })).not.toEqual([]);
    expect(validateLaunchOption({ kind: "argument", arity: 0, token: "--" })).not.toEqual([]);
    expect(validateLaunchOption({ kind: "prefix", argv: ["cmd", "arg"] })).toEqual([]);
  });

  it("enables custom definitions idempotently and preserves unrelated source", () => {
    const definition = { kind: "environment", name: "ENV", value: "new value" } as const;
    const first = success(LaunchOptions.parse("KEEP=1 %command% -unknown 2").setEnabled(definition, true));
    const second = first.setEnabled(definition, true);

    expect(first.toString()).toContain("KEEP=1");
    expect(first.toString()).toContain("%command% -unknown 2");
    expect(first.isEnabled(definition)).toBe(true);
    expect(second).toEqual({ ok: true, value: first, changed: false });
  });

  it("uses explicit arity when deleting or replacing arguments", () => {
    const noValue = success(
      LaunchOptions.parse("%command% -foo positional").setEnabled({ kind: "argument", arity: 0, token: "-foo" }, false),
    );
    const replaced = success(
      LaunchOptions.parse("%command% -width 1280 -other keep").setEnabled(
        { kind: "argument", arity: 1, token: "-width", argument: "1920" },
        true,
      ),
    );

    expect(noValue.toString()).toContain("positional");
    expect(noValue.toString()).not.toContain("-foo");
    expect(replaced.toString()).toContain("-width 1920");
    expect(replaced.toString()).not.toContain("1280");
    expect(replaced.toString()).toContain("-other keep");
  });

  it("does not consume another option-like word while replacing an arity-one slot", () => {
    const replaced = success(
      LaunchOptions.parse("%command% -x -other keep").setEnabled(
        { kind: "argument", arity: 1, token: "-x", argument: "new" },
        true,
      ),
    );

    expect(replaced.toString()).toContain("-other keep");
    expect(replaced.toString()).toContain("-x new");
  });

  it("maintains prefix separators and merges duplicate deletion ranges", () => {
    const first = success(
      LaunchOptions.parse("cmd1 -- cmd2 %command%").setEnabled({ kind: "prefix", argv: ["cmd1"] }, false),
    );
    const duplicates = success(
      LaunchOptions.parse("cmd -- cmd -- cmd %command%").setEnabled({ kind: "prefix", argv: ["cmd"] }, false),
    );

    expect(first.toString().trim()).toBe("cmd2 %command%");
    expect(duplicates.toString()).toBe("");
  });

  it("inserts new prefix commands as the outermost wrapper", () => {
    const enabled = success(LaunchOptions.parse("gamescope %command%").setLosslessScaling(true));

    expect(enabled.toString()).toBe("~/lsfg -- gamescope %command%");
  });

  it("uses the final assignment for checked state", () => {
    const definition = { kind: "environment", name: "ENV", value: "old" } as const;
    expect(LaunchOptions.parse("ENV=old ENV=new %command%").isEnabled(definition)).toBe(false);
  });

  it("round-trips trainer paths containing shell-special characters", () => {
    const path = `/home/deck/C:\\Games/it's "$trainer".exe`;
    const enabled = success(LaunchOptions.parse("").setTrainer(path));

    expect(enabled.trainerPath).toBe(path);
    expect(enabled.trainerDirectory).toBe("/home/deck/C:\\Games");
    expect(success(enabled.disableTrainer()).toString()).toBe("");
  });

  it("sets and removes language assignments atomically", () => {
    const enabled = success(LaunchOptions.parse("").setLanguage("de_DE.UTF-8"));

    expect(enabled.toString()).toContain("LANG=de_DE.UTF-8");
    expect(enabled.toString()).toContain("HOST_LC_ALL=de_DE.UTF-8");
    expect(enabled.language).toBe("de_DE.UTF-8");
    expect(success(enabled.disableLanguage()).toString()).toBe("");
  });

  it("keeps framegen patch and unpatch mutually exclusive", () => {
    const patched = success(LaunchOptions.parse("").setFramegenPatch(true));
    const unpatched = success(patched.setFramegenUnpatch(true));
    const unchanged = unpatched.setFramegenPatch(false);

    expect(unpatched.isFramegenPatchEnabled).toBe(false);
    expect(unpatched.isFramegenUnpatchEnabled).toBe(true);
    expect(unchanged).toEqual({ ok: true, value: unpatched, changed: false });
  });

  it("replaces an enabled definition atomically", () => {
    const oldDefinition = { kind: "argument", arity: 1, token: "-width", argument: "1280" } as const;
    const newDefinition = { kind: "argument", arity: 1, token: "-width", argument: "1920" } as const;
    const original = success(LaunchOptions.parse("").setEnabled(oldDefinition, true));
    const replaced = success(original.replaceDefinition(oldDefinition, newDefinition));

    expect(replaced.isEnabled(oldDefinition)).toBe(false);
    expect(replaced.isEnabled(newDefinition)).toBe(true);
  });
});
