import {
  AppDetails,
  DialogButton,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { FaSatellite, FaLanguage, FaFolder } from "react-icons/fa";

import logger from "../utils/logger"
import { Backend } from "../utils/backend";
// import { SettingsManager } from "../utils/settings";


const GameSettings: VFC<{ appid: number }> = ({ appid }) => {
  const [enableCheat, setEnableCheat] = useState(false);
  const [enableLang, setEnableLang] = useState(false);
  const [cheatPath, setCheatPath] = useState('');

  useEffect(() => {
    let savedOptions = 'test';
    SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      savedOptions = detail.strLaunchOptions;
      logger.info("saved: " + savedOptions);
      setEnableCheat(savedOptions.includes("PROTON_REMOTE_DEBUG_CMD="));
      setEnableLang(savedOptions.includes("LANG="));
      const match = savedOptions.match(/PROTON_REMOTE_DEBUG_CMD="([^"]*)"/);
      setCheatPath(match ? match[1] : '');
      // logger.info(`(${savedOptions}, ${enableCheat}, ${enableLang}, ${cheatPath})`)
    })
  }, []);

  const handleBrowse = async () => {
    const filePickerRes = await Backend.openFilePicker("/home/deck", ["exe"]);
    setCheatPath(filePickerRes.path);
  };

  const setOptions = () => {
    // build option commands
    let options = ''
    if (enableLang) {
      options += 'LANG=zh_CN.utf8 ';
    };
    if (enableCheat) {
      options += `PROTON_REMOTE_DEBUG_CMD="${cheatPath}" PRESSURE_VESSEL_FILESYSTEMS_RW="$STEAM_COMPAT_DATA_PATH/pfx/drive_c:${cheatPath.replace(/\/[^/]+$/, '')}" `;
    }
    if (enableLang || enableCheat) {
      options += `%command%`;
    }
    SteamClient.Apps.SetShortcutLaunchOptions(appid, options);
    logger.info(`set app ${appid} options:\n ${options}`);
  }

  return (

    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="Enable Cheat"
        icon={<FaSatellite />}
        bottomSeparator={"none"}
        checked={enableCheat}
        onChange={(value: boolean) => {
          setEnableCheat(value);
        }}
      />
      {enableCheat ?
        <Field
          key={1}
          label={"Cheat path"}
          padding={"none"}
        >
          <Focusable
            aria-label="Cheat Path:"
            style={{
              marginLeft: "auto",
              boxShadow: "none",
              display: "flex",
              justifyContent: "right",
              padding: "4px",
            }}
          >
            <TextField
              style={{
                padding: "10px",
                fontSize: "14px",
                width: "400px"
              }}
              disabled={true}
              value={cheatPath}
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
              <FaFolder />
            </DialogButton>
          </Focusable>
        </Field>
        : null}
      <ToggleField
        label="Enable Lang"
        icon={<FaLanguage />}
        checked={enableLang}
        onChange={(value: boolean) => {
          setEnableLang(value);
        }}
      />

      <DialogButton
        onClick={setOptions}
        style={{
          marginTop: "10px",
          padding: "10px",
          fontSize: "14px",
          textAlign: "center"
        }}
      >
        Save Settings
      </DialogButton>
    </Focusable>
  )
}

export default GameSettings