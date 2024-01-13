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
  const [options, setOptions] = useState(new Options(''));
  const [isSteam, setIsSteam] = useState(true);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
      if (optionsString.match('heroicgameslauncher') || optionsString.match('Emulation')) {
        setIsSteam(false);
      }
    })
    setTimeout(() => { unregister() }, 1000);
  }, [])

  const saveOptions = () => {
    if (isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
      Backend.sendNotice("Normal settings saved.");
    } else {
      // heroic games luncher not implemented
      Backend.sendNotice("Warning: This is not a steam game! settings will not be saved.");
    }
  }


  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="DXVK-ASYNC"
        description='Enable shaders pre-calculate for non-steam games using ProtonGE'
        bottomSeparator={"standard"}
        checked={options.hasOption('DXVK_ASYNC')}
        onChange={(enable: boolean) => {
          setOptions((prevOptions) => {
            const value = enable ? '1' : '';
            prevOptions.setOptionValue('DXVK_ASYNC', value);
            return prevOptions;
          });
        }}
      />

      <ToggleField
        label="RADV-PERFTEST"
        description='Enable RADV_PERFTEST to gpl for non-steam games using ProtonGE'
        bottomSeparator={"standard"}
        checked={options.hasOption('RADV_PERFTEST')}
        onChange={(enable: boolean) => {
          setOptions((prevOptions) => {
            const value = enable ? 'gpl' : '';
            prevOptions.setOptionValue('RADV_PERFTEST', `"${value}"`);
            return prevOptions;
          });
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