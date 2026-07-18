import { type DropdownOption, Focusable } from "@decky/ui";
import { type FC, useState } from "react";
import { FaGamepad, FaLanguage } from "react-icons/fa";

import { LaunchOptionsPreview, ToggleDropdown, ToggleFilePicker } from "../components";
import { LangCodes } from "../data/languageCodes.json";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath } from "../infra/decky";
import { t } from "../utils/translate";

const Normal: FC = () => {
  const { options, editable, applyEdit } = useOptions();
  const [showCheat, setShowCheat] = useState(options.isTrainerEnabled);
  const [showLang, setShowLang] = useState(options.isLanguageEnabled);

  const handleBrowse = async () => {
    const defaultPath = options.trainerDirectory ?? (await getHomePath());
    const filePickerRes = await browseFiles(defaultPath, true, ["exe", "bat"]);
    const result = options.setTrainer(filePickerRes.path);
    if (!result.ok || !applyEdit(result)) setShowCheat(false);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <ToggleFilePicker
        label={t("NORMAL_CHEAT_TOGGLE_LABEL", "Enable Cheat")}
        description={t("NORMAL_CHEAT_TOGGLE_DESC", "Select the cheat or trainer exe file from storage")}
        icon={<FaGamepad />}
        disabled={!editable}
        checked={showCheat || options.isTrainerEnabled}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowCheat(true);
            return;
          }
          const result = options.disableTrainer();
          if (result.ok && applyEdit(result)) setShowCheat(false);
        }}
        value={options.trainerPath}
        onBrowse={handleBrowse}
        fieldLabel={t("NORMAL_CHEAT_LABEL", "EXE Path")}
      />

      <ToggleDropdown
        label={t("NORMAL_LANG_TOGGLE_LABEL", "Language")}
        description={t("NORMAL_LANG_TOGGLE_DESC", "Try to specify the game language")}
        icon={<FaLanguage />}
        disabled={!editable}
        checked={showLang || options.isLanguageEnabled}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowLang(true);
            return;
          }
          const result = options.disableLanguage();
          if (result.ok && applyEdit(result)) setShowLang(false);
        }}
        fieldLabel={t("NORMAL_LANG_LABEL", "Language Code")}
        value={options.language}
        onInput={(value: string) => {
          const result = options.setLanguage(value);
          if (!result.ok || !applyEdit(result)) setShowLang(false);
        }}
        preset={LangCodes as DropdownOption[]}
      />

      <LaunchOptionsPreview />
    </Focusable>
  );
};

export default Normal;
