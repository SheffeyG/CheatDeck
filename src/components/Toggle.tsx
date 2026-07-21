import { ToggleField } from "@decky/ui";
import type { CSSProperties, FC, ReactNode } from "react";

interface ToggleProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  /** When true the toggle is part of an inline row (e.g. with an edit button
   * next to it): no bottom separator and flex sizing so siblings can sit
   * beside it. */
  compact?: boolean;
  onChange: (checked: boolean) => void;
}

const inlineStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
} satisfies CSSProperties;

// SteamOS-style toggle row. Renders the native ToggleField directly so it
// shares the same margin/padding/bottom-separator rhythm as the refactored
// Field-based rows (ToggleFilePicker, LaunchOptionsPreview). The compact form
// keeps flex sizing for inline use (e.g. CustomOptionItem's toggle + edit
// button).
export const Toggle: FC<ToggleProps> = ({ label, description, checked, disabled, compact, onChange }) => {
  const field = (
    <ToggleField
      label={label}
      description={description}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      bottomSeparator={compact ? "none" : "standard"}
      highlightOnFocus
    />
  );

  return compact ? <div style={inlineStyle}>{field}</div> : field;
};
