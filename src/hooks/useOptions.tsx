import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { logger, Options } from "../utils";

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
        if (detail && detail.strLaunchOptions !== undefined) {
          const savedOptions = new Options(detail.strLaunchOptions);
          setOptions(savedOptions);
        } else {
          logger.error("Invalid AppDetails:", detail);
        }
      },
    );

    // Unregister in 1s
    const timeoutId = setTimeout(() => {
      unregister();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      unregister();
    };
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
