import { Dropdown, Field, Focusable, ToggleField } from "@decky/ui";
import type { CSSProperties, FC, ReactNode } from "react";

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

// decky's `Dropdown` resolves the displayed label by matching
// `rgOptions[i].data === selectedOption`, so `selectedOption` must be the raw
// `data` scalar (not the option object). When `value` is unset the Dropdown
// falls back to `strDefaultLabel`.
const rowStyle = {
  boxShadow: "none",
  display: "flex",
  justifyContent: "right",
  minWidth: "240px",
  maxWidth: "50%",
  padding: "0",
} satisfies CSSProperties;

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
}) => {
  return (
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
        <Focusable style={{ boxShadow: "none", marginTop: "-4px" }}>
          <Field label={fieldLabel} padding="standard" bottomSeparator="standard" childrenContainerWidth="min">
            <Focusable style={rowStyle}>
              <Dropdown
                disabled={disabled}
                rgOptions={preset}
                selectedOption={value}
                strDefaultLabel={t("NORMAL_LANG_DEFAULT")}
                onChange={(option) => onInput(option.data)}
              />
            </Focusable>
          </Field>
        </Focusable>
      )}
    </>
  );
};
