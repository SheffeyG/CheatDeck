import { describe, expect, it } from "vitest";

import {
  isValidLaunchOption,
  LaunchOptions,
  type LaunchOptionsEditResult,
  parseLaunchOptionDefinition,
  renderLaunchOptionDefinition,
} from "../src/domain/options";

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
    const result = options.setEnabled({ kind: "environment", name: "ENV", value: "1" }, true);

    expect(options.editable).toBe(false);
    expect(result).toEqual({ ok: false, value: options, error: "document-not-editable" });
  });

  it("validates structured definitions", () => {
    expect(isValidLaunchOption({ kind: "environment", name: "BAD-NAME", value: "1" })).toBe(false);
    expect(isValidLaunchOption({ kind: "argument", flag: "--", argv: [] })).toBe(false);
    expect(isValidLaunchOption({ kind: "argument", flag: "-width", argv: ["value with spaces"] })).toBe(false);
    expect(isValidLaunchOption({ kind: "prefix", command: "ENV=1", argv: [] })).toBe(false);
    expect(isValidLaunchOption({ kind: "prefix", command: "-wrapper", argv: [] })).toBe(false);
    expect(isValidLaunchOption({ kind: "prefix", command: "cmd", argv: ["arg"] })).toBe(true);
    expect(isValidLaunchOption({ kind: "prefix", command: "cmd", argv: ["'arg with spaces'"] })).toBe(true);
    expect(isValidLaunchOption({ kind: "prefix", command: "cmd", argv: ["arg with spaces"] })).toBe(false);
  });

  it.each([
    ["ENV=1", { kind: "environment", name: "ENV", value: "1" }],
    ["ENV='hello world'", { kind: "environment", name: "ENV", value: "hello world" }],
    ["ENV=", { kind: "environment", name: "ENV", value: "" }],
    ["ENV='$HOME'", { kind: "environment", name: "ENV", value: "$HOME" }],
    ["gamescope -W 1280", { kind: "prefix", command: "gamescope", argv: ["-W", "1280"] }],
    ["~/lsfg", { kind: "prefix", command: "~/lsfg", argv: [] }],
    ["-novid", { kind: "argument", flag: "-novid", argv: [] }],
    ["-resolution 1920 1080", { kind: "argument", flag: "-resolution", argv: ["1920", "1080"] }],
  ])("infers a definition from raw input: %s", (source, expected) => {
    expect(parseLaunchOptionDefinition(source)).toEqual(expected);
  });

  it("preserves raw prefix and argument words while inferring definitions", () => {
    expect(parseLaunchOptionDefinition(`wrapper "hello world" $HOME/file`)).toEqual({
      kind: "prefix",
      command: "wrapper",
      argv: [`"hello world"`, "$HOME/file"],
    });
    expect(parseLaunchOptionDefinition(`-name "hello world" $HOME/file`)).toEqual({
      kind: "argument",
      flag: "-name",
      argv: [`"hello world"`, "$HOME/file"],
    });
  });

  it.each([
    "",
    "BAD-NAME=1",
    "ENV=1 gamescope",
    "ENV=1 OTHER=2",
    "ENV=$HOME",
    ["ENV=", "$", "{HOME}"].join(""),
    "ENV=$(command)",
    "ENV=`command`",
    'ENV="$HOME"',
    "ENV=~/path",
    "ENV=*.txt",
    "%command%",
    "--",
    "-",
    "cmd && bad",
    "cmd 'broken",
  ])("rejects an ambiguous or unsupported raw definition: %s", (source) => {
    expect(parseLaunchOptionDefinition(source)).toBeUndefined();
  });

  it("round-trips structured definitions through raw text", () => {
    const definitions = [
      { kind: "environment", name: "ENV", value: "hello world" },
      { kind: "prefix", command: "wrapper", argv: [`"hello world"`, "$HOME/file"] },
      { kind: "argument", flag: "-resolution", argv: ["1920", "1080"] },
    ] as const;

    for (const definition of definitions) {
      expect(isValidLaunchOption(definition)).toBe(true);
      expect(parseLaunchOptionDefinition(renderLaunchOptionDefinition(definition))).toEqual(definition);
    }
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

  it("uses argument presence when deleting or replacing arguments", () => {
    const noValue = success(
      LaunchOptions.parse("%command% -foo positional").setEnabled({ kind: "argument", flag: "-foo", argv: [] }, false),
    );
    const replaced = success(
      LaunchOptions.parse("%command% -width 1280 -other keep").setEnabled(
        { kind: "argument", flag: "-width", argv: ["1920"] },
        true,
      ),
    );

    expect(noValue.toString()).toContain("positional");
    expect(noValue.toString()).not.toContain("-foo");
    expect(replaced.toString()).toContain("-width 1920");
    expect(replaced.toString()).not.toContain("1280");
    expect(replaced.toString()).toContain("-other keep");
  });

  it("does not consume another option-like word while replacing a valued slot", () => {
    const replaced = success(
      LaunchOptions.parse("%command% -x -other keep").setEnabled({ kind: "argument", flag: "-x", argv: ["new"] }, true),
    );

    expect(replaced.toString()).toContain("-other keep");
    expect(replaced.toString()).toContain("-x new");
  });

  it("matches and replaces multiple argv words owned by one flag", () => {
    const definition = { kind: "argument", flag: "-resolution", argv: ["1920", "1080"] } as const;
    const replaced = success(
      LaunchOptions.parse("%command% -resolution 1280 720 -other keep").setEnabled(definition, true),
    );

    expect(replaced.toString()).toContain("-resolution 1920 1080");
    expect(replaced.toString()).not.toContain("1280 720");
    expect(replaced.toString()).toContain("-other keep");
    expect(replaced.isEnabled(definition)).toBe(true);
    expect(success(replaced.setEnabled(definition, false)).toString()).toBe("%command% -other keep");
  });

  it("maintains prefix separators and merges duplicate deletion ranges", () => {
    const first = success(
      LaunchOptions.parse("cmd1 -- cmd2 %command%").setEnabled({ kind: "prefix", command: "cmd1", argv: [] }, false),
    );
    const duplicates = success(
      LaunchOptions.parse("cmd -- cmd -- cmd %command%").setEnabled(
        { kind: "prefix", command: "cmd", argv: [] },
        false,
      ),
    );

    expect(first.toString().trim()).toBe("cmd2 %command%");
    expect(duplicates.toString()).toBe("");
  });

  it("inserts new prefix commands as the outermost wrapper", () => {
    const enabled = success(
      LaunchOptions.parse("gamescope %command%").setEnabled({ kind: "prefix", command: "~/wrapper", argv: [] }, true),
    );

    expect(enabled.toString()).toBe("~/wrapper -- gamescope %command%");
  });

  it("renders and matches prefix argv as raw words", () => {
    const definition = {
      kind: "prefix",
      command: "wrapper",
      argv: [`"hello world"`, "$HOME/file"],
    } as const;
    const enabled = success(LaunchOptions.parse("").setEnabled(definition, true));

    expect(enabled.toString()).toBe(`wrapper "hello world" $HOME/file %command%`);
    expect(enabled.isEnabled(definition)).toBe(true);
    expect(success(enabled.setEnabled(definition, false)).toString()).toBe("");
  });

  it("merges and removes options that share a prefix command", () => {
    const showAll = { kind: "prefix", command: "ls", argv: ["-a"] } as const;
    const longFormat = { kind: "prefix", command: "ls", argv: ["-l"] } as const;
    const first = success(LaunchOptions.parse("").setEnabled(showAll, true));
    const both = success(first.setEnabled(longFormat, true));

    expect(both.toString()).toBe("ls -a -l %command%");
    expect(both.isEnabled(showAll)).toBe(true);
    expect(both.isEnabled(longFormat)).toBe(true);

    const withoutShowAll = success(both.setEnabled(showAll, false));
    expect(withoutShowAll.toString()).toBe("ls -l %command%");
    expect(withoutShowAll.isEnabled(showAll)).toBe(false);
    expect(withoutShowAll.isEnabled(longFormat)).toBe(true);
    expect(success(withoutShowAll.setEnabled(longFormat, false)).toString()).toBe("");
  });

  it("uses the final assignment for checked state", () => {
    const definition = { kind: "environment", name: "ENV", value: "old" } as const;
    const options = LaunchOptions.parse("ENV=old ENV=new %command%");

    expect(options.isEnabled(definition)).toBe(false);
    expect(options.getEnvironment("ENV")).toBe("new");
    expect(options.hasEnvironment("ENV")).toBe(true);
    expect(success(options.setEnabled(definition, false)).toString()).toBe("");
  });

  it("replaces an enabled definition atomically", () => {
    const oldDefinition = { kind: "argument", flag: "-width", argv: ["1280"] } as const;
    const newDefinition = { kind: "argument", flag: "-width", argv: ["1920"] } as const;
    const original = success(LaunchOptions.parse("").setEnabled(oldDefinition, true));
    const replaced = success(original.replaceDefinition(oldDefinition, newDefinition));

    expect(replaced.isEnabled(oldDefinition)).toBe(false);
    expect(replaced.isEnabled(newDefinition)).toBe(true);
  });

  it("rolls back an atomic edit when a later definition is invalid", () => {
    const options = LaunchOptions.parse("KEEP=1 %command%");
    const result = options.edit([
      { kind: "enable", definition: { kind: "environment", name: "VALID", value: "1" } },
      { kind: "enable", definition: { kind: "environment", name: "INVALID-NAME", value: "1" } },
    ]);

    expect(result).toEqual({ ok: false, value: options, error: "invalid-definition" });
    expect(options.toString()).toBe("KEEP=1 %command%");
  });
});
