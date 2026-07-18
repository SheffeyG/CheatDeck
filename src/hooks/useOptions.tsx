import { createContext, type FC, type ReactNode, useContext, useEffect, useRef, useState } from "react";

import { LaunchOptions, type LaunchOptionsEditResult } from "../domain/options";
import { sendNotice } from "../infra/decky";
import { registerForAppDetails, setAppLaunchOptions } from "../infra/steam";
import { logger } from "../utils/logger";
import { t } from "../utils/translate";
import { useSettings } from "./useSettings";

interface OptionsContextProps {
  appid: number;
  command: string;
  options: LaunchOptions;
  editable: boolean;
  diagnostics: LaunchOptions["diagnostics"];
  applyEdit: (result: LaunchOptionsEditResult) => boolean;
}

interface LoadedOptions {
  appid: number;
  command: string;
  options: LaunchOptions;
}

interface PendingSave {
  appid: number;
  options: LaunchOptions;
}

const OptionsContext = createContext<OptionsContextProps | undefined>(undefined);

export const OptionsProvider: FC<{
  children: ReactNode;
  appid: number;
}> = ({ children, appid }) => {
  const [loaded, setLoaded] = useState<LoadedOptions>();
  const loadedRef = useRef<LoadedOptions>();
  const pendingSave = useRef<PendingSave>();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const { skipWineCheck } = useSettings();

  const flushPendingSave = () => {
    const pending = pendingSave.current;
    if (!pending) return;
    clearTimeout(saveTimer.current);
    setAppLaunchOptions(pending.appid, pending.options.toString());
    pendingSave.current = undefined;
  };

  useEffect(() => {
    if (!appid) {
      logger.warning("Invalid appid:", appid);
      return;
    }

    let active = true;
    const { unregister } = registerForAppDetails(appid, (detail) => {
      if (!active) return;
      if (!detail) {
        logger.error("Invalid AppDetails:", detail);
        return;
      }
      if (detail.strLaunchOptions === undefined) return;
      const nextLoaded = {
        appid,
        command: detail.strShortcutExe ?? "",
        options: LaunchOptions.parse(detail.strLaunchOptions),
      };
      loadedRef.current = nextLoaded;
      setLoaded(nextLoaded);
    });

    const timeoutId = setTimeout(unregister, 1000);
    return () => {
      active = false;
      flushPendingSave();
      clearTimeout(timeoutId);
      unregister();
    };
  }, [appid]);

  if (!loaded || loaded.appid !== appid) {
    return <div>Loading options...</div>;
  }

  const sourceOptions = loaded.options;
  const applyEdit = (result: LaunchOptionsEditResult) => {
    const current = loadedRef.current;
    if (current?.appid !== appid || current.options !== sourceOptions) return false;

    if (!result.ok) {
      const message = t("MESSAGE_INVALID_LAUNCH_OPTIONS", "Launch options could not be edited safely.");
      sendNotice(message);
      return false;
    }
    if (!result.changed) return true;

    const command = current.command.toLowerCase();
    if (!skipWineCheck && (command.includes("flatpak") || command.includes("appimage"))) {
      sendNotice(t("MESSAGE_NON_STEAM", "This launcher is not supported; settings were not saved."));
      return false;
    }

    const nextLoaded = { ...current, options: result.value };
    loadedRef.current = nextLoaded;
    setLoaded(nextLoaded);
    pendingSave.current = { appid, options: result.value };
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushPendingSave, 250);
    return true;
  };

  return (
    <OptionsContext.Provider
      value={{
        ...loaded,
        editable: loaded.options.editable,
        diagnostics: loaded.options.diagnostics,
        applyEdit,
      }}
    >
      {!loaded.options.editable && (
        <div style={{ padding: "12px 16px", color: "#ffb3b3", fontSize: "12px" }}>
          {t("MESSAGE_INVALID_LAUNCH_OPTIONS", "Launch options could not be edited safely.")}
        </div>
      )}
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = (): OptionsContextProps => {
  const context = useContext(OptionsContext);
  if (!context) throw new Error("useOptions must be used within an OptionsProvider");
  return context;
};
