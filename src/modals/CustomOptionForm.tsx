import { Field, Focusable, TextField } from "@decky/ui";
import type { FC } from "react";

import { parseLaunchOptionDefinition, renderLaunchOptionDefinition } from "../domain/options";
import type { CustomOption } from "../domain/settings";
import { t } from "../utils/translate";

export interface CustomOptionDraft {
  id: string;
  label: string;
  source: string;
}

export const createCustomOptionDraft = (id: string): CustomOptionDraft => ({
  id,
  label: "",
  source: "",
});

export const draftFromCustomOption = (option: CustomOption): CustomOptionDraft => ({
  id: option.id,
  label: option.label,
  source: renderLaunchOptionDefinition(option.definition),
});

export const compileCustomOption = (draft: CustomOptionDraft): CustomOption | undefined => {
  const label = draft.label.trim();
  if (!label) return undefined;
  const definition = parseLaunchOptionDefinition(draft.source);
  if (!definition) return undefined;
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
    <Field label={t("CUSTOM_OPTION_DEFINITION", "Definition")} padding="none" bottomSeparator="none">
      <Focusable style={rowStyle}>
        <TextField
          style={inputStyle}
          value={value.source}
          onChange={(event) => onChange({ ...value, source: event.target.value })}
        />
      </Focusable>
    </Field>
  </>
);
