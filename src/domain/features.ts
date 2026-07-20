import type { LaunchOptionDefinition, LaunchOptions, LaunchOptionsEditResult } from "./options";

const definitions = {
  dxvkAsync: { kind: "environment", name: "DXVK_ASYNC", value: "1" },
  radvPerftest: { kind: "environment", name: "RADV_PERFTEST", value: "gpl" },
  losslessScaling: { kind: "prefix", command: "~/lsfg", argv: [] },
  framegenPatch: { kind: "prefix", command: "~/fgmod/fgmod", argv: [] },
  framegenUnpatch: { kind: "prefix", command: "~/fgmod/fgmod-uninstaller.sh", argv: [] },
} as const satisfies Record<string, LaunchOptionDefinition>;

const keys = {
  trainer: "PROTON_REMOTE_DEBUG_CMD",
  trainerDirectory: "PRESSURE_VESSEL_FILESYSTEMS_RW",
  language: "LANG",
  hostLanguage: "HOST_LC_ALL",
  compatibilityPath: "STEAM_COMPAT_DATA_PATH",
} as const;

const environment = (name: string, value: string): LaunchOptionDefinition => ({ kind: "environment", name, value });

const parentPath = (path: string): string => {
  const separator = path.lastIndexOf("/");
  if (separator < 0) return ".";
  return separator === 0 ? path[0] : path.slice(0, separator);
};

const quoteShellArgument = (value: string): string => `'${value.split("'").join(`'"'"'`)}'`;

const unwrapShellArgument = (value: string | undefined): string | undefined => {
  if (value?.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).split(`'"'"'`).join("'");
  return value;
};

const toggleFeature = (definition: LaunchOptionDefinition) => ({
  isEnabled: (options: LaunchOptions): boolean => options.isEnabled(definition),
  setEnabled: (options: LaunchOptions, enabled: boolean): LaunchOptionsEditResult =>
    options.setEnabled(definition, enabled),
});

export const trainer = {
  path: (options: LaunchOptions): string | undefined => unwrapShellArgument(options.getEnvironment(keys.trainer)),
  directory: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.trainerDirectory),
  isEnabled: (options: LaunchOptions): boolean => options.hasEnvironment(keys.trainer),
  set: (options: LaunchOptions, path: string): LaunchOptionsEditResult =>
    options.edit([
      { kind: "enable", definition: environment(keys.trainer, quoteShellArgument(path)) },
      { kind: "enable", definition: environment(keys.trainerDirectory, parentPath(path)) },
    ]),
  disable: (options: LaunchOptions): LaunchOptionsEditResult =>
    options.edit([
      { kind: "disable", definition: environment(keys.trainer, "") },
      { kind: "disable", definition: environment(keys.trainerDirectory, "") },
    ]),
};

export const language = {
  value: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.language),
  isEnabled: (options: LaunchOptions): boolean =>
    options.hasEnvironment(keys.language) || options.hasEnvironment(keys.hostLanguage),
  set: (options: LaunchOptions, value: string): LaunchOptionsEditResult =>
    options.edit([
      { kind: "enable", definition: environment(keys.language, value) },
      { kind: "enable", definition: environment(keys.hostLanguage, value) },
    ]),
  disable: (options: LaunchOptions): LaunchOptionsEditResult =>
    options.edit([
      { kind: "disable", definition: environment(keys.language, "") },
      { kind: "disable", definition: environment(keys.hostLanguage, "") },
    ]),
};

export const compatibilityPath = {
  value: (options: LaunchOptions): string | undefined => options.getEnvironment(keys.compatibilityPath),
  set: (options: LaunchOptions, value: string): LaunchOptionsEditResult =>
    options.edit([{ kind: "enable", definition: environment(keys.compatibilityPath, value) }]),
  disable: (options: LaunchOptions): LaunchOptionsEditResult =>
    options.edit([{ kind: "disable", definition: environment(keys.compatibilityPath, "") }]),
};

export const dxvkAsync = toggleFeature(definitions.dxvkAsync);
export const radvPerftest = toggleFeature(definitions.radvPerftest);
export const losslessScaling = toggleFeature(definitions.losslessScaling);

export const framegenPatch = {
  isEnabled: (options: LaunchOptions): boolean => options.isEnabled(definitions.framegenPatch),
  setEnabled: (options: LaunchOptions, enabled: boolean): LaunchOptionsEditResult =>
    options.edit(
      enabled
        ? [
            { kind: "disable", definition: definitions.framegenUnpatch },
            { kind: "enable", definition: definitions.framegenPatch },
          ]
        : [{ kind: "disable", definition: definitions.framegenPatch }],
    ),
};

export const framegenUnpatch = {
  isEnabled: (options: LaunchOptions): boolean => options.isEnabled(definitions.framegenUnpatch),
  setEnabled: (options: LaunchOptions, enabled: boolean): LaunchOptionsEditResult =>
    options.edit(
      enabled
        ? [
            { kind: "disable", definition: definitions.framegenPatch },
            { kind: "enable", definition: definitions.framegenUnpatch },
          ]
        : [{ kind: "disable", definition: definitions.framegenUnpatch }],
    ),
};
