import { describe, expect, it } from "vitest";

import { parseLaunchOptions, tokenizeLaunchOptions } from "../src/domain/launchOptionsParser";

describe("launchOptionsParser", () => {
  describe("tokenizeLaunchOptions", () => {
    it("tokenizes quoted values while preserving source spans", () => {
      const source = 'FOO="a b"  %command%';
      const tokens = tokenizeLaunchOptions(source);

      expect(tokens.map(({ raw, value }) => ({ raw, value }))).toEqual([
        { raw: 'FOO="a b"', value: "FOO=a b" },
        { raw: "%command%", value: "%command%" },
      ]);
      expect(source.slice(tokens[0].start, tokens[0].end)).toBe('FOO="a b"');
    });

    it.each([
      ['FOO="unterminated', "FOO=unterminated"],
      ["FOO=trailing\\", "FOO=trailing"],
    ])("marks an incomplete token: %s", (source, value) => {
      expect(tokenizeLaunchOptions(source)).toEqual([expect.objectContaining({ raw: source, value, complete: false })]);
    });
  });

  describe("parseLaunchOptions", () => {
    it("parses environment, prefix, and flag entries", () => {
      const parsed = parseLaunchOptions("FOO=1 gamescope -- mangohud %command% -x value");

      expect(parsed.markerCount).toBe(1);
      expect(parsed.entries.map(({ type, key, value }) => ({ type, key, value }))).toEqual([
        { type: "env", key: "FOO", value: "1" },
        { type: "pre_cmd", key: "gamescope", value: undefined },
        { type: "pre_cmd", key: "mangohud", value: undefined },
        { type: "flag_args", key: "-x", value: "value" },
      ]);
    });

    it("parses a quoted environment value containing spaces and equals signs", () => {
      const parsed = parseLaunchOptions('ENV="foo=x, bar=b" %command%');

      expect(parsed.entries.map(({ type, key, value }) => ({ type, key, value }))).toEqual([
        { type: "env", key: "ENV", value: "foo=x, bar=b" },
      ]);
    });

    it("tracks prefix separators for source-safe deletion", () => {
      const parsed = parseLaunchOptions("cmd1 -- cmd2 %command%");
      const [first, second] = parsed.prefixEntries;

      expect(first.separatorBefore).toBeUndefined();
      expect(first.separatorAfter?.raw).toBe("--");
      expect(second.separatorBefore?.raw).toBe("--");
      expect(second.separatorAfter).toBeUndefined();
    });

    it("counts command markers without treating quoted markers as active", () => {
      expect(parseLaunchOptions('FOO="%command%" %command%').markerCount).toBe(1);
      expect(parseLaunchOptions("%command% %command%").markerCount).toBe(2);
    });

    it("does not recognize a command marker swallowed by an incomplete quote", () => {
      const parsed = parseLaunchOptions('ENV="broken %command%');

      expect(parsed.markerCount).toBe(0);
      expect(parsed.entries).toEqual([]);
    });

    it("keeps prefix arguments containing equals signs out of environment entries", () => {
      const parsed = parseLaunchOptions("gamescope --foo=bar %command%");

      expect(parsed.entries.map(({ type, key }) => ({ type, key }))).toEqual([
        { type: "pre_cmd", key: "gamescope --foo=bar" },
      ]);
    });

    it("treats a quoted leading-hyphen token as a flag value", () => {
      const parsed = parseLaunchOptions('%command% -x "-foo"');

      expect(parsed.entries.map(({ type, key, value }) => ({ type, key, value }))).toEqual([
        { type: "flag_args", key: "-x", value: "-foo" },
      ]);
    });

    it("parses negative numbers as flag values", () => {
      const parsed = parseLaunchOptions("%command% -width -1 -height -2.5 -novid");

      expect(parsed.entries.map(({ key, value }) => ({ key, value }))).toEqual([
        { key: "-width", value: "-1" },
        { key: "-height", value: "-2.5" },
        { key: "-novid", value: undefined },
      ]);
    });
  });
});
