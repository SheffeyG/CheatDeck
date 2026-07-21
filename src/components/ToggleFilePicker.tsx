import { DialogButton, Field, Focusable, TextField, ToggleField } from "@decky/ui";
import { type CSSProperties, type FC, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
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
}

// Browse button + inter-element gap, used to subtract from the measured row
// width when computing the path field's width. With box-sizing: border-box
// the field's padding is already included in its width, so it's not
// subtracted here.
const BROWSE_BUTTON_WIDTH = 40;
const ROW_GAP = 8;

const rowStyle = {
  display: "flex",
  width: "100%",
  gap: `${ROW_GAP}px`,
} satisfies CSSProperties;

const browseButtonStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  flex: "0 0 auto",
  minWidth: "auto",
  width: `${BROWSE_BUTTON_WIDTH}px`,
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
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [pathWidth, setPathWidth] = useState<number | undefined>(undefined);

  // Measure the row's actual pixel width and reserve the remaining space
  // (after the browse button + gap + the field's own horizontal padding) for
  // the path field. This sidesteps Steam's Field internals clamping the child
  // container, which prevented pure flex/width:100% from filling.
  const measure = () => {
    const row = rowRef.current;
    if (!row) return;
    const rowWidth = row.clientWidth;
    const available = rowWidth - BROWSE_BUTTON_WIDTH - ROW_GAP;
    setPathWidth(available > 0 ? available : undefined);
  };

  useLayoutEffect(() => {
    if (!checked) return;
    measure();
  }, [checked]);

  useEffect(() => {
    if (!checked) return;
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [checked]);

  const pathStyle = {
    fontSize: "14px",
    padding: "10px",
    width: pathWidth !== undefined ? `${pathWidth}px` : "100%",
    minWidth: 0,
    boxSizing: "border-box",
  } satisfies CSSProperties;

  return (
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
        <Field padding="standard" bottomSeparator="standard" childrenLayout="below">
          <Focusable style={rowStyle} ref={rowRef}>
            <TextField style={pathStyle} disabled={true} value={value} />
            <DialogButton disabled={disabled} onClick={onBrowse} style={browseButtonStyle}>
              <FaFolderOpen />
            </DialogButton>
          </Focusable>
        </Field>
      )}
    </>
  );
};
