import { PanelSection } from "@decky/ui";
import { createContext, type FC, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

import type { CustomOption, SettingsSnapshot } from "../domain/settings";
import { settingsStorage } from "../infra/settingsStorage";
import { logger } from "../utils/logger";

interface SettingsContextType {
  showPreview: boolean;
  skipWineCheck: boolean;
  customOptions: CustomOption[];
  saveShowPreview: (value: boolean) => Promise<void>;
  saveSkipWineCheck: (value: boolean) => Promise<void>;
  saveCustomOptions: (options: CustomOption[]) => Promise<void>;
}

const defaultSettings: SettingsSnapshot = {
  showPreview: false,
  skipWineCheck: false,
  customOptions: [],
};

type SettingsState =
  | { status: "loading" }
  | { status: "ready"; value: SettingsSnapshot }
  | { status: "error"; value: SettingsSnapshot };

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SettingsState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    settingsStorage
      .load()
      .then((loadedSettings) => {
        if (active) setState({ status: "ready", value: loadedSettings });
      })
      .catch((error) => {
        logger.error("Failed to load plugin settings", error);
        if (active) setState({ status: "error", value: defaultSettings });
      });

    return () => {
      active = false;
    };
  }, []);

  const saveShowPreview = useCallback(async (showPreview: boolean) => {
    setState((current) =>
      current.status === "loading" ? current : { ...current, value: { ...current.value, showPreview } },
    );
    try {
      await settingsStorage.saveShowPreview(showPreview);
    } catch (error) {
      logger.error("Failed to save ShowPreview setting", error);
    }
  }, []);

  const saveSkipWineCheck = useCallback(async (skipWineCheck: boolean) => {
    setState((current) =>
      current.status === "loading" ? current : { ...current, value: { ...current.value, skipWineCheck } },
    );
    try {
      await settingsStorage.saveSkipWineCheck(skipWineCheck);
    } catch (error) {
      logger.error("Failed to save SkipWineCheck setting", error);
    }
  }, []);

  const saveCustomOptions = useCallback(async (customOptions: CustomOption[]) => {
    setState((current) =>
      current.status === "loading" ? current : { ...current, value: { ...current.value, customOptions } },
    );
    try {
      await settingsStorage.saveCustomOptions(customOptions);
    } catch (error) {
      logger.error("Failed to save CustomOptions setting", error);
    }
  }, []);

  if (state.status === "loading") return <PanelSection spinner={true} />;

  const value: SettingsContextType = { ...state.value, saveShowPreview, saveSkipWineCheck, saveCustomOptions };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
