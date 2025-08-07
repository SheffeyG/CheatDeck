import {
  DialogButton,
  Dropdown,
  DropdownOption,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "@decky/ui";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { FC, useEffect, useMemo, useState } from "react";
import { FaGamepad, FaLanguage, FaFolderOpen } from "react-icons/fa";

// import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { escapeString, unescapeString, Options } from "../utils/options";
import { LangCodes } from "../data/default.json";
import t from "../utils/translate";
import { SaveWithPreview } from "../components/SaveWithPreview";

const Normal: FC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(""));
  const [showCheat, setShowChat] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const defaultLangCodes: DropdownOption[] = LangCodes;

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setOptions(savedOptions);
      setShowChat(savedOptions.hasField("PROTON_REMOTE_DEBUG_CMD"));
      setShowLang(savedOptions.hasField("LANG"));
    });
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

  const handleBrowse = async () => {
    const cheatDir = options.getFieldValue("PRESSURE_VESSEL_FILESYSTEMS_RW");
    const defaultDir = cheatDir ?? await Backend.getEnv("DECKY_USER_HOME");
    const filePickerRes = await Backend.openFilePicker(defaultDir, true, ["exe", "bat"]);
    const cheatPath = filePickerRes.path;
    const cheatFolder = cheatPath.replace(/\/[^/]+$/, "");
    const newOptions = new Options(options.getOptionsString());
    newOptions.setFieldValue("PROTON_REMOTE_DEBUG_CMD", escapeString(cheatPath));
    // Make sure the parent directory is set for filesystem access
    newOptions.setFieldValue("PRESSURE_VESSEL_FILESYSTEMS_RW", escapeString(cheatFolder));
    setOptions(newOptions);
  };

  const showedCheatPath = useMemo(() => {
    const savedPath = options.getFieldValue("PROTON_REMOTE_DEBUG_CMD") ?? "";
    return unescapeString(savedPath);
  }, [options]);

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label={t("NORMAL_CHEAT_TOGGLE_LABEL", "Enable Cheat")}
        description={t("NORMAL_CHEAT_TOGGLE_DESC", "Select the cheat or trainer exe file from storage")}
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
          label={t("NORMAL_CHEAT_LABEL", "EXE Path")}
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
              value={showedCheatPath}
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
        label={t("NORMAL_LANG_TOGGLE_LABEL", "Language")}
        description={t("NORMAL_LANG_TOGGLE_DESC", "Try to specify the game language")}
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
          label={t("NORMAL_LANG_LABEL", "Language Code")}
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
                updatedOptions.setFieldValue("LANG", e.target.value);
                setOptions(updatedOptions);
              }}
            />
            <Dropdown
              rgOptions={defaultLangCodes}
              selectedOption={defaultLangCodes[0]}
              onChange={(v) => {
                // logger.info(`selected: ${JSON.stringify(v)}`);
                const updatedOptions = new Options(options.getOptionsString());
                updatedOptions.setFieldValue("LANG", v.data);
                setOptions(updatedOptions);
              }}
              strDefaultLabel={t("NORMAL_LANG_DEFAULT", "Default")}
            />
          </Focusable>
        </Field>
      )}

      <SaveWithPreview options={options} appid={appid} />
    </Focusable>
  );
};

export default Normal;
