import {
  AppDetails,
  DialogButton,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"

// import logger from "../utils/logger"
import { Backend } from "../utils/Backend";
import { Options } from "../utils/Options";
import { FaFolderOpen } from "react-icons/fa";

const Advanced: VFC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(""));
  const [isSteam, setIsSteam] = useState(true);
  const [showPrefix, setShowPrefix] = useState(false);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setShowPrefix(savedOptions.hasField('STEAM_COMPAT_DATA_PATH'));
      setOptions(savedOptions);
      if (optionsString.match("heroicgameslauncher") || optionsString.match("Emulation")) {
        setIsSteam(false);
      }
    })
    setTimeout(() => { unregister() }, 1000);
  }, [])

  const handleBrowse = async () => {
    const prefixDir = options.getFieldValue('STEAM_COMPAT_DATA_PATH');
    const defaultDir = prefixDir ? prefixDir : "/home/deck";
    const filePickerRes = await Backend.openFilePicker(defaultDir, false);
    const prefixPath = filePickerRes.path;
    const newOptions = new Options(options.getOptionsString());
    newOptions.setFieldValue('STEAM_COMPAT_DATA_PATH', `"${prefixPath}"`);
    setOptions(newOptions);
  };

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
        description="Enable shaders pre-calculate for ProtonGE below 7-45"
        bottomSeparator={"standard"}
        checked={options.hasField("DXVK_ASYNC")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          updatedOptions.setFieldValue('DXVK_ASYNC', enable ? '1' : '');
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="RADV_PERFTEST"
        description="Enable shaders pre-calculate for ProtonGE above 7-45"
        bottomSeparator={"standard"}
        checked={options.hasField("RADV_PERFTEST")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          updatedOptions.setFieldValue('RADV_PERFTEST', enable ? 'gpl' : '');
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="Shared Prefix"
        description='Specify a folder as the prefix for the game (include saved game)'
        bottomSeparator={"none"}
        checked={showPrefix}
        onChange={(enable: boolean) => {
          setShowPrefix(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.setFieldValue('STEAM_COMPAT_DATA_PATH', '');
            setOptions(updatedOptions);
          }
        }}
      />
      {showPrefix && (<Field
        key={1}
        label={"Prefix folder"}
        padding={"none"}
        bottomSeparator="thick"
      >
        <Focusable
          style={{
            boxShadow: "none",
            display: "flex",
            justifyContent: "right",
            padding: "10px 0",
          }}
        >
          <TextField
            style={{
              padding: "10px",
              fontSize: "14px",
              width: "400px",
            }}
            disabled={true}
            value={options.getFieldValue('STEAM_COMPAT_DATA_PATH')}
          />
          <DialogButton
            onClick={handleBrowse}
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
        </Focusable>
      </Field>)}

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