import { callable } from "@decky/api";
import { v4 as uuid } from "uuid";

import logger from "./logger";
import { ParsedParam } from "./options";

export interface CustomOption extends ParsedParam {
  id: string;
  label: string;
}

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

export const getHomePath = async (): Promise<string> => {
  return await getEnv("DECKY_USER_HOME");
};

export const getCustomOptions = async (): Promise<CustomOption[]> => {
  const savedOpt = await getSetting("CustomOptions", []) as CustomOption[];
  const optsWithId = savedOpt.map(option => ({ ...option, id: uuid() }));
  logger.info(`Load user settings:\n${JSON.stringify(optsWithId, null, 2)}`);
  return optsWithId;
};

export const setCustomOptions = async (data: CustomOption[]): Promise<void> => {
  const optsWithoutId = data.map(({ id, ...rest }) => rest);
  await setSetting("CustomOptions", optsWithoutId);
  logger.info(`Saved user settings:\n${JSON.stringify(optsWithoutId, null, 2)}`);
};

export const getShowPreview = async (): Promise<boolean> => {
  return await getSetting("ShowPreview", false) as boolean;
};

export const setShowPreview = async (value: boolean): Promise<void> => {
  await setSetting("ShowPreview", value);
};
