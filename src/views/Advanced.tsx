import {
  AppDetails,
  DialogButton,
  Focusable,
  ToastData,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"

// import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { Options } from "../utils/options";

const Advanced: VFC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(''));

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const savedOptions = new Options(detail.strLaunchOptions);
      setOptions(savedOptions);
    })
    setTimeout(() => { unregister() }, 1000);
  }, [])

  const saveOptions = () => {
    SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
    const toastData: ToastData = {
      title: "CheatDeck",
      body: "Save game settings suscess.",
      duration: 1500,
      playSound: true,
      showToast: true
    }
    Backend.serverAPI.toaster.toast(toastData);
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
            prevOptions.setOptionValue('RADV_PERFTEST', value);
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