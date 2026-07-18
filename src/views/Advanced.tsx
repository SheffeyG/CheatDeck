import { Focusable } from "@decky/ui";
import { type FC, useState } from "react";

import { LaunchOptionsPreview, Toggle, ToggleFilePicker } from "../components";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath } from "../infra/decky";
import { t } from "../utils/translate";

const Advanced: FC = () => {
  const { options, editable, applyEdit } = useOptions();
  const [showPrefix, setShowPrefix] = useState(options.compatibilityPath !== undefined);

  const handleBrowse = async () => {
    const defaultPath = options.compatibilityPath ?? (await getHomePath());
    const filePickerRes = await browseFiles(defaultPath, false);
    const result = options.setCompatibilityPath(filePickerRes.path);
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
        checked={options.isDxvkAsyncEnabled}
        onChange={(enable: boolean) => applyEdit(options.setDxvkAsync(enable))}
      />

      <Toggle
        label={t("ADVANCED_RADV_PERFTEST_LABEL", "RADV_PERFTEST")}
        description={t(
          "ADVANCED_RADV_PERFTEST_DESC",
          "Optimize the shader cache behavior of the ProtonGE compatibility layer",
        )}
        disabled={!editable}
        checked={options.isRadvPerftestEnabled}
        onChange={(enable: boolean) => applyEdit(options.setRadvPerftest(enable))}
      />

      <ToggleFilePicker
        label={t("ADVANCED_STEAM_COMPAT_DATA_PATH_LABEL", "STEAM_COMPAT_DATA_PATH")}
        description={t("ADVANCED_STEAM_COMPAT_DATA_PATH_DESC", "Specify a folder as the shared prefix for the game")}
        disabled={!editable}
        checked={showPrefix || options.compatibilityPath !== undefined}
        onToggle={(enable: boolean) => {
          if (enable) {
            setShowPrefix(true);
            return;
          }
          const result = options.disableCompatibilityPath();
          if (result.ok && applyEdit(result)) setShowPrefix(false);
        }}
        value={options.compatibilityPath}
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
        checked={options.isLosslessScalingEnabled}
        onChange={(enable: boolean) => applyEdit(options.setLosslessScaling(enable))}
      />

      <Toggle
        label={t("ADVANCED_DECKY_FRAMEGEN_PATCH_LABEL", "Decky Framegen Patch")}
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_PATCH_DESC",
          "Patch the game to use Framegen (requires the Decky-Framegen plugin)",
        )}
        disabled={!editable}
        checked={options.isFramegenPatchEnabled}
        onChange={(enable: boolean) => applyEdit(options.setFramegenPatch(enable))}
      />

      <Toggle
        label={t("ADVANCED_DECKY_FRAMEGEN_UNPATCH_LABEL", "Decky Framegen Unpatch")}
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_UNPATCH_DESC",
          "Unpatch the game for Decky Framegen (requires the Decky-Framegen plugin)",
        )}
        disabled={!editable}
        checked={options.isFramegenUnpatchEnabled}
        onChange={(enable: boolean) => applyEdit(options.setFramegenUnpatch(enable))}
      />

      <LaunchOptionsPreview />
    </Focusable>
  );
};

export default Advanced;
