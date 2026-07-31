import { describe, expect, it } from "vitest";

import { Options } from "./options";

describe("Options", () => {
  describe("tokens after %command%", () => {
    it("preserves a bare store token after %command%", () => {
      expect(new Options("%command% epic:123").getOptionsString()).toBe(
        "%command% epic:123",
      );
    });

    it("round-trips env + %command% + store token", () => {
      const input = "ENV=1 %command% epic:123";
      expect(new Options(input).getOptionsString()).toBe(input);
    });

    it("keeps flags after %command% unchanged", () => {
      expect(new Options("%command% -windowed").getOptionsString()).toBe(
        "%command% -windowed",
      );
    });

    it("keeps flag with argument after %command%", () => {
      expect(new Options("%command% -w 1280").getOptionsString()).toBe(
        "%command% -w 1280",
      );
    });

    it("preserves quoted values with internal spaces", () => {
      const input
        = "PROTON_REMOTE_DEBUG_CMD=\"/home/deck/Games/Trainers/trainer.exe\" %command% epic:123";
      expect(new Options(input).getOptionsString()).toBe(input);
    });

    it("preserves multiple loose tokens after %command% in order", () => {
      const input = "%command% epic:123 gog:456";
      expect(new Options(input).getOptionsString()).toBe(input);
    });

    it("preserves env + store token + flags together", () => {
      const input
        = "PROTON_REMOTE_DEBUG_CMD=\"/home/deck/Games/Trainers/trainer.exe\" PRESSURE_VESSEL_FILESYSTEMS_RW=\"/home/deck/Games/Trainers\" %command% epic:123";
      expect(new Options(input).getOptionsString()).toBe(input);
    });
  });

  describe("existing behaviour is not broken", () => {
    it("parses env vars before %command%", () => {
      const opts = new Options("MANGOHUD=1 %command%");
      expect(opts.hasKeyValue("MANGOHUD", "1")).toBe(true);
    });

    it("returns empty string when only %command%", () => {
      expect(new Options("%command%").getOptionsString()).toBe("");
    });

    it("parses prefix commands before %command%", () => {
      const opts = new Options("gamemoderun %command%");
      expect(opts.hasKey("gamemoderun")).toBe(true);
    });

    it("setOption and removeOptionByKey work with raw_arg keys", () => {
      const opts = new Options("%command% epic:123");
      expect(opts.hasKey("epic:123")).toBe(true);
      opts.removeOptionByKey("epic:123");
      expect(opts.hasKey("epic:123")).toBe(false);
      expect(opts.getOptionsString()).toBe("");
    });
  });
});
