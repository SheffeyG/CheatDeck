import { DialogButton, Focusable } from "@decky/ui";
import { FC } from "react";

import { useSettings } from "../hooks/useSettings";
import { Options } from "../utils/options";
import t from "../utils/translate";

interface SaveWithPreviewProps {
  options: Options;
  appid: number;
}

export const SaveWithPreview: FC<SaveWithPreviewProps> = ({
  options,
  appid,
}) => {
  const { showPreview } = useSettings();
  const optionsString = options.getOptionsString();

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
        onClick={() => options.saveOptions(appid)}
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
