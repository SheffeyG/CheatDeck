import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getShowPreview as loadShowPreview,
  setShowPreview as saveShowPreview,
} from "../utils/backend";
import logger from "../utils/logger";

interface SettingsContextType {
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  showPreview: false,
  setShowPreview: () => {},
});

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const loadedValue = await loadShowPreview();
        if (loadedValue !== showPreview) setShowPreview(loadedValue);
      } catch (error) {
        logger.error("Failed to load preview setting", error);
      }
    };
    loadSetting();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        await saveShowPreview(showPreview);
      } catch (error) {
        logger.error("Failed to save preview setting", error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [showPreview]);

  return (
    <SettingsContext.Provider value={{ showPreview, setShowPreview }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
