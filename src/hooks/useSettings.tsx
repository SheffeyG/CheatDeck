import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCustomOptions as backendGetCustomOptions,
  getShowPreview as backendGetShowPreview,
  setCustomOptions as backendSetCustomOptions,
  setShowPreview as backendSetShowPreview,
} from "../utils/backend";
import logger from "../utils/logger";

interface SettingsContextType {
  showPreview: boolean;
  customOptions: CustomOption[];
  saveShowPreview: (value: boolean) => void;
  saveCustomOptions: (options: CustomOption[]) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  showPreview: false,
  customOptions: [],
  saveShowPreview: () => { },
  saveCustomOptions: () => { },
});

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);

  useEffect(() => {
    backendGetShowPreview()
      .then(setShowPreview)
      .catch((error) => {
        logger.error("Failed to load ShowPreview setting", error);
      });

    backendGetCustomOptions()
      .then(setCustomOptions)
      .catch((error) => {
        logger.error("Failed to load CustomOptions setting", error);
      });
  }, []);

  const saveShowPreview = (value: boolean) => {
    setShowPreview(value);
    backendSetShowPreview(value).catch((error) => {
      logger.error("Failed to save ShowPreview setting", error);
    });
  };

  const saveCustomOptions = (value: CustomOption[]) => {
    setCustomOptions(value);
    backendSetCustomOptions(value).catch((error) => {
      logger.error("Failed to save CustomOptions setting", error);
    });
  };

  const value: SettingsContextType = {
    showPreview,
    saveShowPreview,
    customOptions,
    saveCustomOptions,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
