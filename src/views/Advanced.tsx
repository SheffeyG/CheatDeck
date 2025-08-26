import { Focusable, ToggleField } from "@decky/ui";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { FC, useEffect, useState } from "react";

import { SaveWithPreview } from "../components/SaveWithPreview";
import { ToggleFilePicker } from "../components/ToggleFilePicker";
import { getHomePath } from "../utils/backend";
import { browseFiles } from "../utils/client";
import { Options } from "../utils/options";
import t from "../utils/translate";

const Advanced: FC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(""));
  const [showPrefix, setShowPrefix] = useState(false);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setShowPrefix(savedOptions.hasKey("STEAM_COMPAT_DATA_PATH"));
      setOptions(savedOptions);
    });
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

  const handleBrowse = async () => {
    const savedCompatDataPath = options.getKeyValue("STEAM_COMPAT_DATA_PATH");
    const defaultPath = savedCompatDataPath ?? await getHomePath();
    const filePickerRes = await browseFiles(defaultPath, false);
    const selectedCompatDataPath = filePickerRes.path;

    const newOptions = new Options(options.getOptionsString());
    newOptions.setParameter({
      type: "env",
      key: "STEAM_COMPAT_DATA_PATH",
      value: selectedCompatDataPath,
    });
    setOptions(newOptions);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label={t("ADVANCED_DXVK_ASYNC_LABEL", "DXVK_ASYNC")}
        description={t(
          "ADVANCED_DXVK_ASYNC_DESC",
          "Optimize the ProtonGE compatibility layer to reduce frame time and input lag",
        )}
        bottomSeparator="standard"
        checked={options.hasKeyValue("DXVK_ASYNC", "1")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.setParameter({ type: "env", key: "DXVK_ASYNC", value: "1" });
          } else {
            updatedOptions.removeParamByKey("DXVK_ASYNC");
          }
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label={t("ADVANCED_RADV_PERFTEST_LABEL", "RADV_PERFTEST")}
        description={t(
          "ADVANCED_RADV_PERFTEST_DESC",
          "Optimize the shader cache behavior of the ProtonGE compatibility layer",
        )}
        bottomSeparator="standard"
        checked={options.hasKeyValue("RADV_PERFTEST", "gpl")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.setParameter({ type: "env", key: "RADV_PERFTEST", value: "gpl" });
          } else {
            updatedOptions.removeParamByKey("RADV_PERFTEST");
          }
          setOptions(updatedOptions);
        }}
      />

      <ToggleFilePicker
        label={t("ADVANCED_STEAM_COMPAT_DATA_PATH_LABEL", "STEAM_COMPAT_DATA_PATH")}
        description={t(
          "ADVANCED_STEAM_COMPAT_DATA_PATH_DESC",
          "Specify a folder as the shared prefix for the game",
        )}
        checked={showPrefix}
        onToggle={(enable: boolean) => {
          setShowPrefix(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.removeParamByKey("STEAM_COMPAT_DATA_PATH");
            setOptions(updatedOptions);
          }
        }}
        value={options.getKeyValue("STEAM_COMPAT_DATA_PATH")}
        onBrowse={handleBrowse}
        fieldLabel={t("ADVANCED_STEAM_COMPAT_DATA_PATH_NOTE", "Data Path")}
      />

      <ToggleField
        label={t("ADVANCED_LOSSLESS_SCALING_LABEL", "Lossless Scaling")}
        description={t(
          "ADVANCED_LOSSLESS_SCALING_DESC",
          "Patch the game to use Framegen (requires the Lossless-Scaling plugin)",
        )}
        bottomSeparator="standard"
        checked={options.hasKey("~/lsfg")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.setParameter({ type: "pre_cmd", key: "~/lsfg" });
          } else {
            updatedOptions.removeParamByKey("~/lsfg");
          }
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label={t("ADVANCED_DECKY_FRAMEGEN_PATCH_LABEL", "Decky Framegen Patch")}
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_PATCH_DESC",
          "Patch the game to use Framegen (requires the Decky-Framegen plugin)",
        )}
        bottomSeparator="standard"
        checked={options.hasKey("~/fgmod/fgmod")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.setParameter({ type: "pre_cmd", key: "~/fgmod/fgmod" });
          } else {
            updatedOptions.removeParamByKey("~/fgmod/fgmod");
          }
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label={t("ADVANCED_DECKY_FRAMEGEN_UNPATCH_LABEL", "Decky Framegen Unpatch")}
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_UNPATCH_DESC",
          "Unpatch the game for Decky Framegen (requires the Decky-Framegen plugin)",
        )}
        bottomSeparator="standard"
        checked={options.hasKey("~/fgmod/fgmod-uninstaller.sh")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.setParameter({ type: "pre_cmd", key: "~/fgmod/fgmod-uninstaller.sh" });
          } else {
            updatedOptions.removeParamByKey("~/fgmod/fgmod-uninstaller.sh");
          }
          setOptions(updatedOptions);
        }}
      />

      <SaveWithPreview options={options} appid={appid} />

    </Focusable>
  );
};

export default Advanced;
