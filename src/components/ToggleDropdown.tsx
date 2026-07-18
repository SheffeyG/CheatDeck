import { Dropdown, Field, Focusable, TextField, ToggleField } from "@decky/ui";
import type { FC, ReactNode } from "react";

import { t } from "../utils/translate";

export interface DropdownPreset {
  label: ReactNode;
  data: unknown;
}

interface ToggleDropdownProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  fieldLabel?: string;
  value: string | undefined;
  onInput: (value: string) => void;
  preset: DropdownPreset[];
}

export const ToggleDropdown: FC<ToggleDropdownProps> = ({
  label,
  description,
  icon,
  checked,
  disabled,
  onToggle,
  fieldLabel,
  value,
  onInput,
  preset,
}) => (
  <>
    <ToggleField
      label={label}
      description={description}
      icon={icon}
      checked={checked}
      disabled={disabled}
      bottomSeparator={checked ? "none" : "standard"}
      onChange={onToggle}
    />
    {checked && (
      <Field label={fieldLabel} padding="none" bottomSeparator="standard">
        <Focusable
          style={{
            boxShadow: "none",
            display: "flex",
            justifyContent: "right",
            padding: "10px 0",
          }}
        >
          <TextField
            style={{
              padding: "10px",
              fontSize: "14px",
              width: "200px",
              marginRight: ".5em",
            }}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              e.persist();
              onInput(e.target.value);
            }}
          />
          <Dropdown
            disabled={disabled}
            rgOptions={preset}
            selectedOption={preset[0]}
            onChange={(v) => {
              onInput(v.data);
            }}
            strDefaultLabel={t("NORMAL_LANG_DEFAULT", "Default")}
          />
        </Focusable>
      </Field>
    )}
  </>
);
