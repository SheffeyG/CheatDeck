import { AppDetails } from "@decky/ui/dist/globals/steam-client/App";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  const [options, setOptions] = useState<Options>(new Options(""));

  useEffect(() => {
    // Initialize launch options from current game details
    const { unregister } = SteamClient.Apps.RegisterForAppDetails(
      appid,
      (detail: AppDetails) => {
        const savedOptions = new Options(detail.strLaunchOptions);
        setOptions(savedOptions);
      },
    );
    setTimeout(() => {
      unregister();
    }, 1000);
  }, [appid]);

  return (
    <OptionsContext.Provider value={{ options, setOptions }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = () => useContext(OptionsContext);
