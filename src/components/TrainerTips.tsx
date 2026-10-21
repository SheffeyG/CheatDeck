import type { CSSProperties, FC } from "react";
import { t } from "../utils/translate";

interface TrainerTipsProps {
  appid: number | undefined;
}

// Theme-neutral styling: no fixed text or background colour, so the box stays
// readable in both the dark and the light Steam theme. Only the accent border
// carries colour.
const containerStyle = {
  margin: "4px 0 16px 0",
  padding: "10px 14px",
  borderLeft: "3px solid #1a9fff",
  fontSize: "12px",
  lineHeight: "1.45",
} satisfies CSSProperties;

const titleStyle = {
  fontWeight: "bold",
  marginBottom: "6px",
} satisfies CSSProperties;

const itemStyle = {
  marginBottom: "4px",
} satisfies CSSProperties;

/**
 * Short troubleshooting hints shown while a sidecar program is configured.
 *
 * Every hint maps to a case that CheatDeck cannot solve in code, verified in
 * docs/TROUBLESHOOTING.md: missing .NET runtimes, the Proton 11 window
 * regression and trainers left behind after a crash.
 */
export const TrainerTips: FC<TrainerTipsProps> = ({ appid }) => {
  const items = [
    t("NORMAL_TRAINER_TIPS_DOTNET").replace("<appid>", appid ? String(appid) : "<appid>"),
    t("NORMAL_TRAINER_TIPS_WINDOWED"),
    t("NORMAL_TRAINER_TIPS_PROTON"),
    t("NORMAL_TRAINER_TIPS_STALE"),
  ];

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{t("NORMAL_TRAINER_TIPS_TITLE")}</div>
      {items.map((text) => (
        <div key={text} style={itemStyle}>
          {`\u2022 ${text}`}
        </div>
      ))}
    </div>
  );
};
