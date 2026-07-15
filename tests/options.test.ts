import { describe, expect, it } from "vitest";

import { type LaunchOption, LaunchOptions, type LaunchOptionsEditResult } from "../src/domain/launchOptions";

const editedValue = (result: LaunchOptionsEditResult): LaunchOptions => {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.value;
};

describe("LaunchOptions", () => {
  describe("parsing and preservation", () => {
    it("preserves the source exactly and exposes business getters", () => {
      const source =
        '  DXVK_ASYNC=1\tRADV_PERFTEST=gpl LANG="ja_JP.utf8" HOST_LC_ALL=ja_JP.utf8 ' +
        "PROTON_REMOTE_DEBUG_CMD=\"'/home/deck/My Trainer.exe'\" " +
        'PRESSURE_VESSEL_FILESYSTEMS_RW="/home/deck" STEAM_COMPAT_DATA_PATH="/prefix path" ' +
        "-- ~/lsfg -- ~/fgmod/fgmod %command% -width 1920  ";
      const options = LaunchOptions.parse(source);

      expect(options.toString()).toBe(source);
      expect(options.trainerPath).toBe("/home/deck/My Trainer.exe");
      expect(options.trainerDirectory).toBe("/home/deck");
      expect(options.language).toBe("ja_JP.utf8");
      expect(options.compatibilityPath).toBe("/prefix path");
      expect(options.isTrainerEnabled).toBe(true);
      expect(options.isLanguageEnabled).toBe(true);
      expect(options.isDxvkAsyncEnabled).toBe(true);
      expect(options.isRadvPerftestEnabled).toBe(true);
      expect(options.isLosslessScalingEnabled).toBe(true);
      expect(options.isFramegenPatchEnabled).toBe(true);
      expect(options.isFramegenUnpatchEnabled).toBe(false);
    });

    it("preserves unknown parameters, whitespace, and quoting while patching one token", () => {
      const source = '  MANGOHUD="1"\t%command%   --mystery "a b"  ';
      const edited = editedValue(LaunchOptions.parse(source).setDxvkAsync(true));

      expect(edited.toString()).toContain('  MANGOHUD="1"\t');
      expect(edited.toString()).toContain('%command%   --mystery "a b"  ');
      expect(edited.isDxvkAsyncEnabled).toBe(true);
    });

    it("does not mutate the original instance", () => {
      const original = LaunchOptions.parse("FOO=1 %command%");
      const edited = editedValue(original.setLanguage("fr_FR.utf8"));

      expect(original.toString()).toBe("FOO=1 %command%");
      expect(original.language).toBeUndefined();
      expect(edited).not.toBe(original);
      expect(edited.language).toBe("fr_FR.utf8");
    });

    it("returns an empty string when only the command marker remains", () => {
      expect(LaunchOptions.parse("%command%").toString()).toBe("");
      expect(LaunchOptions.parse("  %command%\t").toString()).toBe("");
    });
  });

  describe("business edits", () => {
    it("sets and disables trainer options", () => {
      const enabled = editedValue(LaunchOptions.parse("").setTrainer("/home/deck/trainers/game.exe"));

      expect(enabled.trainerPath).toBe("/home/deck/trainers/game.exe");
      expect(enabled.trainerDirectory).toBe("/home/deck/trainers");
      expect(enabled.isTrainerEnabled).toBe(true);

      const disabled = editedValue(enabled.disableTrainer());
      expect(disabled.isTrainerEnabled).toBe(false);
      expect(disabled.trainerPath).toBeUndefined();
      expect(disabled.trainerDirectory).toBeUndefined();
      expect(disabled.toString()).toBe("");
    });

    it("sets and disables both language variables", () => {
      const enabled = editedValue(LaunchOptions.parse("%command%").setLanguage("de_DE.UTF-8"));
      expect(enabled.language).toBe("de_DE.UTF-8");
      expect(enabled.isLanguageEnabled).toBe(true);
      expect(enabled.toString()).toContain("LANG=de_DE.UTF-8");
      expect(enabled.toString()).toContain("HOST_LC_ALL=de_DE.UTF-8");

      const disabled = editedValue(enabled.disableLanguage());
      expect(disabled.isLanguageEnabled).toBe(false);
      expect(disabled.toString()).toBe("");
    });

    it("sets and disables a compatibility path", () => {
      const enabled = editedValue(
        LaunchOptions.parse("UNKNOWN=keep %command%").setCompatibilityPath("/tmp/prefix one"),
      );
      expect(enabled.compatibilityPath).toBe("/tmp/prefix one");

      const disabled = editedValue(enabled.disableCompatibilityPath());
      expect(disabled.compatibilityPath).toBeUndefined();
      expect(disabled.toString()).toMatch(/UNKNOWN=keep\s+%command%/);
    });

    it("toggles DXVK, RADV, and Lossless Scaling", () => {
      let options = LaunchOptions.parse("");
      options = editedValue(options.setDxvkAsync(true));
      options = editedValue(options.setRadvPerftest(true));
      options = editedValue(options.setLosslessScaling(true));
      expect(options.isDxvkAsyncEnabled).toBe(true);
      expect(options.isRadvPerftestEnabled).toBe(true);
      expect(options.isLosslessScalingEnabled).toBe(true);

      options = editedValue(options.setDxvkAsync(false));
      options = editedValue(options.setRadvPerftest(false));
      options = editedValue(options.setLosslessScaling(false));
      expect(options.isDxvkAsyncEnabled).toBe(false);
      expect(options.isRadvPerftestEnabled).toBe(false);
      expect(options.isLosslessScalingEnabled).toBe(false);
      expect(options.toString()).toBe("");
    });

    it("keeps Framegen patch and unpatch mutually exclusive", () => {
      let options = editedValue(LaunchOptions.parse("").setFramegenPatch(true));
      expect(options.isFramegenPatchEnabled).toBe(true);
      expect(options.isFramegenUnpatchEnabled).toBe(false);

      options = editedValue(options.setFramegenUnpatch(true));
      expect(options.isFramegenPatchEnabled).toBe(false);
      expect(options.isFramegenUnpatchEnabled).toBe(true);

      options = editedValue(options.setFramegenPatch(true));
      expect(options.isFramegenPatchEnabled).toBe(true);
      expect(options.isFramegenUnpatchEnabled).toBe(false);
    });

    it("removes duplicate managed entries and leaves unknown entries intact", () => {
      const source = "DXVK_ASYNC=1 FOO=keep DXVK_ASYNC=0 DXVK_ASYNC=1 %command%";
      const enabled = editedValue(LaunchOptions.parse(source).setDxvkAsync(true));
      expect(enabled.toString().match(/DXVK_ASYNC=/g)).toHaveLength(1);
      expect(enabled.toString()).toContain("FOO=keep");

      const disabled = editedValue(enabled.setDxvkAsync(false));
      expect(disabled.toString()).not.toContain("DXVK_ASYNC=");
      expect(disabled.toString()).toContain("FOO=keep");
    });

    it("supports consecutive immutable edits", () => {
      const first = editedValue(LaunchOptions.parse("").setLanguage("en_US.UTF-8"));
      const second = editedValue(first.setDxvkAsync(true));
      const third = editedValue(second.setCompatibilityPath("/home/deck/prefix"));

      expect(first.isDxvkAsyncEnabled).toBe(false);
      expect(second.compatibilityPath).toBeUndefined();
      expect(third.language).toBe("en_US.UTF-8");
      expect(third.isDxvkAsyncEnabled).toBe(true);
      expect(third.compatibilityPath).toBe("/home/deck/prefix");
    });
  });

  describe("custom options", () => {
    it("matches custom values exactly", () => {
      const options = LaunchOptions.parse("FOO=bar EMPTY= %command% -width 1920 -novid");

      expect(options.isCustomOptionEnabled({ type: "env", key: "FOO", value: "bar" })).toBe(true);
      expect(options.isCustomOptionEnabled({ type: "env", key: "FOO", value: "baz" })).toBe(false);
      expect(options.isCustomOptionEnabled({ type: "env", key: "FOO" })).toBe(false);
      expect(options.isCustomOptionEnabled({ type: "env", key: "EMPTY" })).toBe(true);
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-width" })).toBe(false);
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-width", value: "1920" })).toBe(true);
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-novid" })).toBe(true);
    });

    it("enables and disables each custom option type", () => {
      const customOptions: LaunchOption[] = [
        { type: "env", key: "WINEDLLOVERRIDES", value: "dinput8=n,b" },
        { type: "pre_cmd", key: "gamemoderun" },
        { type: "flag_args", key: "-windowed" },
      ];
      let options = LaunchOptions.parse("");

      for (const option of customOptions) options = editedValue(options.setCustomOption(option, true));
      for (const option of customOptions) expect(options.isCustomOptionEnabled(option)).toBe(true);

      for (const option of customOptions) options = editedValue(options.setCustomOption(option, false));
      for (const option of customOptions) expect(options.isCustomOptionEnabled(option)).toBe(false);
      expect(options.toString()).toBe("");
    });

    it("does not remove a valued option when disabling a no-value option with the same key", () => {
      const source = "%command% -width 1920";
      const edited = editedValue(
        LaunchOptions.parse(source).setCustomOption({ type: "flag_args", key: "-width" }, false),
      );
      expect(edited.toString()).toBe(source);
    });

    it.each<LaunchOption>([
      { type: "env", key: " BAD", value: "1" },
      { type: "env", key: "BAD KEY", value: "1" },
      { type: "pre_cmd", key: "cmd -- other" },
      { type: "flag_args", key: "windowed" },
      { type: "flag_args", key: "-flag", value: "%command%" },
    ])("rejects invalid custom option %#", (option) => {
      const original = LaunchOptions.parse("%command%");
      const result = original.setCustomOption(option, true);
      expect(result).toEqual({ ok: false, value: original, error: "invalid-custom-option" });
      expect(original.isCustomOptionEnabled(option)).toBe(false);
    });
  });

  describe("markers and blank input", () => {
    it.each(["FOO=1", "FOO=1 %command% %command%"])("rejects edits without exactly one marker: %s", (source) => {
      const original = LaunchOptions.parse(source);
      const result = original.setDxvkAsync(true);
      expect(result).toEqual({ ok: false, value: original, error: "missing-command-marker" });
      expect(original.toString()).toBe(source);
    });

    it.each(["", "   \t "])("allows edits of blank input: %j", (source) => {
      const edited = editedValue(LaunchOptions.parse(source).setDxvkAsync(true));
      expect(edited.isDxvkAsyncEnabled).toBe(true);
      expect(edited.toString()).toContain("%command%");
    });

    it("supports enabling and then disabling an initially empty configuration", () => {
      const enabled = editedValue(LaunchOptions.parse("").setDxvkAsync(true));
      const disabled = editedValue(enabled.setDxvkAsync(false));
      expect(disabled.toString()).toBe("");
    });
  });

  describe("quoting and token boundaries", () => {
    it("round-trips trainer and compatibility paths with shell-special characters", () => {
      const directory = '/home/deck/C:\\Games\\it\'s "odd" $cash `tick`';
      const path = `${directory}/trainer.exe`;
      let options = editedValue(LaunchOptions.parse("").setTrainer(path));
      options = editedValue(options.setCompatibilityPath(directory));

      expect(options.trainerPath).toBe(path);
      expect(options.trainerDirectory).toBe(directory);
      expect(options.compatibilityPath).toBe(directory);

      const reparsed = LaunchOptions.parse(options.toString());
      expect(reparsed.trainerPath).toBe(path);
      expect(reparsed.trainerDirectory).toBe(directory);
      expect(reparsed.compatibilityPath).toBe(directory);
    });

    it("does not delete environment variables between prefix commands", () => {
      const edited = editedValue(
        LaunchOptions.parse("cmd1 FOO=1 cmd2 %command%").setCustomOption({ type: "pre_cmd", key: "cmd1" }, false),
      );
      expect(edited.toString()).not.toContain("cmd1");
      expect(edited.toString()).toContain("FOO=1 cmd2 %command%");
    });

    it("removes the correct separator when deleting either prefix command", () => {
      const firstRemoved = editedValue(
        LaunchOptions.parse("cmd1 -- cmd2 %command%").setCustomOption({ type: "pre_cmd", key: "cmd1" }, false),
      );
      const secondRemoved = editedValue(
        LaunchOptions.parse("cmd1 -- cmd2 %command%").setCustomOption({ type: "pre_cmd", key: "cmd2" }, false),
      );

      expect(firstRemoved.toString().trim()).toBe("cmd2 %command%");
      expect(secondRemoved.toString().trim()).toMatch(/^cmd1\s+%command%$/);
      expect(firstRemoved.toString()).not.toContain("--");
      expect(secondRemoved.toString()).not.toContain("--");
    });

    it("parses a negative flag argument as its exact value", () => {
      const options = LaunchOptions.parse("%command% -width -1 -height -2.5 -novid");
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-width", value: "-1" })).toBe(true);
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-height", value: "-2.5" })).toBe(true);
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-width" })).toBe(false);
      expect(options.isCustomOptionEnabled({ type: "flag_args", key: "-novid" })).toBe(true);
    });
  });
});
