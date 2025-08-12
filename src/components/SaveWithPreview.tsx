import { DialogButton, Field, Focusable } from "@decky/ui";
import { FC } from "react";

import { Options } from "../utils/options";
import t from "../utils/translate";

interface SaveWithPreviewProps {
  options: Options;
  appid: number;
  showPreview?: boolean;
}

export const SaveWithPreview: FC<SaveWithPreviewProps> = ({
  options,
  appid,
  showPreview = true
}) => {
  const optionsString = options.getOptionsString();

  return (
    <>
      {showPreview && (
        <Field
          label={t("LAUNCH_OPTIONS_PREVIEW", "Launch Options Preview")}
          bottomSeparator="none"
          focusable
        >
          <Focusable style={{
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
            textAlign: "left",
            fontFamily: "monospace",
            color: "#ccc",
            minHeight: "20px"
          }}>
            {optionsString}
          </Focusable>
        </Field>
      )}

      <DialogButton
        onClick={() => options.saveOptions(appid)}
        style={{
          alignSelf: "center",
          marginTop: "20px",
          padding: "10px",
          fontSize: "14px",
          textAlign: "center",
          width: "80%",
        }}
      >
        {t("SAVE", "Save")}
      </DialogButton>
    </>
  );
};