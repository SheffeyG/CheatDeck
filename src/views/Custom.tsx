import { Focusable, showModal } from "@decky/ui";
import type { CSSProperties, FC } from "react";
import type { IconType } from "react-icons";
import { BsPencilFill, BsPlusSquareFill } from "react-icons/bs";
import { FaBarsProgress as TypeCmdIcon, FaKey as TypeEnvIcon, FaFlag as TypeFlagIcon } from "react-icons/fa6";

import { IconButton, LaunchOptionsPreview, Toggle } from "../components";
import type { CustomLaunchOptionDefinition } from "../domain/options";
import type { CustomOption } from "../domain/settings";
import { useOptions, useSettings } from "../hooks";
import { AddCustomOption, EditCustomOption } from "../modals";
import { t } from "../utils/translate";

const typeMap: Record<CustomLaunchOptionDefinition["kind"], IconType> = {
  environment: TypeEnvIcon,
  prefix: TypeCmdIcon,
  argument: TypeFlagIcon,
};

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

const addButtonStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "4px",
} satisfies CSSProperties;

const rowStyle = {
  alignItems: "center",
  display: "flex",
  gap: "4px",
  marginBottom: "4px",
  width: "100%",
} satisfies CSSProperties;

const CustomOptionTitle: FC<{ label: string; type: CustomLaunchOptionDefinition["kind"] }> = ({ label, type }) => {
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

const CustomOptionItem: FC<CustomOptionItemProps> = ({ option, checked, disabled, onToggle, onEdit }) => (
  <div style={rowStyle}>
    <Toggle
      label={<CustomOptionTitle label={option.label} type={option.definition.kind} />}
      disabled={disabled}
      checked={checked}
      compact={true}
      onChange={onToggle}
    />
    <IconButton label={t("CUSTOM_EDIT_TITLE", "Edit Option")} onClick={onEdit}>
      <BsPencilFill />
    </IconButton>
  </div>
);

const Custom: FC = () => {
  // Launch options from current game details
  const { options, editable, applyEdit } = useOptions();
  // Custom options from users' plugin settings
  const { customOptions, saveCustomOptions } = useSettings();

  const updateOption = (option: CustomOption, updatedOption: CustomOption) => {
    const result = options.replaceDefinition(option.definition, updatedOption.definition);
    if (!result.ok || !applyEdit(result)) return false;

    void saveCustomOptions(customOptions.map((current) => (current.id === option.id ? updatedOption : current)));
    return true;
  };

  const deleteOption = (option: CustomOption, id: string) => {
    if (!editable) {
      void saveCustomOptions(customOptions.filter((current) => current.id !== id));
      return true;
    }

    const result = options.setEnabled(option.definition, false);
    if (!result.ok || !applyEdit(result)) return false;

    void saveCustomOptions(customOptions.filter((current) => current.id !== id));
    return true;
  };

  const openEditModal = (option: CustomOption) => {
    showModal(
      <EditCustomOption
        option={option}
        onUpdate={(updatedOption) => updateOption(option, updatedOption)}
        onDelete={(id) => deleteOption(option, id)}
      />,
      window,
    );
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      {customOptions.map((option) => (
        <CustomOptionItem
          key={option.id}
          option={option}
          disabled={!editable}
          checked={options.isEnabled(option.definition)}
          onToggle={(enabled) => applyEdit(options.setEnabled(option.definition, enabled))}
          onEdit={() => openEditModal(option)}
        />
      ))}

      <div style={addButtonStyle}>
        <IconButton
          label={t("CUSTOM_NEW_TITLE", "Add a New Option")}
          onClick={() => {
            showModal(<AddCustomOption onAdd={(option) => saveCustomOptions([...customOptions, option])} />, window);
          }}
        >
          <BsPlusSquareFill />
        </IconButton>
      </div>

      {customOptions.length > 0 && <LaunchOptionsPreview />}
    </Focusable>
  );
};

export default Custom;
