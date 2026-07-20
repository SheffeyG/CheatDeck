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
        label={t("ADVANCED_DXVK_ASYNC_LABEL", "DXVK_ASYNC")}
        description={t(
          "ADVANCED_DXVK_ASYNC_DESC",
          "Optimize the ProtonGE compatibility layer to reduce frame time and input lag",
        )}
        disabled={!editable}
        checked={dxvkAsync.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(dxvkAsync.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_RADV_PERFTEST_LABEL", "RADV_PERFTEST")}
        description={t(
          "ADVANCED_RADV_PERFTEST_DESC",
          "Optimize the shader cache behavior of the ProtonGE compatibility layer",
        )}
        disabled={!editable}
        checked={radvPerftest.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(radvPerftest.setEnabled(options, enable))}
      />

      <ToggleFilePicker
        label={t("ADVANCED_STEAM_COMPAT_DATA_PATH_LABEL", "STEAM_COMPAT_DATA_PATH")}
        description={t("ADVANCED_STEAM_COMPAT_DATA_PATH_DESC", "Specify a folder as the shared prefix for the game")}
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
        fieldLabel={t("ADVANCED_STEAM_COMPAT_DATA_PATH_NOTE", "Data Path")}
      />

      <Toggle
        label={t("ADVANCED_LOSSLESS_SCALING_LABEL", "Lossless Scaling")}
        description={t(
          "ADVANCED_LOSSLESS_SCALING_DESC",
          "Patch the game to use Framegen (requires the Lossless-Scaling plugin)",
        )}
        disabled={!editable}
        checked={losslessScaling.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(losslessScaling.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_DECKY_FRAMEGEN_PATCH_LABEL", "Decky Framegen Patch")}
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_PATCH_DESC",
          "Patch the game to use Framegen (requires the Decky-Framegen plugin)",
        )}
        disabled={!editable}
        checked={framegenPatch.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(framegenPatch.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_DECKY_FRAMEGEN_UNPATCH_LABEL", "Decky Framegen Unpatch")}
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_UNPATCH_DESC",
          "Unpatch the game for Decky Framegen (requires the Decky-Framegen plugin)",
        )}
        disabled={!editable}
        checked={framegenUnpatch.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(framegenUnpatch.setEnabled(options, enable))}
      />

      <LaunchOptionsPreview />
    </Focusable>
  );
};

export default Advanced;
