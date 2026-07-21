import { Focusable, showModal } from "@decky/ui";
import type { FC } from "react";

import { AddOptionButton, CustomOptionItem, LaunchOptionsPreview } from "../components";
import type { CustomOption } from "../domain/settings";
import { useOptions, useSettings } from "../hooks";
import { AddCustomOption, EditCustomOption } from "../modals";

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
      {customOptions.length > 0 && <LaunchOptionsPreview />}

      <div style={{ marginTop: "4px" }}>
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
      </div>

      <div style={{ margin: "4px 0" }}>
        <AddOptionButton
          onClick={() => {
            showModal(<AddCustomOption onAdd={(option) => saveCustomOptions([...customOptions, option])} />, window);
          }}
        />
      </div>
    </Focusable>
  );
};

export default Custom;
