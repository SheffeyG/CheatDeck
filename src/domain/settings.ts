import { isValidLaunchOption, type LaunchOptionDefinition } from "./options";

export interface CustomOption {
  id: string;
  label: string;
  definition: LaunchOptionDefinition;
}

export interface SettingsSnapshot {
  showPreview: boolean;
  skipWineCheck: boolean;
  customOptions: CustomOption[];
}

const isCustomOption = (value: unknown): value is CustomOption => {
  if (!value || typeof value !== "object") return false;
  const option = value as Record<string, unknown>;
  if (
    typeof option.id !== "string" ||
    option.id.trim() === "" ||
    typeof option.label !== "string" ||
    option.label.trim() === "" ||
    !option.definition
  ) {
    return false;
  }
  const definition = option.definition as Record<string, unknown>;
  let candidate: LaunchOptionDefinition | undefined;
  if (
    definition.kind === "environment" &&
    typeof definition.name === "string" &&
    typeof definition.value === "string"
  ) {
    candidate = { kind: "environment", name: definition.name, value: definition.value };
  } else if (
    definition.kind === "prefix" &&
    typeof definition.command === "string" &&
    Array.isArray(definition.argv) &&
    definition.argv.every((word) => typeof word === "string")
  ) {
    candidate = { kind: "prefix", command: definition.command, argv: definition.argv as string[] };
  } else if (
    definition.kind === "argument" &&
    typeof definition.flag === "string" &&
    Array.isArray(definition.argv) &&
    definition.argv.every((word) => typeof word === "string")
  ) {
    candidate = { kind: "argument", flag: definition.flag, argv: definition.argv as string[] };
  }
  return candidate !== undefined && isValidLaunchOption(candidate);
};

export const decodeStoredCustomOptions = (value: unknown): CustomOption[] => {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.filter((option): option is CustomOption => {
    if (!isCustomOption(option) || ids.has(option.id)) return false;
    ids.add(option.id);
    return true;
  });
};
