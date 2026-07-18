import { Dropdown, Field, Focusable, TextField } from "@decky/ui";
import type { FC } from "react";

import { parseLiteralArgv, renderLiteralArgv, validateLaunchOption } from "../domain/options";
import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";

export type CustomOptionKind = "environment" | "prefix" | "argument";

export interface CustomOptionDraft {
  id: string;
  label: string;
  kind: CustomOptionKind;
  primary: string;
  value: string;
}

const optionTypes: { label: string; data: CustomOptionKind }[] = [
  { label: t("CUSTOM_TYPE_ENV", "Environment Variable"), data: "environment" },
  { label: t("CUSTOM_TYPE_CMD", "Prefix Command"), data: "prefix" },
  { label: t("CUSTOM_TYPE_FLAG", "Argument"), data: "argument" },
];

export const createCustomOptionDraft = (id: string): CustomOptionDraft => ({
  id,
  label: "",
  kind: "environment",
  primary: "",
  value: "",
});

export const draftFromCustomOption = (option: CustomOption): CustomOptionDraft => {
  const definition = option.definition;
  if (definition.kind === "environment") {
    return {
      id: option.id,
      label: option.label,
      kind: definition.kind,
      primary: definition.name,
      value: definition.value,
    };
  }
  if (definition.kind === "prefix") {
    return {
      id: option.id,
      label: option.label,
      kind: definition.kind,
      primary: renderLiteralArgv(definition.argv),
      value: "",
    };
  }
  return {
    id: option.id,
    label: option.label,
    kind: definition.kind,
    primary: definition.token,
    value: definition.arity === 1 ? definition.argument : "",
  };
};

export const compileCustomOption = (draft: CustomOptionDraft): CustomOption | undefined => {
  const label = draft.label.trim();
  if (!label) return undefined;
  const definition =
    draft.kind === "environment"
      ? { kind: "environment" as const, name: draft.primary.trim(), value: draft.value }
      : draft.kind === "prefix"
        ? (() => {
            const argv = parseLiteralArgv(draft.primary.trim());
            return argv ? { kind: "prefix" as const, argv } : undefined;
          })()
        : draft.value.length === 0
          ? { kind: "argument" as const, arity: 0 as const, token: draft.primary.trim() }
          : { kind: "argument" as const, arity: 1 as const, token: draft.primary.trim(), argument: draft.value };
  if (!definition || validateLaunchOption(definition).length > 0) return undefined;
  return { id: draft.id, label, definition };
};

const rowStyle = { boxShadow: "none", display: "flex", justifyContent: "right", padding: "5px 0" } as const;
const inputStyle = { padding: "10px", fontSize: "14px", width: "435px" } as const;

export const CustomOptionForm: FC<{
  value: CustomOptionDraft;
  onChange: (value: CustomOptionDraft) => void;
}> = ({ value, onChange }) => (
  <>
    <Field label={t("CUSTOM_OPTION_LABEL", "Label")} padding="none" bottomSeparator="none">
      <Focusable style={rowStyle}>
        <TextField
          style={inputStyle}
          value={value.label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
        />
      </Focusable>
    </Field>
    <Field label={t("CUSTOM_OPTION_TYPE", "Type")} padding="none" bottomSeparator="none">
      <Focusable style={rowStyle}>
        <Dropdown
          rgOptions={optionTypes}
          selectedOption={value.kind}
          onChange={({ data: kind }) => {
            if (value.kind !== kind) onChange({ ...value, kind, primary: "", value: "" });
          }}
        />
      </Focusable>
    </Field>
    <Field label={t("CUSTOM_OPTION_FIELDS", "Definition")} padding="none" bottomSeparator="none">
      <Focusable style={rowStyle}>
        <TextField
          style={{
            ...inputStyle,
            width: value.kind === "environment" || value.kind === "argument" ? "200px" : "435px",
          }}
          value={value.primary}
          onChange={(event) => onChange({ ...value, primary: event.target.value })}
        />
        {(value.kind === "environment" || value.kind === "argument") && (
          <>
            <div style={{ display: "flex", alignItems: "center", margin: "3px" }}>
              <b>{value.kind === "environment" ? "=" : " "}</b>
            </div>
            <TextField
              style={{ ...inputStyle, width: "200px" }}
              value={value.value}
              onChange={(event) => onChange({ ...value, value: event.target.value })}
            />
          </>
        )}
      </Focusable>
    </Field>
  </>
);
