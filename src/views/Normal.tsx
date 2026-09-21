import { Focusable } from "@decky/ui";
import { type FC, useState } from "react";
import { FaGlobe, FaWindowRestore } from "react-icons/fa";

import { type DropdownPreset, LaunchOptionsPreview, ToggleDropdown, ToggleFilePicker } from "../components";
import { LangCodes } from "../data/languageCodes.json";
import { language, sidecarProgram } from "../domain/features";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath } from "../infra/decky";
import { t } from "../utils/translate";

const Normal: FC = () => {
  const { options, editable, applyEdit, appid } = useOptions();
  const [showSidecar, setShowSidecar] = useState(sidecarProgram.isEnabled(options));
  const [showLang, setShowLang] = useState(language.isEnabled(options));

  const handleSidecarBrowse = async () => {
    const defaultPath = sidecarProgram.directory(options) ?? (await getHomePath());
    const filePickerRes = await browseFiles(defaultPath, true, ["exe", "bat"]);
    const result = sidecarProgram.set(options, filePickerRes.path);
    if (!result.ok || !applyEdit(result)) setShowSidecar(false);
  };

  const isSidecarActive = showSidecar || sidecarProgram.isEnabled(options);

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <LaunchOptionsPreview />

      <ToggleFilePicker
        label={t("NORMAL_SIDECAR_TOGGLE_LABEL")}
        description={t("NORMAL_SIDECAR_TOGGLE_DESC")}
        icon={<FaWindowRestore />}
        disabled={!editable}
        checked={isSidecarActive}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowSidecar(true);
            return;
          }
          const result = sidecarProgram.disable(options);
          if (result.ok && applyEdit(result)) setShowSidecar(false);
        }}
        value={sidecarProgram.path(options)}
        onBrowse={handleSidecarBrowse}
      />

      {isSidecarActive && (
        <div
          style={{
            margin: "4px 0 16px 0",
            padding: "10px 14px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "6px",
            borderLeft: "3px solid #1a9fff",
            fontSize: "12px",
            lineHeight: "1.45",
            color: "#dcdedf",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#66c0f4" }}>
            💡 {t("NORMAL_TRAINER_TIPS_TITLE")}
          </div>
          <div style={{ marginBottom: "4px" }}>
            • {t("NORMAL_TRAINER_TIPS_DOTNET").replace("<appid>", (appid || "").toString())}
          </div>
          <div style={{ marginBottom: "4px" }}>• {t("NORMAL_TRAINER_TIPS_WINDOWED")}</div>
          <div>• {t("NORMAL_TRAINER_TIPS_WOW64")}</div>
        </div>
      )}

      <ToggleDropdown
        label={t("NORMAL_LANG_TOGGLE_LABEL")}
        description={t("NORMAL_LANG_TOGGLE_DESC")}
        icon={<FaGlobe />}
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
    </Focusable>
  );
};

export default Normal;
