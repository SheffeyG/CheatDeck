import { DialogButton } from "@decky/ui";
import type { CSSProperties, FC } from "react";
import type { IconType } from "react-icons";
import { BsPencilFill } from "react-icons/bs";
import { FaBarsProgress as TypeCmdIcon, FaKey as TypeEnvIcon, FaFlag as TypeFlagIcon } from "react-icons/fa6";

import type { LaunchOptionDefinition } from "../domain/options";
import type { CustomOption } from "../domain/settings";
import { Toggle } from "./Toggle";

const typeMap: Record<LaunchOptionDefinition["kind"], IconType> = {
  environment: TypeEnvIcon,
  prefix: TypeCmdIcon,
  argument: TypeFlagIcon,
};

const rowStyle = {
  alignItems: "center",
  display: "flex",
  gap: "4px",
  marginBottom: "4px",
  width: "100%",
} satisfies CSSProperties;

const titleStyle = {
  alignItems: "center",
  display: "flex",
  minWidth: 0,
} satisfies CSSProperties;

const typeIconStyle = {
  flex: "0 0 auto",
  marginRight: "6px",
} satisfies CSSProperties;

const labelStyle = {
  maxWidth: "300px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const editButtonStyle = {
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

const CustomOptionTitle: FC<{ label: string; type: LaunchOptionDefinition["kind"] }> = ({ label, type }) => {
  const TypeIcon = typeMap[type];
  return (
    <span style={titleStyle}>
      <TypeIcon style={typeIconStyle} />
      <span style={labelStyle}>{label}</span>
    </span>
  );
};

interface CustomOptionItemProps {
  option: CustomOption;
  checked: boolean;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
}

export const CustomOptionItem: FC<CustomOptionItemProps> = ({ option, checked, disabled, onToggle, onEdit }) => (
  <div style={rowStyle}>
    <Toggle
      label={<CustomOptionTitle label={option.label} type={option.definition.kind} />}
      disabled={disabled}
      checked={checked}
      compact={true}
      onChange={onToggle}
    />
    <DialogButton style={editButtonStyle} onClick={onEdit}>
      <BsPencilFill />
    </DialogButton>
  </div>
);
