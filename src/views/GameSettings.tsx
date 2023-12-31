import {
  AppDetails,
  DialogButton,
  Dropdown,
  Field,
  Focusable,
  TextField,
  ToastData,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { FaSatellite, FaLanguage, FaFolderOpen, FaRocket } from "react-icons/fa";

import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { defaultGameSettings, defaultLangCodes } from "../utils/settings";


const GameSettings: VFC<{ appid: number }> = ({ appid }) => {
  const [gameSettings, setGameSettings] = useState(defaultGameSettings)

  useEffect(() => {
    let savedOptions = '';
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      savedOptions = detail.strLaunchOptions;
      const matchCheat = savedOptions.match(/PROTON_REMOTE_DEBUG_CMD="([^"]*)"/);
      const matchLang = savedOptions.match(/LANG="([^"]*)"/);
      // logger.info("saved: " + savedOptions);
      const updatedGameSettings = {
        ...gameSettings,
        enableCheat: savedOptions.includes("PROTON_REMOTE_DEBUG_CMD"),
        enableLang: savedOptions.includes("LANG"),
        enableDxvk: savedOptions.includes("DXVK_ASYNC=1 RADV_PERFTEST=gpl"),
        cheatPath: matchCheat ? matchCheat[1].replace(/\\ /g, ' ') : '',
        langCode: matchLang ? matchLang[1] : '',
      }
      setGameSettings(updatedGameSettings);
    })
    setTimeout(() => { unregister() }, 1000);
  }, []);

  const handleBrowse = async () => {
    const filePickerRes = await Backend.openFilePicker("/home/deck", ["exe"]);
    const updatedGameSettings = { ...gameSettings };
    updatedGameSettings.cheatPath = filePickerRes.path;
    setGameSettings(updatedGameSettings);
  };

  const setOptions = () => {
    // build option commands
    let options = ''
    if (gameSettings.enableLang) {
      options += `LANG="${gameSettings.langCode}" `;
    };
    if (gameSettings.enableDxvk) {
      options += `DXVK_ASYNC=1 RADV_PERFTEST=gpl `;
    };
    if (gameSettings.enableCheat) {
      options += `PROTON_REMOTE_DEBUG_CMD="${gameSettings.cheatPath.replace(/ /g, '\\ ')}" `
      options += `PRESSURE_VESSEL_FILESYSTEMS_RW="$STEAM_COMPAT_DATA_PATH/pfx/drive_c:${gameSettings.cheatPath.replace(/\/[^/]+$/, '').replace(/ /g, '\\ ')}" `;
    }
    if (options.length > 0) {
      options += `%command%`;
    }
    SteamClient.Apps.SetAppLaunchOptions(appid, options);
    logger.info(`set app ${appid} options:\n ${options}`);

    const toastData: ToastData = {
      title: "CheatDeck",
      body: "Save game settings suscess.",
      duration: 1500,
      playSound: true,
      showToast: true
    }
    Backend.serverAPI.toaster.toast(toastData)
  }

  return (

    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="Enable Cheat"
        description='Please make sure the file or folder name does not contain slashes or double quotes'
        icon={<FaSatellite />}
        bottomSeparator={"none"}
        checked={gameSettings.enableCheat}
        onChange={(value: boolean) => {
          const updatedGameSettings = { ...gameSettings };
          updatedGameSettings.enableCheat = value;
          setGameSettings(updatedGameSettings);
        }}
      />
      {gameSettings.enableCheat ? <Field
        key={1}
        label={"Cheat path"}
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
            value={gameSettings.cheatPath}
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
      </Field> : null}

      <ToggleField
        label="Language"
        description="Try to specify the game language"
        icon={<FaLanguage />}
        checked={gameSettings.enableLang}
        bottomSeparator="none"
        onChange={(value: boolean) => {
          const updatedGameSettings = { ...gameSettings };
          updatedGameSettings.enableLang = value;
          setGameSettings(updatedGameSettings);
        }}
      />
      {gameSettings.enableLang ? <Field
        label="Language code"
        padding="none"
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
              width: "200px",
              marginRight: ".5em"
            }}
            value={gameSettings.langCode}
            onChange={(e) => {
              e.persist();
              setGameSettings((prevSettings) => ({
                ...prevSettings,
                langCode: e.target.value,
              }));
            }}
          />
          <Dropdown
            rgOptions={defaultLangCodes}
            selectedOption={defaultLangCodes[0]}
            onChange={(v) => {
              logger.info(`selected: ${JSON.stringify(v)}`);
              setGameSettings((prevSettings) => ({
                ...prevSettings,
                langCode: v.data,
              }));
            }}
            strDefaultLabel="Default"
          />
        </Focusable>
      </Field> : null}

      <ToggleField
        label="DXVK-ASYNC"
        description='Enable shaders pre-calculate for non-steam games using ProtonGE'
        icon={<FaRocket />}
        bottomSeparator={"none"}
        checked={gameSettings.enableDxvk}
        onChange={(value: boolean) => {
          const updatedGameSettings = { ...gameSettings };
          updatedGameSettings.enableDxvk = value;
          setGameSettings(updatedGameSettings);
        }}
      />

      <DialogButton
        onClick={setOptions}
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

export default GameSettings