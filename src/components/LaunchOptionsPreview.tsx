import { Field, Focusable } from "@decky/ui";
import type { CSSProperties, FC } from "react";
import { useOptions, useSettings } from "../hooks";
import { t } from "../utils/translate";

// SteamOS "Properties > Launch Options" preview style: a labeled row whose
// read-only content renders below the label, in a subtle inset box. Matches
// the row rhythm of the other refactored components (Field + below layout).
const rowStyle = {
  display: "flex",
  width: "100%",
} satisfies CSSProperties;

const previewStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "2px",
  boxSizing: "border-box",
  color: "#888",
  fontFamily: "monospace",
  fontSize: "12px",
  lineHeight: "1.4",
  minHeight: "20px",
  padding: "10px",
  textAlign: "left",
  width: "100%",
  wordBreak: "break-word",
} satisfies CSSProperties;

export const LaunchOptionsPreview: FC = () => {
  const { showPreview } = useSettings();
  const { options } = useOptions();

  const optionsString = options.toString();

  if (!showPreview) return null;

  return (
    <Field description={t("CONTENT_PREVIEW_DESC")} padding="standard" bottomSeparator="standard" childrenLayout="below">
      <Focusable style={rowStyle}>
        <div style={previewStyle}>{optionsString.length > 0 ? optionsString : t("CONTENT_PREVIEW_PLACEHOLDER")}</div>
      </Focusable>
    </Field>
  );
};
