import { callable } from "@decky/api";
import { v4 as uuid } from "uuid";

/* Backend bridge functions */

async function getEnv(env: string) {
  const callback = callable<[string], string>("get_env");
  return await callback(env);
}

async function getSetting(key: string, defaults: unknown) {
  const callback = callable<[{ key: string; defaults: unknown }], unknown>("get_setting");
  return await callback({ key, defaults });
}

async function setSetting(key: string, value: unknown) {
  const callback = callable<[{ key: string; value: unknown }], unknown>("set_setting");
  return await callback({ key, value });
}

/* Frontend exported functions */

export const getHomePath = async (): Promise<string> => {
  return await getEnv("DECKY_USER_HOME");
};

export const getCustomOptions = async (): Promise<CustomOption[]> => {
  const savedOpt = await getSetting("CustomOptions", []) as CustomOption[];
  const optsWithId = savedOpt.map(option => ({ ...option, id: uuid() }));
  return optsWithId;
};

export const setCustomOptions = async (data: CustomOption[]): Promise<void> => {
  const optsWithoutId = data.map(({ id, ...rest }) => rest);
  await setSetting("CustomOptions", optsWithoutId);
};

export const getShowPreview = async (): Promise<boolean> => {
  return await getSetting("ShowPreview", false) as boolean;
};

export const setShowPreview = async (value: boolean): Promise<void> => {
  await setSetting("ShowPreview", value);
};
