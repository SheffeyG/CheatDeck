import { describe, expect, it } from "vitest";

import { compatibilityPath, dxvkAsync, language, radvPerftest, sidecarProgram } from "../src/domain/features";
import { LaunchOptions, type LaunchOptionsEditResult } from "../src/domain/options";

const success = (result: LaunchOptionsEditResult): LaunchOptions => {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.value;
};

describe("features", () => {
  it("round-trips sidecar program paths and removes both assignments", () => {
    const path = `/home/deck/C:\\Games/it's "$sidecar".exe`;
    const enabled = success(sidecarProgram.set(LaunchOptions.parse(""), path));

    expect(sidecarProgram.path(enabled)).toBe(path);
    expect(enabled.getEnvironment("PROTON_REMOTE_DEBUG_CMD")).toBe(`'/home/deck/C:\\Games/it'"'"'s "$sidecar".exe'`);
    expect(sidecarProgram.directory(enabled)).toBe("/home/deck/C:\\Games");
    expect(sidecarProgram.isEnabled(enabled)).toBe(true);
    expect(success(sidecarProgram.disable(enabled)).toString()).toBe("");
  });

  it.each([
    [`PROTON_REMOTE_DEBUG_CMD="'/home/deck/My Sidecar.exe'" %command%`, "/home/deck/My Sidecar.exe"],
    [`PROTON_REMOTE_DEBUG_CMD='"/home/deck/My Sidecar.exe"' %command%`, "/home/deck/My Sidecar.exe"],
    [`PROTON_REMOTE_DEBUG_CMD='/home/deck/My\\ Sidecar.exe' %command%`, "/home/deck/My Sidecar.exe"],
  ])("decodes a single sidecar command word from %s", (source, expected) => {
    expect(sidecarProgram.path(LaunchOptions.parse(source))).toBe(expected);
  });

  it.each([
    `PROTON_REMOTE_DEBUG_CMD='sidecar.exe --flag' %command%`,
    `PROTON_REMOTE_DEBUG_CMD="'unterminated" %command%`,
  ])("rejects an invalid sidecar command from %s", (source) => {
    expect(sidecarProgram.path(LaunchOptions.parse(source))).toBeUndefined();
  });

  it("sets and removes language assignments atomically", () => {
    const enabled = success(language.set(LaunchOptions.parse(""), "de_DE.UTF-8"));

    expect(enabled.toString()).toContain("LANG=de_DE.UTF-8");
    expect(enabled.toString()).toContain("HOST_LC_ALL=de_DE.UTF-8");
    expect(language.value(enabled)).toBe("de_DE.UTF-8");
    expect(language.isEnabled(enabled)).toBe(true);
    expect(success(language.disable(enabled)).toString()).toBe("");
  });

  it("sets and removes the compatibility path", () => {
    const enabled = success(compatibilityPath.set(LaunchOptions.parse(""), "/home/deck/prefix path"));

    expect(compatibilityPath.value(enabled)).toBe("/home/deck/prefix path");
    expect(success(compatibilityPath.disable(enabled)).toString()).toBe("");
  });

  it("manages built-in environment toggles", () => {
    const dxvk = success(dxvkAsync.setEnabled(LaunchOptions.parse(""), true));
    const radv = success(radvPerftest.setEnabled(dxvk, true));

    expect(dxvkAsync.isEnabled(radv)).toBe(true);
    expect(radvPerftest.isEnabled(radv)).toBe(true);
    expect(radv.toString()).toContain("DXVK_ASYNC=1");
    expect(radv.toString()).toContain("RADV_PERFTEST=gpl");
  });

  it("fails closed without modifying malformed source", () => {
    const options = LaunchOptions.parse("%command% && bad");

    expect(sidecarProgram.set(options, "/tmp/sidecar.exe")).toEqual({
      ok: false,
      value: options,
      error: "document-not-editable",
    });
  });
});
