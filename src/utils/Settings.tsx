import { Backend } from "./Backend";
import logger from "./Logger";
import { v4 as uuidv4 } from "uuid";

export interface CustomOption {
  id: string;
  label: string;
  field: string;
  value: string;
}

const defaultOptions = [
  {
    label: "default",
    field: '',
    value: ''
  }
]


export const getCustomOptions = async () => {
  const customOptions = await Backend.getSetting("CustomOptions", defaultOptions) as CustomOption[];

  const updatedOptions = customOptions.map((option) => ({
    ...option,
    id: uuidv4(),
  }));

  logger.info(`Load user settings:\n${JSON.stringify(updatedOptions, null, 2)}`);
  return updatedOptions;
}

export const setCustomOptions = async (data: CustomOption[]) => {
  let optList = await Backend.setSetting("CustomOptions", data);
  logger.info(`Set user settings:\n${JSON.stringify(optList, null, 2)}`)
}