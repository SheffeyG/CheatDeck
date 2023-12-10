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
import { FaSatellite, FaLanguage, FaFolder } from "react-icons/fa";

import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { defaultGameSettings, defaultLangCodes } from "../utils/settings";


const GameSettings: VFC<{ appid: number }> = ({ appid }) => {
  const [gameSettings, setGameSettings] = useState(defaultGameSettings)

  useEffect(() => {
    let savedOptions = '';
    SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      savedOptions = detail.strLaunchOptions;
      const matchCheat = savedOptions.match(/PROTON_REMOTE_DEBUG_CMD="([^"]*)"/);
      const matchLang = savedOptions.match(/LANG="([^"]*)"/);
      // logger.info("saved: " + savedOptions);
      const updatedGameSettings = {
        ...gameSettings,
        enableCheat: savedOptions.includes("PROTON_REMOTE_DEBUG_CMD"),
        enableLang: savedOptions.includes("LANG"),
        cheatPath: matchCheat ? matchCheat[1] : '',
        langCode: matchLang ? matchLang[1] : '',
      }
      setGameSettings(updatedGameSettings);
    })
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
    if (gameSettings.enableCheat) {
      options += `PROTON_REMOTE_DEBUG_CMD="${gameSettings.cheatPath}" PRESSURE_VESSEL_FILESYSTEMS_RW="$STEAM_COMPAT_DATA_PATH/pfx/drive_c:${gameSettings.cheatPath.replace(/\/[^/]+$/, '')}" `;
    }
    if (gameSettings.enableLang || gameSettings.enableCheat) {
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
        description="Don't forget to enable developer mode in steam system settings"
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
            padding: "10px",
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
            <FaFolder />
          </DialogButton>
        </Focusable>
      </Field> : null}

      <ToggleField
        label="Language"
        description="If the game language is correct then you don't need this"
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
            padding: "10px",
          }}
        >
          <TextField
            style={{
              padding: "10px",
              fontSize: "14px",
              width: "200px",
              marginRight: "2px"
            }}
            value={gameSettings.langCode}
            onChange={(e) => {
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