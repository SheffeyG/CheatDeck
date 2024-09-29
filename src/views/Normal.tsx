import {
  AppDetails,
  DialogButton,
  Dropdown,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "@decky/ui";
import { FC, useEffect, useState } from "react";
import { FaGamepad, FaLanguage, FaFolderOpen } from "react-icons/fa";

// import logger from "../utils/logger"
import { Backend } from "../utils/Backend";
import { Options } from "../utils/Options";
import { defaultLangCodes } from "../utils/Default";

const Normal: FC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(""));
  const [showCheat, setShowChat] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [isSteam, setIsSteam] = useState(true);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
      setShowChat(savedOptions.hasField("PROTON_REMOTE_DEBUG_CMD"));
      setShowLang(savedOptions.hasField("LANG"));
      if (optionsString.match("heroicgameslauncher") || optionsString.match("Emulation")) {
        setIsSteam(false);
      }
    });
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

  const handleBrowse = async () => {
    const cheatDir = options.getFieldValue("PRESSURE_VESSEL_FILESYSTEMS_RW");
    const defaultDir = cheatDir ? cheatDir : await Backend.getEnv("DECKY_USER_HOME");
    const filePickerRes = await Backend.openFilePicker(defaultDir, true, ["exe", "bat"]);
    const cheatPath = filePickerRes.path;
    const newOptions = new Options(options.getOptionsString());
    newOptions.setFieldValue("PROTON_REMOTE_DEBUG_CMD", `"${cheatPath}"`);
    newOptions.setFieldValue("PRESSURE_VESSEL_FILESYSTEMS_RW", `"${cheatPath.replace(/\/[^/]+$/, "")}"`);
    setOptions(newOptions);
  };

  const saveOptions = () => {
    if (isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
      Backend.sendNotice("Normal settings saved.");
    }
    else {
      // non steam games is not implemented
      Backend.sendNotice("Warning: This is not a steam game! settings will not be saved.");
    }
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="Enable Cheat"
        description="Select the cheat or trainer exe file from storage"
        icon={<FaGamepad />}
        bottomSeparator="none"
        checked={showCheat}
        onChange={(enable: boolean) => {
          setShowChat(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.setFieldValue("PROTON_REMOTE_DEBUG_CMD", "");
            updatedOptions.setFieldValue("PRESSURE_VESSEL_FILESYSTEMS_RW", "");
            setOptions(updatedOptions);
          }
        }}
      />
      {showCheat && (
        <Field
          key={1}
          label="Cheat path"
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
                width: "400px",
              }}
              disabled={true}
              value={options.getFieldValue("PROTON_REMOTE_DEBUG_CMD")}
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
        </Field>
      )}

      <ToggleField
        label="Language"
        description="Try to specify the game language"
        icon={<FaLanguage />}
        checked={showLang}
        bottomSeparator="none"
        onChange={(enable: boolean) => {
          setShowLang(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.setFieldValue("LANG", "");
            setOptions(updatedOptions);
          }
        }}
      />
      {showLang && (
        <Field
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
                marginRight: ".5em",
              }}
              value={options.getFieldValue("LANG")}
              onChange={(e) => {
                e.persist();
                const updatedOptions = new Options(options.getOptionsString());
                updatedOptions.setFieldValue("LANG", `"${e.target.value}"`);
                setOptions(updatedOptions);
              }}
            />
            <Dropdown
              rgOptions={defaultLangCodes}
              selectedOption={defaultLangCodes[0]}
              onChange={(v) => {
                // logger.info(`selected: ${JSON.stringify(v)}`);
                const updatedOptions = new Options(options.getOptionsString());
                updatedOptions.setFieldValue("LANG", `"${v.data}"`);
                setOptions(updatedOptions);
              }}
              strDefaultLabel="Default"
            />
          </Focusable>
        </Field>
      )}

      <DialogButton
        onClick={saveOptions}
        style={{
          alignSelf: "center",
          marginTop: "20px",
          padding: "10px",
          fontSize: "14px",
          textAlign: "center",
          width: "80%",
        }}
      >
        Save Settings
      </DialogButton>
    </Focusable>
  );
};

export default Normal;
