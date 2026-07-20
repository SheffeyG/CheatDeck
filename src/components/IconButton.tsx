import { DialogButton } from "@decky/ui";
import type { CSSProperties, FC, ReactNode } from "react";

interface IconButtonProps {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

const buttonStyle = {
  alignItems: "center",
  display: "flex",
  flex: "0 0 40px",
  height: "40px",
  justifyContent: "center",
  maxWidth: "40px",
  minWidth: "40px",
  padding: 0,
  width: "40px",
} satisfies CSSProperties;

export const IconButton: FC<IconButtonProps> = ({ label, children, disabled, onClick }) => (
  <DialogButton
    {...{ "aria-label": label, title: label }}
    style={buttonStyle}
    disabled={disabled}
    focusable={!disabled}
    onClick={onClick}
  >
    {children}
  </DialogButton>
);
