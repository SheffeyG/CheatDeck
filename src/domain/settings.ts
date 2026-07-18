import { type CustomLaunchOptionDefinition, validateLaunchOption } from "./options";

export interface CustomOption {
  id: string;
  label: string;
  definition: CustomLaunchOptionDefinition;
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
  let candidate: CustomLaunchOptionDefinition | undefined;
  if (
    definition.kind === "environment" &&
    typeof definition.name === "string" &&
    typeof definition.value === "string"
  ) {
    candidate = { kind: "environment", name: definition.name, value: definition.value };
  } else if (
    definition.kind === "prefix" &&
    Array.isArray(definition.argv) &&
    definition.argv.length > 0 &&
    definition.argv.every((word) => typeof word === "string")
  ) {
    candidate = { kind: "prefix", argv: definition.argv as [string, ...string[]] };
  } else if (definition.kind === "argument" && definition.arity === 0 && typeof definition.token === "string") {
    candidate = { kind: "argument", arity: 0, token: definition.token };
  } else if (
    definition.kind === "argument" &&
    definition.arity === 1 &&
    typeof definition.token === "string" &&
    typeof definition.argument === "string"
  ) {
    candidate = { kind: "argument", arity: 1, token: definition.token, argument: definition.argument };
  }
  return candidate !== undefined && validateLaunchOption(candidate).length === 0;
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
