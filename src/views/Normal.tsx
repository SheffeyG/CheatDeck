import {
  Dropdown,
  DropdownOption,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "@decky/ui";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { FC, useEffect, useState } from "react";
import { FaGamepad, FaLanguage } from "react-icons/fa";

import { SaveWithPreview } from "../components/SaveWithPreview";
import { ToggleFilePicker } from "../components/ToggleFilePicker";
import { LangCodes } from "../data/default.json";
import { Backend } from "../utils/backend";
import { Options } from "../utils/options";
import t from "../utils/translate";

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
      setShowChat(savedOptions.hasKey("PROTON_REMOTE_DEBUG_CMD"));
      setShowLang(savedOptions.hasKey("LANG"));
    });
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

  const handleBrowse = async () => {
    const savedCheatDir = options.getKeyValue("PRESSURE_VESSEL_FILESYSTEMS_RW");
    const defaultPath = savedCheatDir ?? await Backend.getEnv("DECKY_USER_HOME");
    const filePickerRes = await Backend.openFilePicker(defaultPath, true, ["exe", "bat"]);
    const selectedCheatPath = filePickerRes.path;
    const selectedCheatDir = selectedCheatPath.replace(/\/[^/]+$/, "");

    const newOptions = new Options(options.getOptionsString());
    newOptions.setParameter({
      type: "env",
      key: "PROTON_REMOTE_DEBUG_CMD",
      value: `'${selectedCheatPath}'`, // single quotes to avoid issues with spaces
    });
    // Make sure proton has read/write access to the parent directory
    newOptions.setParameter({
      type: "env",
      key: "PRESSURE_VESSEL_FILESYSTEMS_RW",
      value: selectedCheatDir,
    });
    setOptions(newOptions);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleFilePicker
        label={t("NORMAL_CHEAT_TOGGLE_LABEL", "Enable Cheat")}
        description={t(
          "NORMAL_CHEAT_TOGGLE_DESC",
          "Select the cheat or trainer exe file from storage",
        )}
        icon={<FaGamepad />}
        checked={showCheat}
        onToggle={(enable: boolean) => {
          setShowChat(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.removeParamByKey("PROTON_REMOTE_DEBUG_CMD");
            updatedOptions.removeParamByKey("PRESSURE_VESSEL_FILESYSTEMS_RW");
            setOptions(updatedOptions);
          }
        }}
        value={options.getKeyValue("PROTON_REMOTE_DEBUG_CMD")?.replace(/^'|'$/g, "")}
        onBrowse={handleBrowse}
        fieldLabel={t("NORMAL_CHEAT_LABEL", "EXE Path")}
      />

      <ToggleField
        label={t("NORMAL_LANG_TOGGLE_LABEL", "Language")}
        description={t("NORMAL_LANG_TOGGLE_DESC", "Try to specify the game language")}
        icon={<FaLanguage />}
        checked={showLang}
        bottomSeparator={showLang ? "none" : "standard"}
        onChange={(enable: boolean) => {
          setShowLang(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.removeParamByKey("LANG");
            setOptions(updatedOptions);
          }
        }}
      />
      {showLang && (
        <Field
          label={t("NORMAL_LANG_LABEL", "Language Code")}
          padding="none"
          bottomSeparator="standard"
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
              value={options.getKeyValue("LANG")}
              onChange={(e) => {
                e.persist();
                const updatedOptions = new Options(options.getOptionsString());
                updatedOptions.setParameter({ type: "env", key: "LANG", value: e.target.value });
                setOptions(updatedOptions);
              }}
            />
            <Dropdown
              rgOptions={defaultLangCodes}
              selectedOption={defaultLangCodes[0]}
              onChange={(v) => {
                // logger.info(`selected: ${JSON.stringify(v)}`);
                const updatedOptions = new Options(options.getOptionsString());
                updatedOptions.setParameter({ type: "env", key: "LANG", value: v.data });
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
