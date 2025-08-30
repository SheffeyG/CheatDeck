import { DialogButton, Focusable, showModal, ToggleField } from "@decky/ui";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { FC, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { BsPencilFill, BsPlusSquareFill } from "react-icons/bs";
import {
  FaBarsProgress as TypeCmdIcon,
  FaFlag as TypeFlagIcon,
  FaKey as TypeEnvIcon,
} from "react-icons/fa6";

import { SaveWithPreview } from "../components/SaveWithPreview";
import { AddCustomOption } from "../modals/AddCustomOption";
import { EditCustomOption } from "../modals/EditCustomOption";
import { getCustomOptions } from "../utils/backend";
import { Options } from "../utils/options";

const Custom: FC<{ appid: number }> = ({ appid }) => {
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

  // Load custom options from users' plugin settings
  const [cusOptList, setCusOptList] = useState<CustomOption[]>([]);
  useEffect(() => {
    getCustomOptions().then((result) => {
      setCusOptList(result as CustomOption[]);
    });
  }, []);

  // Get launch options from current game details
  const [options, setOptions] = useState<Options>(new Options(""));
  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(
      appid,
      (detail: AppDetails) => {
        const savedOptions = new Options(detail.strLaunchOptions);
        setOptions(savedOptions);
      },
    );
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

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
      {(cusOptList.length > 0) && (
        cusOptList.map((opt: CustomOption) => (
          <Focusable className="CheatDeckEntryContainer" key={opt.id}>
            <Focusable className="CheatDeckToggleContainer">
              <ToggleField
                bottomSeparator="none"
                label={<CusOptTitle label={opt.label} type={opt.type} />}
                checked={opt.value ? options.hasKeyValue(opt.key, opt.value) : options.hasKey(opt.key)}
                onChange={(enable: boolean) => {
                  setOptions((prevOptions) => {
                    const updatedOptions = new Options(prevOptions.getOptionsString());

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

                    return updatedOptions;
                  });
                }}
              />
            </Focusable>
            <DialogButton
              className="CheatDeckEditButton"
              onClick={() => {
                showModal(
                  <EditCustomOption id={opt.id} optList={cusOptList} onSave={opts => setCusOptList(opts)} />,
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
            <AddCustomOption optList={cusOptList} onSave={opts => setCusOptList(opts)} />,
            window,
          );
        }}
      >
        <BsPlusSquareFill />
      </DialogButton>

      {cusOptList.length > 0 && <SaveWithPreview options={options} appid={appid} />}

    </>
  );
};

export default Custom;
