import type { LaunchOptionDefinition, LaunchOptions } from "./options";
import { parseLiteralWord } from "./parser";

const definitions = {
  noFsync: { kind: "environment", name: "PROTON_NO_FSYNC", value: "1" },
  steamDeckDesktopMode: { kind: "environment", name: "SteamDeck", value: "0" },
  wineD3d: { kind: "environment", name: "PROTON_USE_WINED3D", value: "1" },
} as const satisfies Record<string, LaunchOptionDefinition>;

const keys = {
  sidecarProgram: "PROTON_REMOTE_DEBUG_CMD",
  sidecarDirectory: "PRESSURE_VESSEL_FILESYSTEMS_RW",
  language: "LANG",
  hostLanguage: "HOST_LC_ALL",
  compatibilityPath: "STEAM_COMPAT_DATA_PATH",
  pulseLatency: "PULSE_LATENCY_MSEC",
} as const;

const environment = (name: string, value: string): LaunchOptionDefinition => ({ kind: "environment", name, value });
const enable = (definition: LaunchOptionDefinition) => ({ kind: "enable" as const, definition });
const disable = (definition: LaunchOptionDefinition) => ({ kind: "disable" as const, definition });
const unsetEnvironment = (name: string) => disable(environment(name, ""));

const parentPath = (path: string): string => {
  const separator = path.lastIndexOf("/");
  if (separator < 0) return ".";
  return separator === 0 ? path[0] : path.slice(0, separator);
};

const encodeShlexWord = (value: string): string => `'${value.split("'").join(`'"'"'`)}'`;

const decodeShlexWord = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return parseLiteralWord(value);
};

const toggleFeature = (definition: LaunchOptionDefinition) => ({
  isEnabled: (options: LaunchOptions): boolean => options.isEnabled(definition),
  setEnabled: (options: LaunchOptions, enabled: boolean) => options.setEnabled(definition, enabled),
});

export const sidecarProgram = {
  path: (options: LaunchOptions): string | undefined => decodeShlexWord(options.getEnvironment(keys.sidecarProgram)),
  directory: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.sidecarDirectory),
  isEnabled: (options: LaunchOptions): boolean => options.hasEnvironment(keys.sidecarProgram),
  set: (options: LaunchOptions, path: string) =>
    options.edit([
      enable(environment(keys.sidecarProgram, encodeShlexWord(path))),
      enable(environment(keys.sidecarDirectory, parentPath(path))),
    ]),
  disable: (options: LaunchOptions) =>
    options.edit([unsetEnvironment(keys.sidecarProgram), unsetEnvironment(keys.sidecarDirectory)]),
};

export const language = {
  value: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.language),
  isEnabled: (options: LaunchOptions): boolean =>
    options.hasEnvironment(keys.language) || options.hasEnvironment(keys.hostLanguage),
  set: (options: LaunchOptions, value: string) =>
    options.edit([enable(environment(keys.language, value)), enable(environment(keys.hostLanguage, value))]),
  disable: (options: LaunchOptions) =>
    options.edit([unsetEnvironment(keys.language), unsetEnvironment(keys.hostLanguage)]),
};

export const compatibilityPath = {
  value: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.compatibilityPath),
  set: (options: LaunchOptions, value: string) => options.setEnabled(environment(keys.compatibilityPath, value), true),
  disable: (options: LaunchOptions) => options.edit([unsetEnvironment(keys.compatibilityPath)]),
};

export const pulseLatency = {
  value: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.pulseLatency),
  set: (options: LaunchOptions, value: string | undefined) =>
    value === undefined
      ? options.edit([unsetEnvironment(keys.pulseLatency)])
      : options.edit([unsetEnvironment(keys.pulseLatency), enable(environment(keys.pulseLatency, value))]),
};

export const noFsync = toggleFeature(definitions.noFsync);
export const steamDeckDesktopMode = toggleFeature(definitions.steamDeckDesktopMode);
export const wineD3d = toggleFeature(definitions.wineD3d);
