import { DialogButton, Focusable, ToggleField } from "@decky/ui";
import { type CSSProperties, type FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { BsPencilFill } from "react-icons/bs";
import { FaBarsProgress as TypeCmdIcon, FaKey as TypeEnvIcon, FaFlag as TypeFlagIcon } from "react-icons/fa6";

import type { LaunchOptionDefinition } from "../domain/options";
import type { CustomOption } from "../domain/settings";

const typeMap: Record<LaunchOptionDefinition["kind"], IconType> = {
  environment: TypeEnvIcon,
  prefix: TypeCmdIcon,
  argument: TypeFlagIcon,
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
  display: "flex",
  width: "100%",
  alignItems: "center",
  gap: "4px",
  margin: "4px 0",
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
  const [buttonSize, setButtonSize] = useState<number>(40);

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

  const editButtonStyle = {
    alignItems: "center",
    display: "flex",
    flex: "0 0 auto",
    height: `${buttonSize}px`,
    justifyContent: "center",
    maxWidth: `${buttonSize}px`,
    minWidth: `${buttonSize}px`,
    padding: 0,
    width: `${buttonSize}px`,
  } satisfies CSSProperties;

  return (
    <Focusable style={rowStyle}>
      <div ref={toggleRef} style={toggleWrapperStyle}>
        <ToggleField
          label={
            <span style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              <TypeIcon style={{ flex: "0 0 auto", marginRight: "6px" }} />
              <span
                style={{
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {option.label}
              </span>
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
