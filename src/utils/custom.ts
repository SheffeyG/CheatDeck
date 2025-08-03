import { v4 as uuidv4 } from "uuid";

import { Backend } from "./backend";
import logger from "./logger";

export type ParamType = 'env' | 'flag' | 'keyvalue';

export interface CustomOption {
  id: string;
  label: string;
  type: ParamType;
  position: 'before' | 'after';
  key: string;
  value?: string;  // flag type has no value
}

export const getCustomOptions = async (): Promise<CustomOption[]> => {
  const savedOpt = await Backend.getSetting("CustomOptions", []) as CustomOption[];

  const optsWithId = savedOpt.map(option => ({
    ...option,
    id: uuidv4(),
  }));

  logger.info(`Load user settings:\n${JSON.stringify(optsWithId, null, 2)}`);
  return optsWithId;
};

export const setCustomOptions = async (data: CustomOption[]): Promise<void> => {
  const optsWithoutId = data.map(({ id, ...rest }) => rest);
  await Backend.setSetting("CustomOptions", optsWithoutId);
  logger.info(`Saved user settings:\n${JSON.stringify(optsWithoutId, null, 2)}`);
};

export const getEmptyCustomOption = (): CustomOption => {
  return {
    id: uuidv4(),
    label: "",
    type: "env",
    position: "before",
    key: "",
    value: ""
  };
};
