import { Options } from "../utils/options";

describe("Options", () => {
  let s: string;
  let opt: Options;

  it("should parse empty string correctly", () => {
    opt = new Options("");
    expect(opt.getOptionsString()).toBe("");
    expect(opt.getParameters().length).toBe(0);

    opt = new Options("%command%");
    expect(opt.getOptionsString()).toBe("");
    expect(opt.getParameters().length).toBe(0);

    opt = new Options("     ");
    expect(opt.getOptionsString()).toBe("");
    expect(opt.getParameters().length).toBe(0);
  });

  it("should identify steam games correctly", () => {
    opt = new Options("somegame.exe %command% --fullscreen");
    expect(opt.isSteamGame()).toBe(true);

    opt = new Options("heroicgameslauncher somegame.exe %command%");
    expect(opt.isSteamGame()).toBe(false);

    opt = new Options("Emulation somegame.exe %command%");
    expect(opt.isSteamGame()).toBe(false);
  });

  it("should return the same options string after parsing", () => {
    s = [
      `PROTON_REMOTE_DEBUG_CMD="path \\"with\\' space"`,
      `PRESSURE_VESSEL_FILESYSTEMS_RW="path_without_space"`,
      `script.sh -d /opt -- prefix cmd -- out`,
      `%command%`,
      `--windowed --screen 1920x1080`,
    ].join(" ");
    opt = new Options(s);
    expect(opt.getOptionsString()).toBe(s);
  });

  describe("env", () => {
    it("should handle escape and spaces correctly", () => {
      s = `ENV1="\\\\ = \\" \\'" ENV2=\\ ==\\"\\" %command%`;
      opt = new Options(s);
      expect(opt.getOptionsString()).toBe(s);
      expect(opt.hasKey("ENV1")).toBe(true);
      expect(opt.getKeyValue("ENV1")).toBe(`"\\\\ = \\" \\'"`);
      expect(opt.hasKey("ENV2")).toBe(true);
      expect(opt.getKeyValue("ENV2")).toBe(`\\ ==\\"\\"`);
    });
  });

  describe("pre_cmd", () => {
    it("should handle multiple pre_cmd correctly", () => {
      s = `-- cmd1 -- cmd2 -flag args -- -cmd3 -- %command%`;
      opt = new Options(s);
      expect(opt.getOptionsString()).toBe(`cmd1 -- cmd2 -flag args -- -cmd3 %command%`);
      expect(opt.hasKey("cmd1")).toBe(true);
      expect(opt.hasKey("cmd2 -flag args")).toBe(true);
      expect(opt.hasKey("-cmd3")).toBe(true);
    });
  });

  describe("flag_args", () => {
    it("should handle flags with and without args correctly", () => {
      s = `%command% --flag1 --flag2 arg2 --flag3 --flag4 "arg with space"`;
      opt = new Options(s);
      expect(opt.getOptionsString()).toBe(s);
      expect(opt.hasKey("--flag1")).toBe(true);
      expect(opt.hasKeyValue("--flag2", "arg2")).toBe(true);
      expect(opt.hasKey("--flag3")).toBe(true);
      expect(opt.hasKeyValue("--flag4", `"arg with space"`)).toBe(true);
    });
  });
});
