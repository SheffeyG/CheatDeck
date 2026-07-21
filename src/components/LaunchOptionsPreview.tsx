import { Focusable } from "@decky/ui";
import type { CSSProperties, FC } from "react";
import { useOptions, useSettings } from "../hooks";

const containerStyle = {
  alignSelf: "center",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginTop: "20px",
  width: "95%",
} satisfies CSSProperties;

const previewStyle = {
  background: "rgba(255,255,255,0.1)",
  borderRadius: "2px",
  boxSizing: "border-box",
  color: "#ccc",
  fontFamily: "monospace",
  fontSize: "12px",
  minHeight: "20px",
  padding: "10px",
  textAlign: "left",
} satisfies CSSProperties;

const hiddenPreviewStyle = {
  ...previewStyle,
  visibility: "hidden",
} satisfies CSSProperties;

export const LaunchOptionsPreview: FC = () => {
  const { showPreview } = useSettings();
  const { options } = useOptions();

  const optionsString = options.toString();
  const hasOptions = optionsString.length > 0;

  if (!showPreview) return null;

  return (
    <div style={containerStyle}>
      <Focusable aria-hidden={!hasOptions} style={hasOptions ? previewStyle : hiddenPreviewStyle}>
        {hasOptions ? optionsString : " "}
      </Focusable>
    </div>
  );
};
