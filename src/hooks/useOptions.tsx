import { createContext, type FC, type ReactNode, useContext, useEffect, useState } from "react";

import { LaunchOptions, type LaunchOptionsEditFailure, type LaunchOptionsEditResult } from "../domain/launchOptions";
import { registerForAppDetails } from "../infra/steam";
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
  editFailure?: LaunchOptionsEditFailure;
}

const OptionsContext = createContext<OptionsContextProps | undefined>(undefined);

export const OptionsProvider: FC<{
  children: ReactNode;
  appid: number;
}> = ({ children, appid }) => {
  const [loaded, setLoaded] = useState<LoadedOptions>();

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
      setLoaded({
        appid,
        command: detail.strShortcutExe ?? "",
        options: LaunchOptions.parse(detail.strLaunchOptions),
      });
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

  const sourceOptions = loaded.options;
  const applyEdit = (result: LaunchOptionsEditResult) => {
    setLoaded((current) => {
      if (current?.appid !== appid || current.options !== sourceOptions) return current;
      return result.ok
        ? { ...current, options: result.value, editFailure: undefined }
        : { ...current, editFailure: result.error };
    });
  };

  return <OptionsContext.Provider value={{ ...loaded, applyEdit }}>{children}</OptionsContext.Provider>;
};

export const useOptions = (): OptionsContextProps => {
  const context = useContext(OptionsContext);
  if (!context) throw new Error("useOptions must be used within an OptionsProvider");
  return context;
};
