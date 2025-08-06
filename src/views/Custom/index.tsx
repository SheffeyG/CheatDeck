import {
  DialogButton,
  Focusable,
  ToggleField,
  showModal,
} from "@decky/ui";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { FC, useEffect, useState } from "react";
import { BsPencilFill } from "react-icons/bs";
import { MdAddBox } from "react-icons/md";

import { CustomOption, getCustomOptions } from "../../utils/custom";
import { ModalEdit } from "./ModalEdit";
import { ModalNew } from "./ModalNew";
import { Options } from "../../utils/options";
import logger from "../../utils/logger";
import { SaveWithPreview } from "../../components/SaveWithPreview";

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

  const updateOptList = (updatedOptList: CustomOption[]) => {
    setCusOptList(updatedOptList);
  };

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
          // eslint-disable-next-line react/jsx-key
          <Focusable className="CD_EntryContainer">
            <Focusable className="CD_ToggleContainer">
              <ToggleField
                bottomSeparator="none"
                label={<span className="CD_Label">{opt.label}</span>}
                checked={options.hasCustomParameter(opt.value, opt.position)}
                onChange={(enable: boolean) => {
                  setOptions(prevOptions => {
                    const updatedOptions = new Options(prevOptions.getOptionsString());
                    
                    if (enable) {
                      // Apply the custom parameter using smart parsing
                      updatedOptions.applyCustomParameter(opt.value, opt.position);
                    } else {
                      // Remove the custom parameter at the specific position
                      updatedOptions.removeCustomParameter(opt.value, opt.position);
                    }
                    
                    // Log the final state after modification
                    const finalOptionsString = updatedOptions.getOptionsString();
                    logger.info(`[Custom UI] Final options after toggle: "${finalOptionsString}"`);
                    
                    return updatedOptions;
                  });
                }}
              />
            </Focusable>
            <DialogButton
              className="CD_DialogButton"
              onClick={() => { showModal(<ModalEdit id={opt.id} optList={cusOptList} onSave={updateOptList} />, window); }}
            >
              <BsPencilFill className="CD_IconTranslate" />
            </DialogButton>
          </Focusable>
        ))
      )}

      <DialogButton
        className="CD_AddButton"
        onClick={() => { showModal(<ModalNew optList={cusOptList} onSave={updateOptList} />); }}
      >
        <MdAddBox />
      </DialogButton>
      {(cusOptList.length > 0) && (
        <SaveWithPreview options={options} appid={appid} />
      )}
    </>
  );
};

export default Custom;
