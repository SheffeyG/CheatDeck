import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCustomOptions as loadCustomOptions,
  getShowPreview as loadShowPreview,
  setCustomOptions as saveCustomOptions,
  setShowPreview as saveShowPreview,
} from "../utils/backend";
import logger from "../utils/logger";

interface SettingsContextType {
  showPreview: boolean;
  customOptions: CustomOption[];
  setShowPreview: (value: boolean) => void;
  setCustomOptions: (options: CustomOption[]) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  showPreview: false,
  customOptions: [],
  setShowPreview: () => { },
  setCustomOptions: () => { },
});

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [loadedShowPreview, loadedCustomOptions] = await Promise.all([
          loadShowPreview(),
          loadCustomOptions(),
        ]);
        setShowPreview(loadedShowPreview);
        setCustomOptions(loadedCustomOptions);
        setIsInitialized(true);
      } catch (error) {
        logger.error("Failed to initialize settings", error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const saveSettings = async (value: boolean) => {
      try {
        await saveShowPreview(value);
      } catch (error) {
        logger.error("Failed to save ShowPreview setting", error);
      }
    };
    saveSettings(showPreview);
  }, [showPreview, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const saveSettings = async (value: CustomOption[]) => {
      try {
        await saveCustomOptions(value);
      } catch (error) {
        logger.error("Failed to save CustomOptions setting", error);
      }
    };
    saveSettings(customOptions);
  }, [customOptions, isInitialized]);

  const value: SettingsContextType = {
    showPreview,
    setShowPreview,
    customOptions,
    setCustomOptions,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
