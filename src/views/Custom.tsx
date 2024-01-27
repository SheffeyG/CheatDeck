import {
  AppDetails,
  DialogButton,
  Focusable,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"

import { Backend } from "../utils/Backend";
import { Options } from "../utils/Options";
import { CustomOption, getCustomOptions } from "../utils/Settings";


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
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      {(optList.length > 0) ? (
        optList.map((opt: CustomOption) => (
          <ToggleField
            label={opt.lable}
            description={opt.desc}
            bottomSeparator={"standard"}
            checked={options.hasField(opt.field)}
            onChange={(enable: boolean) => {
              const updatedOptions = new Options(options.getOptionsString());
              updatedOptions.setFieldValue(opt.field, enable ? opt.value : '');
              setOptions(updatedOptions);
            }}
          />
        ))
      ) : (
        <p>No options</p>
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
    </Focusable>
  )
}

export default Custom;