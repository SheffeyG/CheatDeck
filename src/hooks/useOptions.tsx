import type { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import { createContext, type FC, type ReactNode, useContext, useEffect, useState } from "react";

import { LaunchOptions, type LaunchOptionsEditFailure, type LaunchOptionsEditResult } from "../domain/launchOptions";
import { logger } from "../utils/logger";

interface OptionsContextProps {
  appid: number;
  command: string;
  options: LaunchOptions;
  editFailure?: LaunchOptionsEditFailure;
  applyEdit: (result: LaunchOptionsEditResult) => void;
}

interface LoadedOptions {
  appid: number;
  command: string;
  options: LaunchOptions;
}

const OptionsContext = createContext<OptionsContextProps | undefined>(undefined);

export const OptionsProvider: FC<{
  children: ReactNode;
  appid: number;
}> = ({ children, appid }) => {
  const [loaded, setLoaded] = useState<LoadedOptions>();
  const [editFailure, setEditFailure] = useState<LaunchOptionsEditFailure>();

  useEffect(() => {
    if (!appid) {
      logger.warning("Invalid appid:", appid);
      return;
    }

    let active = true;
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(appid, (detail: AppDetails) => {
      if (!active) return;
      if (!detail) {
        logger.error("Invalid AppDetails:", detail);
        return;
      }
      setLoaded({
        appid,
        command: detail.strShortcutExe ?? "",
        options: LaunchOptions.parse(detail.strLaunchOptions ?? ""),
      });
      setEditFailure(undefined);
    });

    const timeoutId = setTimeout(unregister, 1000);
    return () => {
      active = false;
      clearTimeout(timeoutId);
      unregister();
    };
  }, [appid]);

  if (!loaded || loaded.appid !== appid) {
    return <div>Loading options...</div>;
  }

  const applyEdit = (result: LaunchOptionsEditResult) => {
    if (result.ok) {
      setLoaded((current) => (current?.appid === appid ? { ...current, options: result.value } : current));
      setEditFailure(undefined);
    } else {
      setEditFailure(result.error);
    }
  };

  return <OptionsContext.Provider value={{ ...loaded, editFailure, applyEdit }}>{children}</OptionsContext.Provider>;
};

export const useOptions = (): OptionsContextProps => {
  const context = useContext(OptionsContext);
  if (!context) throw new Error("useOptions must be used within an OptionsProvider");
  return context;
};
