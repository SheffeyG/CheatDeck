import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { logger, Options } from "../utils";

interface OptionsContextProps {
  appid: number;
  command: string;
  options: Options;
  setOptions: (options: Options) => void;
}

const OptionsContext = createContext<OptionsContextProps>({
  appid: 0,
  command: "",
  options: new Options(""),
  setOptions: () => { },
});

export const OptionsProvider: FC<{
  children: ReactNode;
  appid: number;
}> = ({ children, appid }) => {
  const cmd = useRef<string>("");
  const [options, setOptions] = useState<Options | null>(null);

  useEffect(() => {
    if (!appid) {
      logger.warning("Invalid appid:", appid);
      return;
    }

    // Initialize command and options with the current AppDetails
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(
      appid,
      (detail: AppDetails) => {
        if (!detail) {
          logger.error("Invalid AppDetails:", detail);
          return;
        }
        if (detail.strShortcutExe) cmd.current = detail.strShortcutExe;
        if (detail.strLaunchOptions) {
          const savedOptions = new Options(detail.strLaunchOptions);
          setOptions(savedOptions);
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

  const value = {
    appid,
    command: cmd.current,
    options,
    setOptions,
  };

  return (
    <OptionsContext.Provider value={value}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = () => useContext(OptionsContext);
