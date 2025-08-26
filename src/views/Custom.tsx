import { DialogButton, Focusable, showModal, ToggleField } from "@decky/ui";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { FC, useEffect, useState } from "react";
import { BsPencilFill, BsPlusSquareFill } from "react-icons/bs";
import {
  FaBarsProgress as TypeCmdIcon,
  FaFlag as TypeFlagIcon,
  FaKey as TypeEnvIcon,
} from "react-icons/fa6";

import { CustomOptionEdit } from "../components/CustomOptionEdit";
import { CustomOptionNew } from "../components/CustomOptionNew";
import { SaveWithPreview } from "../components/SaveWithPreview";
import { CustomOption, getCustomOptions } from "../utils/backend";
import { Options } from "../utils/options";

const Custom: FC<{ appid: number }> = ({ appid }) => {
  // Custom Options from user's saved settings
  const [cusOptList, setCusOptList] = useState<CustomOption[]>([]);
  // Launch Options from current game
  const [options, setOptions] = useState<Options>(new Options(""));

  useEffect(() => {
    getCustomOptions().then((result) => {
      setCusOptList(result as CustomOption[]);
    });
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
    });
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

  return (
    <>
      <style>
        {`
          /* Style From plugin CSSLoader */
          .CD_ToggleContainer {
            flex-grow: 1;
            position: relative;
          }
          /* The actual element of the ToggleContainer with the BG */
          .CD_ToggleContainer > div {
            background: rgba(255,255,255,.15);
            border-radius: 2px;
            padding-left: 5px;
            padding-right: 5px;
            margin-left: 0;
            margin-right: 0;
            height: 1.25em !important;
          }
          /* Adjust the text and ToggleSwitch */
          .CD_ToggleContainer > div > div > div {
            transform: translate(0, -1px);
          }
          .CD_EntryContainer {
            display: flex;
            gap: 0.25em;
            height: auto;
            align-items: center;
            position: relative;
            justify-content: space-between;
            margin-bottom: 0.25em;
          }
          .CD_DialogButton {
            width: fit-content !important;
            min-width: fit-content !important;
            height: fit-content !important;
            padding: 10px 12px !important;
          }
          .CD_IconTranslate {
            transform: translate(0px, 2px);
          }
          .CD_TypeIcon {
            padding-left: 8px;
          }
          .CD_Label {
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: 5px;
          }
          .CD_AddButton {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 1.5em !important;
          }
        `}
      </style>
      {(cusOptList.length > 0) && (
        cusOptList.map((opt: CustomOption) => (
          <Focusable className="CD_EntryContainer" key={opt.id}>
            <Focusable className="CD_ToggleContainer">
              <ToggleField
                bottomSeparator="none"
                label={(
                  <>
                    {opt.type === "env" && <TypeEnvIcon className="CD_TypeIcon" />}
                    {opt.type === "pre_cmd" && <TypeCmdIcon className="CD_TypeIcon" />}
                    {opt.type === "flag_args" && <TypeFlagIcon className="CD_TypeIcon" />}
                    <span className="CD_Label">{opt.label}</span>
                  </>
                )}
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
              className="CD_DialogButton"
              onClick={() => {
                showModal(
                  <CustomOptionEdit id={opt.id} optList={cusOptList} onSave={opts => setCusOptList(opts)} />,
                  window,
                );
              }}
            >
              <BsPencilFill className="CD_IconTranslate" />
            </DialogButton>
          </Focusable>
        ))
      )}

      <DialogButton
        className="CD_AddButton"
        onClick={() => {
          showModal(
            <CustomOptionNew optList={cusOptList} onSave={opts => setCusOptList(opts)} />,
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
