import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import logger from "../utils/logger";
import { Options } from "../utils/options";

interface OptionsContextProps {
  options: Options;
  setOptions: (options: Options) => void;
}

const OptionsContext = createContext<OptionsContextProps>({
  options: new Options(""),
  setOptions: () => {},
});

export const OptionsProvider: FC<{
  children: ReactNode;
  appid: number;
}> = ({ children, appid }) => {
  const [options, setOptions] = useState<Options | null>(null);

  useEffect(() => {
    if (!appid) {
      logger.warning("Invalid appid:", appid);
      return;
    }

    // Initialize options with the current app's launch options
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(
      appid,
      (detail: AppDetails) => {
        if (detail) {
          const savedOptions = new Options(detail.strLaunchOptions);
          setOptions(savedOptions);
        } else {
          logger.error("Invalid AppDetails:", detail);
        }
      },
    );

    // Unregister on unmount
    return () => unregister();
  }, [appid]);

  if (!options) {
    return <div>Loading options...</div>;
  }

  return (
    <OptionsContext.Provider value={{ options, setOptions }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = () => useContext(OptionsContext);
