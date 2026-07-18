import { type CSSProperties, type FC, type ReactNode, useState } from "react";

interface IconButtonProps {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

const baseStyle = {
  appearance: "none",
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  borderRadius: "2px",
  color: "inherit",
  display: "inline-flex",
  flex: "0 0 40px",
  height: "40px",
  justifyContent: "center",
  padding: 0,
  width: "40px",
} satisfies CSSProperties;

export const IconButton: FC<IconButtonProps> = ({ label, children, disabled, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...baseStyle,
        background: !disabled && (hovered || focused) ? "rgba(255, 255, 255, 0.24)" : baseStyle.background,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        outline: focused ? "2px solid rgba(255, 255, 255, 0.85)" : "none",
        outlineOffset: "-2px",
      }}
    >
      {children}
    </button>
  );
};
