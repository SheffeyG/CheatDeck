import { describe, expect, it } from "vitest";

import { parseLaunchOptions, parseLiteralWords } from "../src/domain/parser";

describe("parser", () => {
  it("parses assignments, prefixes, marker, and argument words with exact spans", () => {
    const source = "FOO=1 BAR='a b' gamescope -- mangohud %command% -x 1";
    const parsed = parseLaunchOptions(source);

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.assignments.map(({ name, value }) => [name, value])).toEqual([
      ["FOO", "1"],
      ["BAR", "a b"],
    ]);
    expect(parsed.prefixes.map((prefix) => prefix.words.map((word) => word.literal))).toEqual([
      ["gamescope"],
      ["mangohud"],
    ]);
    expect(parsed.arguments.map((word) => word.literal)).toEqual(["-x", "1"]);
    for (const word of [...parsed.prefixes.flatMap((prefix) => prefix.words), ...parsed.arguments]) {
      expect(source.slice(word.span.start, word.span.end)).toBe(word.raw);
    }
  });

  it("distinguishes static literal values from dynamic and shell-active words", () => {
    const parsed = parseLaunchOptions("STATIC='$HOME' DYNAMIC=$HOME TILDE=~/path %command%");

    expect(parsed.assignments.map(({ name, value }) => [name, value])).toEqual([
      ["STATIC", "$HOME"],
      ["DYNAMIC", undefined],
      ["TILDE", undefined],
    ]);
  });

  it("uses an implicit marker only for ASCII space and tab input", () => {
    expect(parseLaunchOptions("  \t").implicitMarker).toBe(true);
    for (const source of ["\n", "\r", "\u00a0"]) {
      expect(parseLaunchOptions(source).diagnostics.length).toBeGreaterThan(0);
    }
  });

  it("ends the assignment zone at the first prefix word", () => {
    const parsed = parseLaunchOptions("FOO=1 command BAR=2 %command%");

    expect(parsed.assignments.map((assignment) => assignment.name)).toEqual(["FOO"]);
    expect(parsed.prefixes[0].words.map((word) => word.raw)).toEqual(["command", "BAR=2"]);
  });

  it.each([
    ["FOO=1", "missing-command-marker"],
    ["%command% %command%", "multiple-command-markers"],
    ["-- cmd %command%", "empty-prefix-command"],
    ["%command% && bad", "unsupported-operator"],
    ["%command% # comment", "unsupported-comment"],
    ["%command% 'broken", "unterminated-single-quote"],
    ["%command% $'ansi'", "unsupported-dollar-quote"],
  ])("fails closed for unsupported or malformed input: %s", (source, code) => {
    expect(parseLaunchOptions(source).diagnostics.map((diagnostic) => diagnostic.code)).toContain(code);
  });

  it("keeps balanced expansions in one dynamic word", () => {
    const parsed = parseLaunchOptions("ENV=$(printf '%s %s' a b) %command%");

    expect(parsed.assignments).toEqual([
      expect.objectContaining({ name: "ENV", value: undefined, span: { start: 0, end: 25 } }),
    ]);
  });

  it("allows a wrapper separator immediately before the command marker", () => {
    const parsed = parseLaunchOptions("gamescope -- %command%");

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.prefixes[0].separatorAfter).toEqual({ start: 10, end: 12 });
  });

  it("parses only static literal argv", () => {
    expect(parseLiteralWords("cmd 'a b'")).toEqual(["cmd", "a b"]);
    expect(parseLiteralWords("cmd $HOME")).toBeUndefined();
  });
});
