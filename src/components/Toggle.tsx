import { ToggleField } from "@decky/ui";
import type { CSSProperties, FC, ReactNode } from "react";

interface ToggleProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  compact?: boolean;
  onChange: (checked: boolean) => void;
}

const containerStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
} satisfies CSSProperties;

export const Toggle: FC<ToggleProps> = ({ label, description, checked, disabled, compact, onChange }) => (
  <div style={containerStyle}>
    <ToggleField
      label={label}
      description={description}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      bottomSeparator={compact ? "none" : "standard"}
      highlightOnFocus={true}
    />
  </div>
);
