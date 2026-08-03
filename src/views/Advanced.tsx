import { DropdownItem, Focusable } from "@decky/ui";
import { type FC, useState } from "react";

import { LaunchOptionsPreview, Toggle, ToggleFilePicker } from "../components";
import { compatibilityPath, noFsync, pulseLatency, steamDeckDesktopMode, wineD3d } from "../domain/features";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath } from "../infra/decky";
import { t } from "../utils/translate";

const defaultPulseLatency = "default";
const pulseLatencyPresets = [
  { data: defaultPulseLatency, label: t("DEFAULT") },
  { data: "30", label: "30 ms" },
  { data: "60", label: "60 ms" },
  { data: "90", label: "90 ms" },
];

const Advanced: FC = () => {
  const { options, editable, applyEdit } = useOptions();
  const [showPrefix, setShowPrefix] = useState(compatibilityPath.value(options) !== undefined);
  const pulseLatencyValue = pulseLatency.value(options);

  const handleBrowse = async () => {
    const defaultPath = compatibilityPath.value(options) ?? (await getHomePath());
    const filePickerRes = await browseFiles(defaultPath, false);
    const result = compatibilityPath.set(options, filePickerRes.path);
    if (!result.ok || !applyEdit(result)) setShowPrefix(false);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <LaunchOptionsPreview />

      <Toggle
        label={t("ADVANCED_STEAMDECK_DESKTOP_LABEL")}
        description={t("ADVANCED_STEAMDECK_DESKTOP_DESC")}
        disabled={!editable}
        checked={steamDeckDesktopMode.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(steamDeckDesktopMode.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_NO_FSYNC_LABEL")}
        description={t("ADVANCED_NO_FSYNC_DESC")}
        disabled={!editable}
        checked={noFsync.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(noFsync.setEnabled(options, enable))}
      />

      <Toggle
        label={t("ADVANCED_WINED3D_LABEL")}
        description={t("ADVANCED_WINED3D_DESC")}
        disabled={!editable}
        checked={wineD3d.isEnabled(options)}
        onChange={(enable: boolean) => applyEdit(wineD3d.setEnabled(options, enable))}
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
      />

      <DropdownItem
        label={t("ADVANCED_PULSE_LATENCY_LABEL")}
        description={t("ADVANCED_PULSE_LATENCY_DESC")}
        disabled={!editable}
        rgOptions={pulseLatencyPresets}
        selectedOption={pulseLatencyValue ?? defaultPulseLatency}
        strDefaultLabel={pulseLatencyValue ? `${pulseLatencyValue} ms` : t("DEFAULT")}
        onChange={(preset) =>
          applyEdit(pulseLatency.set(options, preset.data === defaultPulseLatency ? undefined : preset.data))
        }
        bottomSeparator="standard"
        highlightOnFocus
      />
    </Focusable>
  );
};

export default Advanced;
