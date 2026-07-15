import { createContext, type FC, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

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

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);

  useEffect(() => {
    let active = true;

    settingsStorage
      .load()
      .then((loadedSettings) => {
        if (active) setSettings(loadedSettings);
      })
      .catch((error) => {
        logger.error("Failed to load plugin settings", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveShowPreview = useCallback(async (showPreview: boolean) => {
    setSettings((current) => ({ ...current, showPreview }));
    try {
      await settingsStorage.saveShowPreview(showPreview);
    } catch (error) {
      logger.error("Failed to save ShowPreview setting", error);
    }
  }, []);

  const saveSkipWineCheck = useCallback(async (skipWineCheck: boolean) => {
    setSettings((current) => ({ ...current, skipWineCheck }));
    try {
      await settingsStorage.saveSkipWineCheck(skipWineCheck);
    } catch (error) {
      logger.error("Failed to save SkipWineCheck setting", error);
    }
  }, []);

  const saveCustomOptions = useCallback(async (customOptions: CustomOption[]) => {
    setSettings((current) => ({ ...current, customOptions }));
    try {
      await settingsStorage.saveCustomOptions(customOptions);
    } catch (error) {
      logger.error("Failed to save CustomOptions setting", error);
    }
  }, []);

  const value = useMemo<SettingsContextType>(
    () => ({ ...settings, saveShowPreview, saveSkipWineCheck, saveCustomOptions }),
    [settings, saveShowPreview, saveSkipWineCheck, saveCustomOptions],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
