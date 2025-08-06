import {
  DialogButton,
  Field,
  Focusable,
  TextField,
  ToggleField,
} from "@decky/ui";
import { FC, useEffect, useState } from "react";
import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";

// import logger from "../utils/logger"
import { Backend } from "../utils/backend";
import { Options } from "../utils/options";
import { FaFolderOpen } from "react-icons/fa";
import t from "../utils/translate";
import { SaveWithPreview } from "../components/SaveWithPreview";

const Advanced: FC<{ appid: number }> = ({ appid }) => {
  const [options, setOptions] = useState(new Options(""));
  const [showPrefix, setShowPrefix] = useState(false);

  useEffect(() => {
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      const optionsString = detail.strLaunchOptions;
      const savedOptions = new Options(optionsString);
      setShowPrefix(savedOptions.hasField("STEAM_COMPAT_DATA_PATH"));
      setOptions(savedOptions);
    });
    setTimeout(() => {
      unregister();
    }, 1000);
  }, []);

  const handleBrowse = async () => {
    const prefixDir = options.getFieldValue("STEAM_COMPAT_DATA_PATH");
    const defaultDir = prefixDir ?? await Backend.getEnv("DECKY_USER_HOME");
    const filePickerRes = await Backend.openFilePicker(defaultDir, false);
    const prefixPath = filePickerRes.path;
    const newOptions = new Options(options.getOptionsString());
    newOptions.setFieldValue("STEAM_COMPAT_DATA_PATH", `"${prefixPath}"`);
    setOptions(newOptions);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>

      <ToggleField
        label="DXVK_ASYNC"
        description={t(
          "ADVANCED_DXVK_ASYNC_DESC",
          "Optimize the ProtonGE compatibility layer to reduce frame time and input lag",
        )}
        bottomSeparator="standard"
        checked={options.hasFieldValue("DXVK_ASYNC", "1")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          updatedOptions.setFieldValue("DXVK_ASYNC", enable ? "1" : "");
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="RADV_PERFTEST"
        description={t(
          "ADVANCED_RADV_PERFTEST_DESC",
          "Optimize the shader cache behavior of the ProtonGE compatibility layer",
        )}
        bottomSeparator="standard"
        checked={options.hasFieldValue("RADV_PERFTEST", "gpl")}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          updatedOptions.setFieldValue("RADV_PERFTEST", enable ? "gpl" : "");
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="STEAM_COMPAT_DATA_PATH"
        description={t(
          "ADVANCED_STEAM_COMPAT_DATA_PATH_DESC",
          "Specify a folder as the shared prefix for the game",
        )}
        bottomSeparator="none"
        checked={showPrefix}
        onChange={(enable: boolean) => {
          setShowPrefix(enable);
          if (!enable) {
            const updatedOptions = new Options(options.getOptionsString());
            updatedOptions.setFieldValue("STEAM_COMPAT_DATA_PATH", "");
            setOptions(updatedOptions);
          }
        }}
      />
      {showPrefix && (
        <Field
          key={1}
          label={t("ADVANCED_STEAM_COMPAT_DATA_PATH_LABEL", "Prefix Folder")}
          padding="none"
          bottomSeparator="thick"
        >
          <Focusable
            style={{
              boxShadow: "none",
              display: "flex",
              justifyContent: "right",
              padding: "10px 0",
            }}
          >
            <TextField
              style={{
                padding: "10px",
                fontSize: "14px",
                width: "400px",
              }}
              disabled={true}
              value={options.getFieldValue("STEAM_COMPAT_DATA_PATH")}
            />
            <DialogButton
              onClick={handleBrowse}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                maxWidth: "40px",
                minWidth: "auto",
                marginLeft: ".5em",
              }}
            >
              <FaFolderOpen />
            </DialogButton>
          </Focusable>
        </Field>
      )}

      <ToggleField
        label="Lossless Scaling"
        description={t(
          "ADVANCED_LOSSLESS_SCALING_DESC",
          "Enable Lossless Scaling for the game (requires the Lossless-Scaling plugin)",
        )}
        bottomSeparator="standard"
        checked={options.hasFlag({ key: "~/lsfg" })}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.setFlag({ key: "~/lsfg" });
          } else {
            updatedOptions.removeFlag({ key: "~/lsfg" });
          }
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="Decky Framegen Patch"
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_PATCH_DESC",
          "Patch the game to use Decky Framegen (requires the Decky-Framegen plugin)",
        )}
        bottomSeparator="standard"
        checked={options.hasFlag({ key: "~/fgmod/fgmod" })}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.removeFlag({ key: "~/fgmod/fgmod-uninstaller.sh" });
            updatedOptions.setFlag({ key: "~/fgmod/fgmod" });
          } else {
            updatedOptions.removeFlag({ key: "~/fgmod/fgmod" });
          }
          setOptions(updatedOptions);
        }}
      />

      <ToggleField
        label="Decky Framegen Unpatch"
        description={t(
          "ADVANCED_DECKY_FRAMEGEN_UNPATCH_DESC",
          "Unpatch the game for Decky Framegen (requires the Decky-Framegen plugin)",
        )}
        bottomSeparator="standard"
        checked={options.hasFlag({ key: "~/fgmod/fgmod-uninstaller.sh" })}
        onChange={(enable: boolean) => {
          const updatedOptions = new Options(options.getOptionsString());
          if (enable) {
            updatedOptions.removeFlag({ key: "~/fgmod/fgmod" });
            updatedOptions.setFlag({ key: "~/fgmod/fgmod-uninstaller.sh" });
          } else {
            updatedOptions.removeFlag({ key: "~/fgmod/fgmod-uninstaller.sh" });
          }
          setOptions(updatedOptions);
        }}
      />

      <SaveWithPreview options={options} appid={appid} />
    </Focusable>
  );
};

export default Advanced;
