import { DialogButton, Field, Focusable } from "@decky/ui";
import { type CSSProperties, type FC, useCallback, useEffect, useState } from "react";
import { type SidecarStatus as SidecarStatusData, sidecarProcess } from "../infra/decky";
import { logger } from "../utils/logger";
import { t } from "../utils/translate";

interface SidecarStatusProps {
  path: string | undefined;
}

const rowStyle = {
  display: "flex",
  width: "100%",
  gap: "8px",
} satisfies CSSProperties;

const actionStyle = {
  alignItems: "center",
  display: "flex",
  flex: "1 1 0",
  justifyContent: "center",
  minWidth: "auto",
  padding: "10px",
} satisfies CSSProperties;

type StatusTone = "running" | "idle" | "missing" | "unknown";

const describe = (status: SidecarStatusData | undefined, path: string): { text: string; tone: StatusTone } => {
  if (!status || status.path !== path) return { text: t("SIDECAR_STATUS_UNKNOWN"), tone: "unknown" };
  if (status.pids.length > 0) {
    return { text: `${t("SIDECAR_STATUS_RUNNING")}: ${status.pids.join(", ")}`, tone: "running" };
  }
  if (!status.exists) return { text: t("SIDECAR_STATUS_MISSING"), tone: "missing" };
  return { text: t("SIDECAR_STATUS_STOPPED"), tone: "idle" };
};

// Only the indicator dot is coloured; the label keeps the theme's text colour so
// it stays readable in both the dark and the light Steam theme.
const toneColor: Record<StatusTone, string> = {
  running: "#8bc53f",
  idle: "#8bc53f",
  missing: "#e5a00d",
  unknown: "#e5a00d",
};

const dotStyle = (tone: StatusTone): CSSProperties => ({
  color: toneColor[tone],
  // Inactive and unknown states are dimmed, so the signal does not rely on hue.
  opacity: tone === "running" || tone === "missing" ? 1 : 0.45,
  marginRight: "6px",
});

const statusStyle = {
  fontSize: "12px",
  lineHeight: "1.4",
  marginBottom: "8px",
} satisfies CSSProperties;

/**
 * Shows whether the configured trainer is still running and offers to stop it.
 *
 * A trainer started through PROTON_REMOTE_DEBUG_CMD is only cleaned up when the
 * game exits normally. After a crash or a force-closed game the instance stays
 * alive, keeps the prefix busy and blocks the next launch (issue #46).
 */
export const SidecarStatus: FC<SidecarStatusProps> = ({ path }) => {
  const [status, setStatus] = useState<SidecarStatusData>();
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!path) {
      setStatus(undefined);
      return;
    }
    try {
      setStatus(await sidecarProcess.probe(path));
    } catch (error) {
      logger.error("Failed to probe sidecar process", error);
      setStatus(undefined);
    }
  }, [path]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!path) return null;

  const running = (status?.pids.length ?? 0) > 0;

  const terminate = async () => {
    setBusy(true);
    try {
      const result = await sidecarProcess.terminate(path);
      if (result.failed.length > 0) {
        logger.warning("Could not stop sidecar processes", result.failed);
      }
    } catch (error) {
      logger.error("Failed to terminate sidecar process", error);
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  const { text, tone } = describe(status, path);

  return (
    <Field
      label={t("SIDECAR_STATUS_LABEL")}
      description={t("SIDECAR_STATUS_DESC")}
      padding="standard"
      bottomSeparator="standard"
      childrenLayout="below"
    >
      <div style={statusStyle}>
        <span style={dotStyle(tone)} aria-hidden="true">
          {"\u25CF"}
        </span>
        {text}
      </div>
      <Focusable style={rowStyle}>
        <DialogButton style={actionStyle} disabled={busy} onClick={refresh}>
          {t("SIDECAR_REFRESH")}
        </DialogButton>
        <DialogButton style={actionStyle} disabled={busy || !running} onClick={terminate}>
          {t("SIDECAR_TERMINATE")}
        </DialogButton>
      </Focusable>
    </Field>
  );
};
