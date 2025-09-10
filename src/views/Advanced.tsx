import { Focusable, ToggleField } from "@decky/ui";
import { FC, useState } from "react";

import { SaveWithPreview, ToggleFilePicker } from "../components";
import { useOptions } from "../hooks";
import { browseFiles, getHomePath, Options, t } from "../utils";

const Advanced: FC = () => {
  const { options, setOptions } = useOptions();
  const [showPrefix, setShowPrefix] = useState(options.hasKey("STEAM_COMPAT_DATA_PATH"));

  const optionsString = options.getOptionsString();

  const handleBrowse = async () => {
    const savedCompatDataPath = options.getKeyValue("STEAM_COMPAT_DATA_PATH");
    const defaultPath = savedCompatDataPath ?? await getHomePath();
    const filePickerRes = await browseFiles(defaultPath, false);
    const selectedCompatDataPath = filePickerRes.path;

    const newOptions = new Options(optionsString);
    newOptions.setOption({
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
          const updatedOptions = new Options(optionsString);
          if (enable) {
            updatedOptions.setOption({ type: "env", key: "DXVK_ASYNC", value: "1" });
          } else {
            updatedOptions.removeOptionByKey("DXVK_ASYNC");
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
          const updatedOptions = new Options(optionsString);
          if (enable) {
            updatedOptions.setOption({ type: "env", key: "RADV_PERFTEST", value: "gpl" });
          } else {
            updatedOptions.removeOptionByKey("RADV_PERFTEST");
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
            updatedOptions.removeOptionByKey("STEAM_COMPAT_DATA_PATH");
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
          const updatedOptions = new Options(optionsString);
          if (enable) {
            updatedOptions.setOption({ type: "pre_cmd", key: "~/lsfg" });
          } else {
            updatedOptions.removeOptionByKey("~/lsfg");
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
          const updatedOptions = new Options(optionsString);
          if (enable) {
            updatedOptions.removeOptionByKey("~/fgmod/fgmod-uninstaller.sh");
            updatedOptions.setOption({ type: "pre_cmd", key: "~/fgmod/fgmod" });
          } else {
            updatedOptions.removeOptionByKey("~/fgmod/fgmod");
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
          const updatedOptions = new Options(optionsString);
          if (enable) {
            updatedOptions.removeOptionByKey("~/fgmod/fgmod");
            updatedOptions.setOption({ type: "pre_cmd", key: "~/fgmod/fgmod-uninstaller.sh" });
          } else {
            updatedOptions.removeOptionByKey("~/fgmod/fgmod-uninstaller.sh");
          }
          setOptions(updatedOptions);
        }}
      />

      <SaveWithPreview />

    </Focusable>
  );
};

export default Advanced;
