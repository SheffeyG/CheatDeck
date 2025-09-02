import {
  Dropdown,
  DropdownOption,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "@decky/ui";
import { FC, ReactNode } from "react";

import { t } from "../utils";

interface ToggleDropdownProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  fieldLabel?: string;
  value: string | undefined;
  onInput: (value: string) => void;
  preset: DropdownOption[];
}

export const ToggleDropdown: FC<ToggleDropdownProps> = ({
  label,
  description,
  icon,
  checked,
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
      bottomSeparator={checked ? "none" : "standard"}
      onChange={onToggle}
    />
    {checked && (
      <Field
        label={fieldLabel}
        padding="none"
        bottomSeparator="standard"
      >
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
            onChange={(e) => {
              e.persist();
              onInput(e.target.value);
            }}
          />
          <Dropdown
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
