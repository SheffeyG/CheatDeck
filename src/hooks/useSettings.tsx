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
  getSkipWineCheck as backendGetSkipWineCheck,
  setCustomOptions as backendSetCustomOptions,
  setShowPreview as backendSetShowPreview,
  setSkipWineCheck as backendSetSkipWineCheck,
} from "../utils";
import { logger } from "../utils/logger";

interface SettingsContextType {
  showPreview: boolean;
  skipWineCheck: boolean;
  customOptions: CustomOption[];
  saveShowPreview: (value: boolean) => void;
  saveSkipWineCheck: (value: boolean) => void;
  saveCustomOptions: (options: CustomOption[]) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  showPreview: false,
  skipWineCheck: false,
  customOptions: [],
  saveShowPreview: () => {},
  saveSkipWineCheck: () => {},
  saveCustomOptions: () => {},
});

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const [skipWineCheck, setSkipWineCheck] = useState<boolean>(false);

  useEffect(() => {
    backendGetShowPreview()
      .then(setShowPreview)
      .catch((error) => {
        logger.error("Failed to load ShowPreview setting", error);
      });

    backendGetSkipWineCheck()
      .then(setSkipWineCheck)
      .catch((error) => {
        logger.error("Failed to load SkipWineCheck setting", error);
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

  const saveSkipWineCheck = (value: boolean) => {
    setSkipWineCheck(value);
    backendSetSkipWineCheck(value).catch((error) => {
      logger.error("Failed to save SkipWineCheck setting", error);
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
    skipWineCheck,
    customOptions,
    saveShowPreview,
    saveSkipWineCheck,
    saveCustomOptions,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
