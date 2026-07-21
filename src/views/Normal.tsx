import { Focusable } from "@decky/ui";
import { type FC, useState } from "react";
import { FaGamepad, FaLanguage } from "react-icons/fa";

import { type DropdownPreset, LaunchOptionsPreview, ToggleDropdown, ToggleFilePicker } from "../components";
import { LangCodes } from "../data/languageCodes.json";
import { language, trainer } from "../domain/features";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath } from "../infra/decky";
import { t } from "../utils/translate";

const Normal: FC = () => {
  const { options, editable, applyEdit } = useOptions();
  const [showCheat, setShowCheat] = useState(trainer.isEnabled(options));
  const [showLang, setShowLang] = useState(language.isEnabled(options));

  const handleBrowse = async () => {
    const defaultPath = trainer.directory(options) ?? (await getHomePath());
    const filePickerRes = await browseFiles(defaultPath, true, ["exe", "bat"]);
    const result = trainer.set(options, filePickerRes.path);
    if (!result.ok || !applyEdit(result)) setShowCheat(false);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <ToggleFilePicker
        label={t("NORMAL_CHEAT_TOGGLE_LABEL")}
        description={t("NORMAL_CHEAT_TOGGLE_DESC")}
        icon={<FaGamepad />}
        disabled={!editable}
        checked={showCheat || trainer.isEnabled(options)}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowCheat(true);
            return;
          }
          const result = trainer.disable(options);
          if (result.ok && applyEdit(result)) setShowCheat(false);
        }}
        value={trainer.path(options)}
        onBrowse={handleBrowse}
      />

      <ToggleDropdown
        label={t("NORMAL_LANG_TOGGLE_LABEL")}
        description={t("NORMAL_LANG_TOGGLE_DESC")}
        icon={<FaLanguage />}
        disabled={!editable}
        checked={showLang || language.isEnabled(options)}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowLang(true);
            return;
          }
          const result = language.disable(options);
          if (result.ok && applyEdit(result)) setShowLang(false);
        }}
        fieldLabel={t("NORMAL_LANG_LABEL")}
        value={language.value(options)}
        onInput={(value: string) => {
          const result = language.set(options, value);
          if (!result.ok || !applyEdit(result)) setShowLang(false);
        }}
        preset={LangCodes as DropdownPreset[]}
      />

      <LaunchOptionsPreview />
    </Focusable>
  );
};

export default Normal;
