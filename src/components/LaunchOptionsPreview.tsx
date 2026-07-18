import { Focusable } from "@decky/ui";
import type { FC } from "react";
import { useOptions, useSettings } from "../hooks";

export const LaunchOptionsPreview: FC = () => {
  const { showPreview } = useSettings();
  const { options } = useOptions();

  const optionsString = options.toString();
  const hasOptions = optionsString.length > 0;

  if (!showPreview) return null;

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
      <Focusable
        aria-hidden={!hasOptions}
        style={{
          visibility: hasOptions ? "visible" : "hidden",
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
        {hasOptions ? optionsString : " "}
      </Focusable>
    </div>
  );
};
