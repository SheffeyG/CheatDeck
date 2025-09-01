import { DialogButton, Focusable, showModal, ToggleField } from "@decky/ui";
import { FC } from "react";
import { IconType } from "react-icons";
import { BsPencilFill, BsPlusSquareFill } from "react-icons/bs";
import {
  FaBarsProgress as TypeCmdIcon,
  FaFlag as TypeFlagIcon,
  FaKey as TypeEnvIcon,
} from "react-icons/fa6";

import { SaveWithPreview } from "../components/SaveWithPreview";
import { useOptions } from "../hooks/useOptions";
import { useSettings } from "../hooks/useSettings";
import { AddCustomOption } from "../modals/AddCustomOption";
import { EditCustomOption } from "../modals/EditCustomOption";
import { Options } from "../utils/options";

const Custom: FC<{ appid: number }> = ({ appid }) => {
  // Launch options from current game details
  const { options, setOptions } = useOptions();
  // Custom options from users' plugin settings
  const { customOptions, setCustomOptions } = useSettings();

  const CusOptTitle: FC<{ label: string; type: OptionType }> = ({ label, type }) => {
    const typeMap: Record<OptionType, IconType> = {
      env: TypeEnvIcon,
      pre_cmd: TypeCmdIcon,
      flag_args: TypeFlagIcon,
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
      {(customOptions.length > 0) && (
        customOptions.map((opt: CustomOption) => (
          <Focusable className="CheatDeckEntryContainer" key={opt.id}>
            <Focusable className="CheatDeckToggleContainer">
              <ToggleField
                bottomSeparator="none"
                label={<CusOptTitle label={opt.label} type={opt.type} />}
                checked={opt.value ? options.hasKeyValue(opt.key, opt.value) : options.hasKey(opt.key)}
                onChange={(enable: boolean) => {
                  const updatedOptions = new Options(options.getOptionsString());

                  if (enable) {
                    updatedOptions.setParameter({
                      type: opt.type,
                      key: opt.key,
                      ...(opt.value !== undefined ? { value: opt.value } : {}),
                    });
                  } else {
                    if (opt.type === "pre_cmd") {
                      updatedOptions.removeParamByType("pre_cmd");
                    } else {
                      updatedOptions.removeParamByKey(opt.key);
                    }
                  }

                  setOptions(updatedOptions);
                }}
              />
            </Focusable>
            <DialogButton
              className="CheatDeckEditButton"
              onClick={() => {
                showModal(
                  <EditCustomOption
                    id={opt.id}
                    optList={customOptions}
                    onSave={opts => setCustomOptions(opts)}
                  />,
                  window,
                );
              }}
            >
              <BsPencilFill className="CheatDeckEditIcon" />
            </DialogButton>
          </Focusable>
        ))
      )}

      <DialogButton
        className="CheatDeckAddButton"
        onClick={() => {
          showModal(
            <AddCustomOption
              optList={customOptions}
              onSave={opts => setCustomOptions(opts)}
            />,
            window,
          );
        }}
      >
        <BsPlusSquareFill />
      </DialogButton>

      {customOptions.length > 0 && <SaveWithPreview options={options} appid={appid} />}

    </>
  );
};

export default Custom;
