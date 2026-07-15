import { callable } from "@decky/api";

const getEnvironmentValue = callable<[string], string>("get_env");
const getSettingValue = callable<[{ key: string; defaults: unknown }], unknown>("get_setting");
const setSettingValue = callable<[{ key: string; value: unknown }], unknown>("set_setting");

export const backendClient = {
  getEnvironmentValue,

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    return (await getSettingValue({ key, defaults: defaultValue })) as T;
  },

  async setSetting<T>(key: string, value: T): Promise<void> {
    await setSettingValue({ key, value });
  },
};
