import { type CSSProperties, type FC, type ReactNode, useState } from "react";

interface ToggleProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  compact?: boolean;
  onChange: (checked: boolean) => void;
}

const buttonStyle = {
  appearance: "none",
  background: "transparent",
  border: 0,
  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: "1 1 auto",
  gap: "16px",
  minWidth: 0,
  padding: "10px 16px",
  textAlign: "left",
  width: "100%",
} satisfies CSSProperties;

const textStyle = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: "3px",
  minWidth: 0,
} satisfies CSSProperties;

const labelStyle = {
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "18px",
} satisfies CSSProperties;

const descriptionStyle = {
  color: "#b8c2cc",
  fontSize: "11px",
  lineHeight: "15px",
} satisfies CSSProperties;

const trackStyle = {
  border: "1px solid rgba(255, 255, 255, 0.22)",
  borderRadius: "12px",
  boxSizing: "border-box",
  flex: "0 0 42px",
  height: "24px",
  padding: "2px",
  transition: "background-color 120ms ease",
  width: "42px",
} satisfies CSSProperties;

const thumbStyle = {
  background: "#fff",
  borderRadius: "50%",
  display: "block",
  height: "18px",
  transition: "transform 120ms ease",
  width: "18px",
} satisfies CSSProperties;

export const Toggle: FC<ToggleProps> = ({ label, description, checked, disabled, compact, onChange }) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const highlighted = !disabled && (hovered || focused);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...buttonStyle,
        background: highlighted ? "rgba(255, 255, 255, 0.08)" : "transparent",
        cursor: disabled ? "default" : "pointer",
        minHeight: compact ? "40px" : "64px",
        opacity: disabled ? 0.45 : 1,
        outline: focused ? "2px solid rgba(255, 255, 255, 0.8)" : "none",
        outlineOffset: "-2px",
        padding: compact ? "6px 8px" : buttonStyle.padding,
      }}
    >
      <span style={textStyle}>
        <span style={labelStyle}>{label}</span>
        {description && <span style={descriptionStyle}>{description}</span>}
      </span>
      <span style={{ ...trackStyle, background: checked ? "#1a9fff" : "#596775" }} aria-hidden="true">
        <span style={{ ...thumbStyle, transform: checked ? "translateX(18px)" : "translateX(0)" }} />
      </span>
    </button>
  );
};
