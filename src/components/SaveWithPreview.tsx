import { DialogButton, Focusable } from "@decky/ui";
import { FC } from "react";

import { useOptions, useSettings } from "../hooks";
import { sendNotice, t } from "../utils";

export const SaveWithPreview: FC<{ checkWine?: boolean }> = ({ checkWine = true }) => {
  const { showPreview } = useSettings();
  const { appid, command, options } = useOptions();

  const optionsString = options.getOptionsString();
  const commandString = command.toLowerCase();

  const isWineGame = (cmd: string) => {
    // Skip some launchers like heroic
    if (cmd.includes("flatpak") || cmd.includes("appimage")) return false;
    return true;
  };

  const handleSave = () => {
    if (checkWine && !isWineGame(commandString)) {
      sendNotice(t("MESSAGE_NON_STEAM", "This launcher is not supported; settings were not saved."));
    } else {
      SteamClient.Apps.SetAppLaunchOptions(appid, optionsString);
      sendNotice(t("MESSAGE_SAVED", "Game launch options have been saved."));
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "95%",
      marginTop: "20px",
      alignSelf: "center",
      gap: "4px",
    }}
    >
      {showPreview && optionsString.length > 0 && (
        <Focusable style={{
          background: "rgba(255,255,255,0.1)",
          padding: "10px",
          borderRadius: "2px",
          fontSize: "12px",
          textAlign: "left",
          fontFamily: "monospace",
          color: "#ccc",
          minHeight: "20px",
          boxSizing: "border-box",
        }}
        >
          {optionsString}
        </Focusable>
      )}

      <DialogButton
        onClick={handleSave}
        style={{
          padding: "10px",
          fontSize: "14px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {t("SAVE", "Save")}
      </DialogButton>
    </div>
  );
};
