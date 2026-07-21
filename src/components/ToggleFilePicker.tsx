import { DialogButton, Field, Focusable, TextField, ToggleField } from "@decky/ui";
import type { CSSProperties, FC, ReactNode } from "react";
import { FaFolderOpen } from "react-icons/fa";

interface ToggleFilePickerProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  value: string | undefined;
  onBrowse: () => void;
  fieldLabel?: string;
}

const rowStyle = {
  boxShadow: "none",
  display: "flex",
  justifyContent: "right",
  padding: "10px 0",
} satisfies CSSProperties;

const inputStyle = {
  fontSize: "14px",
  padding: "10px",
  width: "400px",
} satisfies CSSProperties;

const browseButtonStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  marginLeft: ".5em",
  maxWidth: "40px",
  minWidth: "auto",
  padding: "10px",
} satisfies CSSProperties;

export const ToggleFilePicker: FC<ToggleFilePickerProps> = ({
  label,
  description,
  icon,
  checked,
  disabled,
  onToggle,
  value,
  onBrowse,
  fieldLabel,
}) => (
  <>
    <ToggleField
      label={label}
      description={description}
      icon={icon}
      checked={checked}
      disabled={disabled}
      onChange={onToggle}
      bottomSeparator={checked ? "none" : "standard"}
    />
    {checked && (
      <Field label={fieldLabel} padding="none" bottomSeparator="standard">
        <Focusable style={rowStyle}>
          <TextField style={inputStyle} disabled={true} value={value} />
          <DialogButton disabled={disabled} onClick={onBrowse} style={browseButtonStyle}>
            <FaFolderOpen />
          </DialogButton>
        </Focusable>
      </Field>
    )}
  </>
);
