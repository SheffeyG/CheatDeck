import { DropdownOption, Focusable } from "@decky/ui";
import { FC, useState } from "react";
import { FaGamepad, FaLanguage } from "react-icons/fa";

import { SaveWithPreview, ToggleDropdown, ToggleFilePicker } from "../components";
import { LangCodes } from "../data/langcode.json";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath, Options, t } from "../utils";

const Normal: FC = () => {
  const { options, setOptions } = useOptions();
  const [showCheat, setShowChat] = useState(options.hasKey("PROTON_REMOTE_DEBUG_CMD"));
  const [showLang, setShowLang] = useState(options.hasKey("LANG") || options.hasKey("HOST_LC_ALL"));

  const optionsString = options.getOptionsString();

  const handleBrowse = async () => {
    const savedPath = options.getKeyValue("PRESSURE_VESSEL_FILESYSTEMS_RW")?.replace(/^"|"$/g, "");
    const defaultPath = savedPath ?? await getHomePath();
    const filePickerRes = await browseFiles(defaultPath, true, ["exe", "bat"]);
    const selectedCheatPath = filePickerRes.path.replace(/(['"])/g, "\\$1"); // Escape quotes
    const selectedCheatDir = selectedCheatPath.replace(/\/[^/]+$/, ""); // Get parent directory

    const newOptions = new Options(optionsString);
    newOptions.setOption({
      type: "env",
      key: "PROTON_REMOTE_DEBUG_CMD",
      value: `"'${selectedCheatPath}'"`, // Quote twice to adjust Proton's shlex.split parser
    });
    // Make sure proton has read/write access to the parent directory
    newOptions.setOption({
      type: "env",
      key: "PRESSURE_VESSEL_FILESYSTEMS_RW",
      value: `"${selectedCheatDir}"`,
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
            const updatedOptions = new Options(optionsString);
            updatedOptions.removeOptionByKey("PROTON_REMOTE_DEBUG_CMD");
            updatedOptions.removeOptionByKey("PRESSURE_VESSEL_FILESYSTEMS_RW");
            setOptions(updatedOptions);
          }
        }}
        value={options.getKeyValue("PROTON_REMOTE_DEBUG_CMD")?.replace(/^"'|\\|'"$/g, "")}
        onBrowse={handleBrowse}
        fieldLabel={t("NORMAL_CHEAT_LABEL", "EXE Path")}
      />

      <ToggleDropdown
        label={t("NORMAL_LANG_TOGGLE_LABEL", "Language")}
        description={t("NORMAL_LANG_TOGGLE_DESC", "Try to specify the game language")}
        icon={<FaLanguage />}
        checked={showLang}
        onToggle={(enable: boolean) => {
          setShowLang(enable);
          if (!enable) {
            const updatedOptions = new Options(optionsString);
            updatedOptions.removeOptionByKey("LANG");
            updatedOptions.removeOptionByKey("HOST_LC_ALL");
            setOptions(updatedOptions);
          }
        }}
        fieldLabel={t("NORMAL_LANG_LABEL", "Language Code")}
        value={options.getKeyValue("LANG")}
        onInput={(value: string) => {
          const updatedOptions = new Options(optionsString);
          updatedOptions.setOption({ type: "env", key: "LANG", value: value });
          updatedOptions.setOption({ type: "env", key: "HOST_LC_ALL", value: value });
          setOptions(updatedOptions);
        }}
        preset={LangCodes as DropdownOption[]}
      />

      <SaveWithPreview />

    </Focusable>
  );
};

export default Normal;
