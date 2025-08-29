import { call } from "@decky/api";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import logger from "../utils/logger";

export const SettingsContext = createContext({});

type SettingsContextType = {
  set: (key: string, value: unknown, immediate?: boolean) => void;
  get: (key: string, fallback: unknown) => Promise<unknown>;
};

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [setting, setSetting] = useState<{ key: string; value: unknown }>();

  const save = useMemo(() => async (setting: { key: string; value: unknown }) => {
    logger.info("writing setting", setting);
    await call("set_setting", setting.key, setting.value);
  }, []);

  const set = useMemo(() => (key, value) => {
    return setSetting({ key, value });
  }, []) as SettingsContextType["set"];

  const get: SettingsContextType["get"] = useMemo(() => async (key, fallback) => {
    return await call("get_setting", key, fallback);
  }, []);

  useEffect(() => {
    if (setting) save(setting);
  }, [save, setting]);

  return (
    <SettingsContext.Provider value={{ set, get }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext) as SettingsContextType;

export default useSettings;
