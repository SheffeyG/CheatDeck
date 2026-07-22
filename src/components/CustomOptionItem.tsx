import { DialogButton, Focusable, ToggleField } from "@decky/ui";
import { type CSSProperties, type FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { BsPencilFill } from "react-icons/bs";
import { FaBarsProgress, FaFlag, FaKey } from "react-icons/fa6";

import type { LaunchOptionDefinition } from "../domain/options";
import type { CustomOption } from "../domain/settings";

const typeMap: Record<LaunchOptionDefinition["kind"], IconType> = {
  environment: FaKey,
  prefix: FaBarsProgress,
  argument: FaFlag,
};

const toggleWrapperStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
} satisfies CSSProperties;

// SteamOS settings row: ToggleField renders the native label+switch row
// (switch right-aligned within its own width), the edit button sits beside
// it on the far right. The button's size is matched to the toggle's measured
// rendered height so both share the same footprint.
const rowStyle = {
  alignItems: "center",
  display: "flex",
  gap: "4px",
  width: "100%",
} satisfies CSSProperties;

const titleStyle = {
  alignItems: "center",
  display: "flex",
  minWidth: 0,
} satisfies CSSProperties;

const typeIconStyle = {
  flex: "0 0 auto",
  marginRight: "8px",
} satisfies CSSProperties;

const labelStyle = {
  maxWidth: "300px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const editButtonBaseStyle = {
  alignItems: "center",
  display: "flex",
  flex: "0 0 auto",
  justifyContent: "center",
  padding: 0,
} satisfies CSSProperties;

export interface CustomOptionItemProps {
  option: CustomOption;
  checked: boolean;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
}

export const CustomOptionItem: FC<CustomOptionItemProps> = ({ option, checked, disabled, onToggle, onEdit }) => {
  const TypeIcon = typeMap[option.definition.kind];
  const toggleRef = useRef<HTMLDivElement>(null);
  const [buttonSize, setButtonSize] = useState<number>(42);

  // Measure the ToggleField's rendered height and set the edit button to match
  // (square), so both controls share the same footprint.
  const measure = () => {
    const el = toggleRef.current;
    if (!el) return;
    const height = el.clientHeight;
    if (height > 0) setButtonSize(height);
  };

  useLayoutEffect(measure, []);
  useEffect(() => {
    const el = toggleRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const buttonSizeValue = `${buttonSize}px`;
  const editButtonStyle = {
    ...editButtonBaseStyle,
    height: buttonSizeValue,
    maxWidth: buttonSizeValue,
    minWidth: buttonSizeValue,
    width: buttonSizeValue,
  } satisfies CSSProperties;

  return (
    <Focusable style={rowStyle}>
      <div ref={toggleRef} style={toggleWrapperStyle}>
        <ToggleField
          label={
            <span style={titleStyle}>
              <TypeIcon style={typeIconStyle} />
              <span style={labelStyle}>{option.label}</span>
            </span>
          }
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          bottomSeparator="none"
          highlightOnFocus
        />
      </div>
      <DialogButton style={editButtonStyle} onClick={onEdit} disabled={disabled}>
        <BsPencilFill />
      </DialogButton>
    </Focusable>
  );
};
