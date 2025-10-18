import { call } from "@decky/api";
import { v4 as uuid } from "uuid";

export const getHomePath = async (): Promise<string> => {
  return await call("get_env", "DECKY_USER_HOME");
};

export const getCustomOptions = async (): Promise<CustomOption[]> => {
  const savedOpt = await call("get_settings", "CustomOptions", []) as CustomOption[];
  const optsWithId = savedOpt.map(option => ({ ...option, id: uuid() }));
  return optsWithId;
};

export const setCustomOptions = async (data: CustomOption[]): Promise<void> => {
  const optsWithoutId = data.map(({ id, ...rest }) => rest);
  await call("set_settings", "CustomOptions", optsWithoutId);
};

export const getShowPreview = async (): Promise<boolean> => {
  return await call("get_settings", "ShowPreview", false) as boolean;
};

export const setShowPreview = async (value: boolean): Promise<void> => {
  await call("set_settings", "ShowPreview", value);
};
