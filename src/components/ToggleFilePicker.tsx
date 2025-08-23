import { DialogButton, Field, Focusable, TextField, ToggleField } from "@decky/ui";
import { FC, ReactNode } from "react";
import { FaFolderOpen } from "react-icons/fa";

interface ToggleFilePickerProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  value: string | undefined;
  onBrowse: () => void;
  fieldLabel?: string;
}

export const ToggleFilePicker: FC<ToggleFilePickerProps> = ({
  label,
  description,
  icon,
  checked,
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
      onChange={onToggle}
    />
    {checked && (
      <Field
        label={fieldLabel}
        padding="none"
        bottomSeparator="thick"
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
              width: "400px",
            }}
            disabled={true}
            value={value}
          />
          <DialogButton
            onClick={onBrowse}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
              maxWidth: "40px",
              minWidth: "auto",
              marginLeft: ".5em",
            }}
          >
            <FaFolderOpen />
          </DialogButton>
        </Focusable>
      </Field>
    )}
  </>
);
