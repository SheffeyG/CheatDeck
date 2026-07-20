import { describe, expect, it } from "vitest";

import {
  compatibilityPath,
  dxvkAsync,
  framegenPatch,
  framegenUnpatch,
  language,
  losslessScaling,
  radvPerftest,
  trainer,
} from "../src/domain/features";
import { LaunchOptions, type LaunchOptionsEditResult } from "../src/domain/options";

const success = (result: LaunchOptionsEditResult): LaunchOptions => {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.value;
};

describe("features", () => {
  it("round-trips trainer paths and removes both assignments", () => {
    const path = `/home/deck/C:\\Games/it's "$trainer".exe`;
    const enabled = success(trainer.set(LaunchOptions.parse(""), path));

    expect(trainer.path(enabled)).toBe(path);
    expect(trainer.directory(enabled)).toBe("/home/deck/C:\\Games");
    expect(trainer.isEnabled(enabled)).toBe(true);
    expect(success(trainer.disable(enabled)).toString()).toBe("");
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

  it("inserts Lossless Scaling as the outermost wrapper", () => {
    const enabled = success(losslessScaling.setEnabled(LaunchOptions.parse("gamescope %command%"), true));

    expect(enabled.toString()).toBe("~/lsfg -- gamescope %command%");
  });

  it("keeps framegen patch and unpatch mutually exclusive", () => {
    const patched = success(framegenPatch.setEnabled(LaunchOptions.parse(""), true));
    const unpatched = success(framegenUnpatch.setEnabled(patched, true));
    const unchanged = framegenPatch.setEnabled(unpatched, false);

    expect(framegenPatch.isEnabled(unpatched)).toBe(false);
    expect(framegenUnpatch.isEnabled(unpatched)).toBe(true);
    expect(unchanged).toEqual({ ok: true, value: unpatched, changed: false });
  });

  it("fails closed without modifying malformed source", () => {
    const options = LaunchOptions.parse("%command% && bad");

    expect(trainer.set(options, "/tmp/trainer.exe")).toEqual({
      ok: false,
      value: options,
      error: "document-not-editable",
    });
  });
});
