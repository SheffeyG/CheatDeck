import {
  AppDetails,
  DialogButton,
  Focusable,
  ToggleField,
  showModal,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { BsGearFill } from "react-icons/bs";

import { Backend } from "../../utils/Backend";
import { Options } from "../../utils/Options";
import { CustomOption, getCustomOptions, setCustomOptions } from "../../utils/Custom";
import { SettingModal } from "./SettingModal";
import logger from "../../utils/Logger";


const Custom: VFC<{ appid: number }> = ({ appid }) => {
  const [optList, setOptList] = useState<CustomOption[]>([]);
  const [options, setOptions] = useState<Options>(new Options(""));
  const [isSteam, setIsSteam] = useState<boolean>(true);

  useEffect(() => {
    getCustomOptions().then((result) => {
      setOptList(result as CustomOption[]);
    });
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
      if (optionsString.match("heroicgameslauncher") || optionsString.match("Emulation")) {
        setIsSteam(false);
      }
    })
    setTimeout(() => { unregister() }, 1000);
  }, []);

  const updateOptList = (updatedOpt: CustomOption) => {
    logger.info(`saving changes ${JSON.stringify(updatedOpt)}`);
    setOptList((optList) =>
      optList.map((opt) => (opt.id === updatedOpt.id) ? updatedOpt : opt)
    );
  };


  const saveOptions = async () => {
    if (isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
      Backend.sendNotice("Custom settings saved.");
    } else {
      // non steam games is not implemented
      Backend.sendNotice("Warning: This is not a steam game! settings will not be saved.");
    }
    await setCustomOptions(optList);
  }


  return (
    <>
      <style>
        {`
          /* From plugin CSSLoader */
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
          /* Since we manually force the height of the container, we have to adjust the text and ToggleSwitch */
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
        `}
      </style>
      {(optList.length > 0) ? (
        optList.map((opt: CustomOption) => (
          <Focusable className="CD_EntryContainer">
            <Focusable
              className="CD_ToggleContainer"
            >
              <ToggleField
                bottomSeparator="none"
                label={<span className="CD_Label">{opt.label}</span>}
                checked={options.hasField(opt.field)}
                onChange={(enable: boolean) => {
                  const updatedOptions = new Options(options.getOptionsString());
                  updatedOptions.setFieldValue(opt.field, enable ? opt.value : '');
                  setOptions(updatedOptions);
                }}
              />
            </Focusable>
            <DialogButton
              className="CD_DialogButton"
              onClick={() => {showModal(<SettingModal opt={opt} onSave={updateOptList}/>, window)}}
            >
              <BsGearFill className="CD_IconTranslate" />
            </DialogButton>
          </Focusable>
        ))
      ) : (
        <span>No options</span>
      )}

      <DialogButton
        onClick={saveOptions}
        style={{
          alignSelf: "center",
          marginTop: "20px",
          padding: "10px",
          fontSize: "14px",
          textAlign: "center",
          width: "80%"
        }}
      >
        Save Settings
      </DialogButton>
    </>
  )
}

export default Custom;