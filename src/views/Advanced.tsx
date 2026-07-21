import { Focusable } from "@decky/ui";
import { type FC, useState } from "react";

import { LaunchOptionsPreview, Toggle, ToggleFilePicker } from "../components";
import {
  compatibilityPath,
  dxvkAsync,
  framegenPatch,
  framegenUnpatch,
  losslessScaling,
  radvPerftest,
} from "../domain/features";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath } from "../infra/decky";
import { t } from "../utils/translate";

const Advanced: FC = () => {
  const { options, editable, applyEdit } = useOptions();
  const [showPrefix, setShowPrefix] = useState(compatibilityPath.value(options) !== undefined);

  const handleBrowse = async () => {
    const defaultPath = compatibilityPath.value(options) ?? (await getHomePath());
    const filePickerRes = await browseFiles(defaultPath, false);
    const result = compatibilityPath.set(options, filePickerRes.path);
    if (!result.ok || !applyEdit(result)) setShowPrefix(false);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <Toggle
        label={t("ADVANCED_DXVK_ASYNC_LABEL")}
        description={t("ADVANCED_DXVK_ASYNC_DESC")}
        disabled={!editable}
        checked={dxvkAsync.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(dxvkAsync.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_RADV_PERFTEST_LABEL")}
        description={t("ADVANCED_RADV_PERFTEST_DESC")}
        disabled={!editable}
        checked={radvPerftest.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(radvPerftest.setEnabled(options, enable))}
      />

      <ToggleFilePicker
        label={t("ADVANCED_STEAM_COMPAT_DATA_PATH_LABEL")}
        description={t("ADVANCED_STEAM_COMPAT_DATA_PATH_DESC")}
        disabled={!editable}
        checked={showPrefix || compatibilityPath.value(options) !== undefined}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowPrefix(true);
            return;
          }
          const result = compatibilityPath.disable(options);
          if (result.ok && applyEdit(result)) setShowPrefix(false);
        }}
        value={compatibilityPath.value(options)}
        onBrowse={handleBrowse}
        fieldLabel={t("ADVANCED_STEAM_COMPAT_DATA_PATH_NOTE")}
      />

      <Toggle
        label={t("ADVANCED_LOSSLESS_SCALING_LABEL")}
        description={t("ADVANCED_LOSSLESS_SCALING_DESC")}
        disabled={!editable}
        checked={losslessScaling.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(losslessScaling.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_DECKY_FRAMEGEN_PATCH_LABEL")}
        description={t("ADVANCED_DECKY_FRAMEGEN_PATCH_DESC")}
        disabled={!editable}
        checked={framegenPatch.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(framegenPatch.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_DECKY_FRAMEGEN_UNPATCH_LABEL")}
        description={t("ADVANCED_DECKY_FRAMEGEN_UNPATCH_DESC")}
        disabled={!editable}
        checked={framegenUnpatch.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(framegenUnpatch.setEnabled(options, enable))}
      />

      <LaunchOptionsPreview />
    </Focusable>
  );
};

export default Advanced;
