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
import { CustomOption, getCustomOptions } from "../../utils/Settings";
import { CusOptSettingsModal } from "./profile";


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

  const saveOptions = () => {
    if (isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
      Backend.sendNotice("Custom settings saved.");
    } else {
      // non steam games is not implemented
      Backend.sendNotice("Warning: This is not a steam game! settings will not be saved.");
    }
  }


  return (
    <>
      <style>
        {`
          /* Remove side padding on the PanelSections */
          .CSSLoader_PanelSection_NoPadding_Parent > .quickaccesscontrols_PanelSection_2C0g0 {
            padding-left: 0;
            padding-right: 0;
          }
          .CSSLoader_FullTheme_ToggleContainer {
            flex-grow: 1;
            position: relative;
          }
          /* The actual element of the ToggleContainer with the BG */
          .CSSLoader_FullTheme_ToggleContainer > div {
            background: rgba(255,255,255,.15);
            border-radius: 2px;
            padding-left: 5px;
            padding-right: 5px;
            margin-left: 0;
            margin-right: 0;
            height: 1.25em !important;
          }
          /* Since we manually force the height of the container, we have to adjust the text and ToggleSwitch */
          .CSSLoader_FullTheme_ToggleContainer > div > div > div {
            transform: translate(0, -1px);
          }
          .CSSLoader_FullTheme_EntryContainer {
            display: flex;
            gap: 0.25em;
            height: auto;
            align-items: center;
            position: relative;
            justify-content: space-between;
            margin-bottom: 0.25em;
          }
          .CSSLoader_FullTheme_DialogButton {
            width: fit-content !important;
            min-width: fit-content !important;
            height: fit-content !important;
            padding: 10px 12px !important;
          }
          .CSSLoader_FullTheme_IconTranslate {
            transform: translate(0px, 2px);
          }
          .CSSLoader_FullTheme_ThemeLabel {
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
          <Focusable className="CSSLoader_FullTheme_EntryContainer">
            <Focusable
              className="CSSLoader_FullTheme_ToggleContainer"
            >
              <ToggleField
                bottomSeparator="none"
                label={<span className="CSSLoader_FullTheme_ThemeLabel">{opt.label}</span>}
                checked={options.hasField(opt.field)}
                onChange={(enable: boolean) => {
                  const updatedOptions = new Options(options.getOptionsString());
                  updatedOptions.setFieldValue(opt.field, enable ? opt.value : '');
                  setOptions(updatedOptions);
                }}
              />
            </Focusable>
            <DialogButton
              className="CSSLoader_FullTheme_DialogButton"
              onClick={() => {
                showModal(CusOptSettingsModal(opt));
              }}
            >
              <BsGearFill className="CSSLoader_FullTheme_IconTranslate" />
            </DialogButton>
          </Focusable>

          /* <div style={{ display: "flex", flexDirection: "row" }}>
            <Focusable style={{ flex: "1" }}>
              <ToggleField
                label={opt.label}
                description={opt.desc}
                bottomSeparator={"standard"}
                checked={options.hasField(opt.field)}
                onChange={(enable: boolean) => {
                  const updatedOptions = new Options(options.getOptionsString());
                  updatedOptions.setFieldValue(opt.field, enable ? opt.value : '');
                  setOptions(updatedOptions);
                }}
              />
            </Focusable>
            <DialogButton
              onClick={() =>
                setSettingVisible((prevVisibility) => ({
                  ...prevVisibility,
                  [opt.field]: !prevVisibility[opt.field],
                }))
              }
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                maxWidth: "40px",
                minWidth: "auto",
                marginLeft: ".5em",
              }}
            >
              <FaFolderOpen />
            </DialogButton>
            {settingVisible[opt.field] && <div>Bingo</div>}
          </div> */
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