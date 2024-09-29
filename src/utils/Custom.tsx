import { Backend } from "./Backend";
import logger from "./Logger";
import { v4 as uuidv4 } from "uuid";

export interface CustomOption {
  id: string;
  label: string;
  field: string;
  value: string;
}

export const getCustomOptions = async () => {
  const savedOpt = await Backend.getSetting("CustomOptions", []) as CustomOption[];

  const optsWithId = savedOpt.map(option => ({
    ...option,
    id: uuidv4(),
  }));

  logger.info(`Load user settings:\n${JSON.stringify(optsWithId, null, 2)}`);
  return optsWithId;
};

export const setCustomOptions = async (data: CustomOption[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const optsWithoutId = data.map(({ id, ...rest }) => rest);
  const optList = await Backend.setSetting("CustomOptions", optsWithoutId);
  logger.info(`Set user settings:\n${JSON.stringify(optList, null, 2)}`);
};

export const getEmptyCusOpt = () => {
  const emptyOpt: CustomOption = {
    id: uuidv4(),
    label: "",
    field: "",
    value: "",
  };
  return emptyOpt;
};
