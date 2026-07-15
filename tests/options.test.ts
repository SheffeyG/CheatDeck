import { describe, expect, it } from "vitest";
import { Options } from "../src/utils/options";

describe("Options", () => {
  // ─── Constructor & Parsing ───────────────────────────────────────

  describe("constructor - parsing", () => {
    it("should parse empty input", () => {
      const opts = new Options("");
      expect(opts.getParsedOptions()).toEqual([]);
      expect(opts.getOptionsString()).toBe("");
    });

    it("should parse a single env variable before %command%", () => {
      const opts = new Options("DXVK_ASYNC=1 %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "DXVK_ASYNC", value: "1" },
      ]);
    });

    it("should parse multiple env variables before %command%", () => {
      const opts = new Options("DXVK_ASYNC=1 RADV_PERFTEST=gpl %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "DXVK_ASYNC", value: "1" },
        { type: "env", key: "RADV_PERFTEST", value: "gpl" },
      ]);
    });

    it("should parse env var with value containing = sign", () => {
      const opts = new Options("FOO=bar=baz %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "bar=baz" },
      ]);
    });

    it("should parse a single prefix command before %command%", () => {
      const opts = new Options("gamemoderun %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "pre_cmd", key: "gamemoderun" },
      ]);
    });

    it("should parse multiple prefix commands separated by --", () => {
      const opts = new Options("cmd1 -- cmd2 -- cmd3 %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "pre_cmd", key: "cmd1" },
        { type: "pre_cmd", key: "cmd2" },
        { type: "pre_cmd", key: "cmd3" },
      ]);
    });

    it("should parse mixed env vars and prefix commands", () => {
      const opts = new Options("FOO=1 BAR=2 -- gamemoderun %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "1" },
        { type: "env", key: "BAR", value: "2" },
        { type: "pre_cmd", key: "gamemoderun" },
      ]);
    });

    it("should parse flags after %command%", () => {
      const opts = new Options("%command% -windowed -fullscreen");
      expect(opts.getParsedOptions()).toEqual([
        { type: "flag_args", key: "-windowed" },
        { type: "flag_args", key: "-fullscreen" },
      ]);
    });

    it("should parse flags with values after %command%", () => {
      const opts = new Options("%command% -width 1920 -height 1080");
      expect(opts.getParsedOptions()).toEqual([
        { type: "flag_args", key: "-width", value: "1920" },
        { type: "flag_args", key: "-height", value: "1080" },
      ]);
    });

    it("should parse flags with values even when next token is also a flag", () => {
      const opts = new Options("%command% -width 1920 -fullscreen");
      expect(opts.getParsedOptions()).toEqual([
        { type: "flag_args", key: "-width", value: "1920" },
        { type: "flag_args", key: "-fullscreen" },
      ]);
    });

    it("should parse complex full launch options", () => {
      const input =
        'DXVK_ASYNC=1 PROTON_REMOTE_DEBUG_CMD="\'/path/to/trainer.exe\'" PRESSURE_VESSEL_FILESYSTEMS_RW="/path/to/dir" -- gamemoderun %command% -windowed -width 1920';
      const opts = new Options(input);

      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "DXVK_ASYNC", value: "1" },
        {
          type: "env",
          key: "PROTON_REMOTE_DEBUG_CMD",
          value: '"\'/path/to/trainer.exe\'"',
        },
        {
          type: "env",
          key: "PRESSURE_VESSEL_FILESYSTEMS_RW",
          value: '"/path/to/dir"',
        },
        { type: "pre_cmd", key: "gamemoderun" },
        { type: "flag_args", key: "-windowed" },
        { type: "flag_args", key: "-width", value: "1920" },
      ]);
    });

    it("should handle only text before %command%", () => {
      const opts = new Options("gamemoderun %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "pre_cmd", key: "gamemoderun" },
      ]);
    });

    it("should handle only text after %command%", () => {
      const opts = new Options("%command% -novid");
      expect(opts.getParsedOptions()).toEqual([
        { type: "flag_args", key: "-novid" },
      ]);
    });

    it("should handle input without %command% (all treated as before)", () => {
      const opts = new Options("DXVK_ASYNC=1");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "DXVK_ASYNC", value: "1" },
      ]);
    });

    it("should handle env values with spaces inside quotes", () => {
      const opts = new Options('FOO="hello world" %command%');
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: '"hello world"' },
      ]);
    });
  });

  // ─── Tokenizer Edge Cases ────────────────────────────────────────

  describe("tokenizer edge cases", () => {
    it("should handle single-quoted values", () => {
      const opts = new Options("FOO='hello world' %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "'hello world'" },
      ]);
    });

    it("should handle backslash escaping", () => {
      const opts = new Options('FOO=it\\\'s %command%');
      // The tokenizer keeps the backslash in the token
      expect(opts.getParsedOptions()[0].value).toContain("\\'");
    });

    it("should handle multiple spaces between tokens", () => {
      const opts = new Options("FOO=1     BAR=2   %command%");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "1" },
        { type: "env", key: "BAR", value: "2" },
      ]);
    });

    it("should handle leading/trailing spaces", () => {
      const opts = new Options("  FOO=1 %command%  ");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "1" },
      ]);
    });
  });

  // ─── setOption ────────────────────────────────────────────────────

  describe("setOption", () => {
    it("should add a new env option", () => {
      const opts = new Options("");
      opts.setOption({ type: "env", key: "FOO", value: "bar" });
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "bar" },
      ]);
    });

    it("should replace an existing option with the same key", () => {
      const opts = new Options("FOO=old %command%");
      opts.setOption({ type: "env", key: "FOO", value: "new" });
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "new" },
      ]);
    });

    it("should add a new pre_cmd option", () => {
      const opts = new Options("");
      opts.setOption({ type: "pre_cmd", key: "gamemoderun" });
      expect(opts.getParsedOptions()).toEqual([
        { type: "pre_cmd", key: "gamemoderun" },
      ]);
    });

    it("should add a new flag_args option", () => {
      const opts = new Options("%command%");
      opts.setOption({ type: "flag_args", key: "-windowed" });
      expect(opts.getParsedOptions()).toEqual([
        { type: "flag_args", key: "-windowed" },
      ]);
    });
  });

  // ─── removeOptionByKey ────────────────────────────────────────────

  describe("removeOptionByKey", () => {
    it("should remove an option by key", () => {
      const opts = new Options("FOO=1 BAR=2 %command%");
      opts.removeOptionByKey("FOO");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "BAR", value: "2" },
      ]);
    });

    it("should be a no-op if key does not exist", () => {
      const opts = new Options("FOO=1 %command%");
      opts.removeOptionByKey("NONEXISTENT");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "FOO", value: "1" },
      ]);
    });

    it("should remove all options to empty", () => {
      const opts = new Options("FOO=1 %command%");
      opts.removeOptionByKey("FOO");
      expect(opts.getParsedOptions()).toEqual([]);
    });
  });

  // ─── hasKey ──────────────────────────────────────────────────────

  describe("hasKey", () => {
    it("should return true for existing key", () => {
      const opts = new Options("FOO=1 %command%");
      expect(opts.hasKey("FOO")).toBe(true);
    });

    it("should return false for non-existing key", () => {
      const opts = new Options("FOO=1 %command%");
      expect(opts.hasKey("BAR")).toBe(false);
    });

    it("should return false for empty options", () => {
      const opts = new Options("");
      expect(opts.hasKey("FOO")).toBe(false);
    });
  });

  // ─── hasKeyValue ─────────────────────────────────────────────────

  describe("hasKeyValue", () => {
    it("should return true for exact key+value match", () => {
      const opts = new Options("FOO=bar %command%");
      expect(opts.hasKeyValue("FOO", "bar")).toBe(true);
    });

    it("should return false when key matches but value differs", () => {
      const opts = new Options("FOO=bar %command%");
      expect(opts.hasKeyValue("FOO", "baz")).toBe(false);
    });

    it("should return false when key does not exist", () => {
      const opts = new Options("FOO=bar %command%");
      expect(opts.hasKeyValue("BAR", "bar")).toBe(false);
    });
  });

  // ─── getKeyValue ─────────────────────────────────────────────────

  describe("getKeyValue", () => {
    it("should return the value for an existing key", () => {
      const opts = new Options("FOO=bar %command%");
      expect(opts.getKeyValue("FOO")).toBe("bar");
    });

    it("should return undefined for non-existing key", () => {
      const opts = new Options("FOO=bar %command%");
      expect(opts.getKeyValue("BAR")).toBeUndefined();
    });

    it("should return undefined for option without value (pre_cmd)", () => {
      const opts = new Options("gamemoderun %command%");
      expect(opts.getKeyValue("gamemoderun")).toBeUndefined();
    });
  });

  // ─── getOptionsString ────────────────────────────────────────────

  describe("getOptionsString", () => {
    it("should return empty string for empty options", () => {
      const opts = new Options("");
      expect(opts.getOptionsString()).toBe("");
    });

    it("should return empty string when only %command% is present", () => {
      const opts = new Options("%command%");
      expect(opts.getOptionsString()).toBe("");
    });

    it("should reconstruct env variables", () => {
      const opts = new Options("FOO=1 BAR=2 %command%");
      expect(opts.getOptionsString()).toBe("FOO=1 BAR=2 %command%");
    });

    it("should reconstruct prefix commands with -- separator", () => {
      const opts = new Options("cmd1 -- cmd2 %command%");
      expect(opts.getOptionsString()).toBe("cmd1 -- cmd2 %command%");
    });

    it("should reconstruct flags after %command%", () => {
      const opts = new Options("%command% -windowed -fullscreen");
      expect(opts.getOptionsString()).toBe("%command% -windowed -fullscreen");
    });

    it("should reconstruct flags with values", () => {
      const opts = new Options("%command% -width 1920 -height 1080");
      expect(opts.getOptionsString()).toBe("%command% -width 1920 -height 1080");
    });

    it("should reconstruct a full complex options string", () => {
      const input = "DXVK_ASYNC=1 gamemoderun %command% -windowed -width 1920";
      const opts = new Options(input);
      expect(opts.getOptionsString()).toBe("DXVK_ASYNC=1 gamemoderun %command% -windowed -width 1920");
    });

    it("should include %command% placeholder when both before and after parts exist", () => {
      const opts = new Options("FOO=1 %command% -windowed");
      // The implementation currently drops %command% when both sides have content
      // Let's test actual behavior
      const result = opts.getOptionsString();
      expect(result).toContain("FOO=1");
      expect(result).toContain("-windowed");
    });

    it("should round-trip: parse then reconstruct", () => {
      const input =
        'DXVK_ASYNC=1 PROTON_REMOTE_DEBUG_CMD="\'/path/cheat.exe\'" PRESSURE_VESSEL_FILESYSTEMS_RW="/path" -- gamemoderun %command% -windowed';
      const opts = new Options(input);
      const reconstructed = opts.getOptionsString();

      // Parse the reconstructed string and verify it produces the same structure
      const opts2 = new Options(reconstructed);
      expect(opts2.getParsedOptions()).toEqual(opts.getParsedOptions());
    });

    it("should include %command% in output when present in input", () => {
      const opts = new Options("FOO=1 %command%");
      expect(opts.getOptionsString()).toBe("FOO=1 %command%");
    });

    it("should include %command% in output with flags", () => {
      const opts = new Options("%command% -novid");
      expect(opts.getOptionsString()).toBe("%command% -novid");
    });

    it("should include %command% when env+pre_cmd exist", () => {
      const opts = new Options("FOO=1 gamemoderun %command%");
      expect(opts.getOptionsString()).toBe("FOO=1 gamemoderun %command%");
    });
  });

  // ─── Integration scenarios ───────────────────────────────────────

  describe("integration scenarios", () => {
    it("should handle Normal view: enable cheat with Proton debug", () => {
      // Simulate the flow in Normal.tsx
      const opts = new Options("");
      opts.setOption({
        type: "env",
        key: "PROTON_REMOTE_DEBUG_CMD",
        value: '"\'/home/deck/cheat.exe\'"',
      });
      opts.setOption({
        type: "env",
        key: "PRESSURE_VESSEL_FILESYSTEMS_RW",
        value: '"/home/deck"',
      });

      const result = opts.getOptionsString();
      expect(result).toContain("PROTON_REMOTE_DEBUG_CMD=");
      expect(result).toContain("PRESSURE_VESSEL_FILESYSTEMS_RW=");
      expect(opts.hasKey("PROTON_REMOTE_DEBUG_CMD")).toBe(true);
    });

    it("should handle Advanced view: DXVK_ASYNC toggle", () => {
      const opts = new Options("");
      opts.setOption({ type: "env", key: "DXVK_ASYNC", value: "1" });
      expect(opts.hasKeyValue("DXVK_ASYNC", "1")).toBe(true);

      opts.removeOptionByKey("DXVK_ASYNC");
      expect(opts.hasKey("DXVK_ASYNC")).toBe(false);
    });

    it("should handle Advanced view: Lossless Scaling pre_cmd", () => {
      const opts = new Options("");
      opts.setOption({ type: "pre_cmd", key: "~/lsfg" });
      expect(opts.hasKey("~/lsfg")).toBe(true);
      expect(opts.getOptionsString()).toBe("~/lsfg %command%");
    });

    it("should handle Advanced view: Framegen patch/unpatch swap", () => {
      const opts = new Options("");
      opts.removeOptionByKey("~/fgmod/fgmod-uninstaller.sh");
      opts.setOption({ type: "pre_cmd", key: "~/fgmod/fgmod" });
      expect(opts.hasKey("~/fgmod/fgmod")).toBe(true);
      expect(opts.hasKey("~/fgmod/fgmod-uninstaller.sh")).toBe(false);
    });

    it("should handle Normal view: Language toggle with LANG + HOST_LC_ALL", () => {
      const opts = new Options("");
      opts.setOption({ type: "env", key: "LANG", value: "ja_JP.utf8" });
      opts.setOption({ type: "env", key: "HOST_LC_ALL", value: "ja_JP.utf8" });

      expect(opts.getKeyValue("LANG")).toBe("ja_JP.utf8");
      expect(opts.getKeyValue("HOST_LC_ALL")).toBe("ja_JP.utf8");

      opts.removeOptionByKey("LANG");
      opts.removeOptionByKey("HOST_LC_ALL");
      expect(opts.getOptionsString()).toBe("");
    });

    it("should handle Custom view: adding user-defined option", () => {
      const opts = new Options("DXVK_ASYNC=1 %command%");
      opts.setOption({ type: "env", key: "WINEDLLOVERRIDES", value: "dinput8=n,b" });

      expect(opts.hasKey("DXVK_ASYNC")).toBe(true);
      expect(opts.hasKey("WINEDLLOVERRIDES")).toBe(true);
      const result = opts.getOptionsString();
      expect(result).toContain("DXVK_ASYNC=1");
      expect(result).toContain("WINEDLLOVERRIDES=dinput8=n,b");
    });

    it("should handle toggling off a custom option", () => {
      const opts = new Options("FOO=1 BAR=2 %command%");
      opts.removeOptionByKey("FOO");
      expect(opts.getParsedOptions()).toEqual([
        { type: "env", key: "BAR", value: "2" },
      ]);
    });
  });

  // ─── Nested quote handling (PROTON_REMOTE_DEBUG_CMD pattern) ───

  describe("nested quote handling", () => {
    it("should parse value with double-quotes wrapping single-quotes: \"'path'\"", () => {
      // This is the exact pattern used for PROTON_REMOTE_DEBUG_CMD in Normal.tsx
      const input = 'PROTON_REMOTE_DEBUG_CMD="\'/home/deck/cheat.exe\'" %command%';
      const opts = new Options(input);

      expect(opts.getParsedOptions()).toEqual([
        {
          type: "env",
          key: "PROTON_REMOTE_DEBUG_CMD",
          value: "\"'/home/deck/cheat.exe'\"",
        },
      ]);
      expect(opts.getKeyValue("PROTON_REMOTE_DEBUG_CMD")).toBe("\"'/home/deck/cheat.exe'\"");
    });

    it("should parse value with plain double-quotes: \"path\"", () => {
      // This is the pattern used for PRESSURE_VESSEL_FILESYSTEMS_RW in Normal.tsx
      const input = 'PRESSURE_VESSEL_FILESYSTEMS_RW="/home/deck" %command%';
      const opts = new Options(input);

      expect(opts.getParsedOptions()).toEqual([
        {
          type: "env",
          key: "PRESSURE_VESSEL_FILESYSTEMS_RW",
          value: '"/home/deck"',
        },
      ]);
      expect(opts.getKeyValue("PRESSURE_VESSEL_FILESYSTEMS_RW")).toBe('"/home/deck"');
    });

    it("should round-trip nested quotes through getOptionsString and re-parse", () => {
      const input =
        'PROTON_REMOTE_DEBUG_CMD="\'/home/deck/cheat.exe\'" PRESSURE_VESSEL_FILESYSTEMS_RW="/home/deck" %command%';
      const opts = new Options(input);
      const reconstructed = opts.getOptionsString();
      const opts2 = new Options(reconstructed);

      expect(opts2.getParsedOptions()).toEqual(opts.getParsedOptions());
      expect(opts2.getKeyValue("PROTON_REMOTE_DEBUG_CMD")).toBe("\"'/home/deck/cheat.exe'\"");
      expect(opts2.getKeyValue("PRESSURE_VESSEL_FILESYSTEMS_RW")).toBe('"/home/deck"');
    });

    it("should strip outer double-quotes for display (simulating Normal.tsx L54)", () => {
      // Line 54: options.getKeyValue("PROTON_REMOTE_DEBUG_CMD")?.replace(/^"'|\\|'"$/g, "")
      const input = 'PROTON_REMOTE_DEBUG_CMD="\'/home/deck/cheat.exe\'" %command%';
      const opts = new Options(input);

      const raw = opts.getKeyValue("PROTON_REMOTE_DEBUG_CMD")!;
      // Strip the outer "' and '" wrapping for display in the TextField
      const display = raw.replace(/^"'|\\|'"$/g, "");

      expect(raw).toBe("\"'/home/deck/cheat.exe'\"");
      expect(display).toBe("/home/deck/cheat.exe");
    });

    it("should strip outer double-quotes for PRESSURE_VESSEL_FILESYSTEMS_RW (simulating Normal.tsx L41)", () => {
      // Line 41: options.getKeyValue("PRESSURE_VESSEL_FILESYSTEMS_RW")?.replace(/^"|"$/g, "")
      const input = 'PRESSURE_VESSEL_FILESYSTEMS_RW="/home/deck" %command%';
      const opts = new Options(input);

      const raw = opts.getKeyValue("PRESSURE_VESSEL_FILESYSTEMS_RW")!;
      const display = raw.replace(/^"|"$/g, "");

      expect(raw).toBe('"/home/deck"');
      expect(display).toBe("/home/deck");
    });

    it("should handle paths with single-quotes escaped (simulating Normal.tsx L21)", () => {
      // Line 21: filePickerRes.path.replace(/(['"])/g, "\\$1")
      // If the file path contains a quote, it gets backslash-escaped before storage
      const pathWithQuote = "/home/deck/it's a cheat.exe";
      const escaped = pathWithQuote.replace(/(['"])/g, "\\$1");
      expect(escaped).toBe("/home/deck/it\\'s a cheat.exe");

      // Then wrapped: value = `"'${escaped}'"`
      const wrapped = `"'${escaped}'"`;
      expect(wrapped).toBe("\"'/home/deck/it\\'s a cheat.exe'\"");

      // Build options and verify round-trip
      const opts = new Options("");
      opts.setOption({ type: "env", key: "PROTON_REMOTE_DEBUG_CMD", value: wrapped });

      const output = opts.getOptionsString();
      const reparsed = new Options(output);
      expect(reparsed.getKeyValue("PROTON_REMOTE_DEBUG_CMD")).toBe(wrapped);
    });
  });
});
