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
  const customOptions = await Backend.getSetting("CustomOptions", []) as CustomOption[];

  // const updatedOptions = customOptions.map((option) => ({
  //   ...option,
  //   id: uuidv4(),
  // }));

  logger.info(`Load user settings:\n${JSON.stringify(customOptions, null, 2)}`);
  return customOptions;
}

export const setCustomOptions = async (data: CustomOption[]) => {
  const optionsWithoutId = data.map(({ id, ...rest }) => rest);
  let optList = await Backend.setSetting("CustomOptions", optionsWithoutId);
  logger.info(`Set user settings:\n${JSON.stringify(optList, null, 2)}`)
}