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

const describe = (status: SidecarStatusData | undefined, path: string): string => {
  if (!status || status.path !== path) return t("SIDECAR_STATUS_UNKNOWN");
  if (status.pids.length > 0) return `${t("SIDECAR_STATUS_RUNNING")}: ${status.pids.join(", ")}`;
  if (!status.exists) return t("SIDECAR_STATUS_MISSING");
  return t("SIDECAR_STATUS_STOPPED");
};

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

  return (
    <Field
      label={t("SIDECAR_STATUS_LABEL")}
      description={t("SIDECAR_STATUS_DESC")}
      padding="standard"
      bottomSeparator="standard"
      childrenLayout="below"
    >
      <Focusable style={rowStyle}>
        <DialogButton style={actionStyle} disabled={busy} onClick={refresh}>
          {`${t("SIDECAR_REFRESH")} · ${describe(status, path)}`}
        </DialogButton>
        <DialogButton style={actionStyle} disabled={busy || !running} onClick={terminate}>
          {t("SIDECAR_TERMINATE")}
        </DialogButton>
      </Focusable>
    </Field>
  );
};
