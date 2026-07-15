import { DialogButton, Focusable } from "@decky/ui";
import type { FC } from "react";

import { useOptions, useSettings } from "../hooks";
import { sendNotice } from "../infra/decky";
import { setAppLaunchOptions } from "../infra/steam";
import { t } from "../utils/translate";

export const SaveWithPreview: FC<{ checkWine?: boolean }> = () => {
  const { showPreview, skipWineCheck } = useSettings();
  const { appid, command, options, editFailure } = useOptions();

  const optionsString = options.toString();
  const commandString = command.toLowerCase();

  const isWineGame = (cmd: string) => {
    // Skip native applications
    if (cmd.includes("flatpak") || cmd.includes("appimage")) return false;
    return true;
  };

  const handleSave = () => {
    if (editFailure === "missing-command-marker") {
      sendNotice(t("MESSAGE_MISSING_COMMAND", "Launch options must contain exactly one %command% marker."));
    } else if (editFailure === "invalid-custom-option") {
      sendNotice(t("MESSAGE_INVALID_CUSTOM_OPTION", "The custom launch option is invalid and was not applied."));
    } else if (!skipWineCheck && !isWineGame(commandString)) {
      sendNotice(t("MESSAGE_NON_STEAM", "This launcher is not supported; settings were not saved."));
    } else {
      setAppLaunchOptions(appid, optionsString);
      sendNotice(t("MESSAGE_SAVED", "Game launch options have been saved."));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "95%",
        marginTop: "20px",
        alignSelf: "center",
        gap: "4px",
      }}
    >
      {showPreview && optionsString.length > 0 && (
        <Focusable
          style={{
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
