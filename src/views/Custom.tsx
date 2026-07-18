import { DialogButton, Focusable, showModal, ToggleField } from "@decky/ui";
import type { FC } from "react";
import type { IconType } from "react-icons";
import { BsPencilFill, BsPlusSquareFill } from "react-icons/bs";
import { FaBarsProgress as TypeCmdIcon, FaKey as TypeEnvIcon, FaFlag as TypeFlagIcon } from "react-icons/fa6";

import { LaunchOptionsPreview } from "../components";
import type { CustomLaunchOptionDefinition } from "../domain/options";
import type { CustomOption } from "../domain/settings";
import { useOptions, useSettings } from "../hooks";
import { AddCustomOption, EditCustomOption } from "../modals";

const Custom: FC = () => {
  // Launch options from current game details
  const { options, editable, applyEdit } = useOptions();
  // Custom options from users' plugin settings
  const { customOptions, saveCustomOptions } = useSettings();

  const CusOptTitle: FC<{ label: string; type: CustomLaunchOptionDefinition["kind"] }> = ({ label, type }) => {
    const typeMap: Record<CustomLaunchOptionDefinition["kind"], IconType> = {
      environment: TypeEnvIcon,
      prefix: TypeCmdIcon,
      argument: TypeFlagIcon,
    };
    const TypeIcon = typeMap[type];
    return (
      <>
        <TypeIcon className="CheatDeckTypeIcon" />
        <span className="CheatDeckLabel">{label}</span>
      </>
    );
  };

  return (
    <>
      <style>
        {`
          /* Styles from plugin CSSLoader */
          .CheatDeckToggleContainer {
            flex-grow: 1;
            position: relative;
          }
          /* The actual element of the ToggleContainer with the BG */
          .CheatDeckToggleContainer > div {
            background: rgba(255,255,255,.15);
            border-radius: 2px;
            padding-left: 5px;
            padding-right: 5px;
            margin-left: 0;
            margin-right: 0;
            height: 1.25em !important;
          }
          /* Adjust the text and ToggleSwitch */
          .CheatDeckToggleContainer > div > div > div {
            transform: translate(0, -1px);
          }
          .CheatDeckEntryContainer {
            display: flex;
            gap: 0.25em;
            height: auto;
            align-items: center;
            position: relative;
            justify-content: space-between;
            margin-bottom: 0.25em;
          }
          .CheatDeckEditButton {
            width: fit-content !important;
            min-width: fit-content !important;
            height: fit-content !important;
            padding: 10px 12px !important;
          }
          .CheatDeckEditIcon {
            transform: translate(0px, 2px);
          }
          .CheatDeckTypeIcon {
            padding-left: 8px;
          }
          .CheatDeckLabel {
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: 5px;
          }
          .CheatDeckAddButton {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 1.5em !important;
          }
        `}
      </style>
      {customOptions.length > 0 &&
        customOptions.map((opt: CustomOption) => (
          <Focusable className="CheatDeckEntryContainer" key={opt.id}>
            <Focusable className="CheatDeckToggleContainer">
              <ToggleField
                bottomSeparator="none"
                label={<CusOptTitle label={opt.label} type={opt.definition.kind} />}
                disabled={!editable}
                checked={options.isEnabled(opt.definition)}
                onChange={(enable: boolean) => applyEdit(options.setEnabled(opt.definition, enable))}
              />
            </Focusable>
            <DialogButton
              className="CheatDeckEditButton"
              onClick={() => {
                showModal(
                  <EditCustomOption
                    option={opt}
                    onUpdate={(updatedOption) => {
                      const result = options.replaceDefinition(opt.definition, updatedOption.definition);
                      if (result.ok && applyEdit(result)) {
                        void saveCustomOptions(
                          customOptions.map((option) => (option.id === opt.id ? updatedOption : option)),
                        );
                        return true;
                      }
                      return false;
                    }}
                    onDelete={(id) => {
                      if (!editable) {
                        void saveCustomOptions(customOptions.filter((option) => option.id !== id));
                        return true;
                      }
                      const result = options.setEnabled(opt.definition, false);
                      if (result.ok && applyEdit(result)) {
                        void saveCustomOptions(customOptions.filter((option) => option.id !== id));
                        return true;
                      }
                      return false;
                    }}
                  />,
                  window,
                );
              }}
            >
              <BsPencilFill className="CheatDeckEditIcon" />
            </DialogButton>
          </Focusable>
        ))}

      <DialogButton
        className="CheatDeckAddButton"
        onClick={() => {
          showModal(<AddCustomOption onAdd={(option) => saveCustomOptions([...customOptions, option])} />, window);
        }}
      >
        <BsPlusSquareFill />
      </DialogButton>

      {customOptions.length > 0 && <LaunchOptionsPreview />}
    </>
  );
};

export default Custom;
