import {
  AppDetails,
  DialogButton,
  Focusable,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"

// import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { Options } from "../utils/options";

const Advanced: VFC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(""));
  const [isSteam, setIsSteam] = useState(true);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
      if (optionsString.match("heroicgameslauncher") || optionsString.match("Emulation")) {
        setIsSteam(false);
      }
    })
    setTimeout(() => { unregister() }, 1000);
  }, [])

  const saveOptions = () => {
    if (isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
      Backend.sendNotice("Advanced settings saved.");
    } else {
      // non steam games is not implemented
      Backend.sendNotice("Warning: This is not a steam game! settings will not be saved.");
    }
  }


  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="DXVK_ASYNC"
        description="Enable shaders pre-calculate for games using ProtonGE"
        bottomSeparator={"standard"}
        checked={options.hasOption("DXVK_ASYNC")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          updatedOptions.setOptionValue('DXVK_ASYNC', enable ? '1' : '');
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="RADV_PERFTEST"
        description="Enable RADV_PERFTEST to gpl for games using ProtonGE"
        bottomSeparator={"standard"}
        checked={options.hasOption("RADV_PERFTEST")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          updatedOptions.setOptionValue('RADV_PERFTEST', enable ? 'gpl' : '');
          setOptions(updatedOptions);
        }}
      />

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

export default Advanced