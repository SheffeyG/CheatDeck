import {
  AppDetails,
  DialogButton,
  Dropdown,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { FaGamepad, FaLanguage, FaFolderOpen } from "react-icons/fa";

// import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { Options } from "../utils/options";
import { defaultLangCodes } from "../utils/default";

const Normal: VFC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(''));
  const [showCheat, setShowChat] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [isSteam, setIsSteam] = useState(true);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
      setShowChat(savedOptions.hasOption('PROTON_REMOTE_DEBUG_CMD'));
      setShowLang(savedOptions.hasOption('LANG'));
      if (optionsString.match('heroicgameslauncher') || optionsString.match('Emulation')) {
        setIsSteam(false);
      }
    })
    setTimeout(() => { unregister() }, 1000);
  }, [])

  const handleBrowse = async () => {
    const filePickerRes = await Backend.openFilePicker("/home/deck", ["exe", "EXE"]);
    const cheatPath = filePickerRes.path;
    const newOptions = new Options(options.getOptionsString());
    newOptions.setOptionValue('PROTON_REMOTE_DEBUG_CMD', `"${cheatPath}"`);
    setOptions(newOptions);
  };

  const saveOptions = () => {
    if (isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, options.getOptionsString());
      Backend.sendNotice("Normal settings saved.");
    } else {
      // non steam games is not implemented
      Backend.sendNotice("Warning: This is not a steam game! settings will not be saved.");
    }
  }


  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="Enable Cheat"
        description='Select the cheat or trainer exe file from storage'
        icon={<FaGamepad />}
        bottomSeparator={"none"}
        checked={showCheat}
        onChange={(enable: boolean) => {
          setShowChat(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.setOptionValue('PROTON_REMOTE_DEBUG_CMD', '');
            setOptions(updatedOptions);
          }
        }}
      />
      {showCheat && (<Field
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
            value={options.getOptionValue('PROTON_REMOTE_DEBUG_CMD')}
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
            updatedOptions.setOptionValue('LANG', '');
            setOptions(updatedOptions);
          }
        }}
      />
      {showLang && (<Field
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
            value={options.getOptionValue('LANG')}
            onChange={(e) => {
              e.persist();
              const updatedOptions = new Options(options.getOptionsString());
              updatedOptions.setOptionValue('LANG', `"${e.target.value}"`);
              setOptions(updatedOptions);
            }}
          />
          <Dropdown
            rgOptions={defaultLangCodes}
            selectedOption={defaultLangCodes[0]}
            onChange={(v) => {
              // logger.info(`selected: ${JSON.stringify(v)}`);
              const updatedOptions = new Options(options.getOptionsString());
              updatedOptions.setOptionValue('LANG', `"${v.data}"`);
              setOptions(updatedOptions);
            }}
            strDefaultLabel="Default"
          />
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

export default Normal