import { Backend } from "./Backend";
import logger from "./Logger";

export interface CustomOption {
  lable: string,
  desc: string,
  field: string,
  value: string
}

const defaultOptions = [
  {
    lable: "default",
    desc: 'default',
    field: '',
    value: ''
  }
]

export const getCustomOptions = async () => {
  const customOptions = await Backend.getSetting("CustomOptions", defaultOptions) as CustomOption[];
  logger.info(`Load user settings:\n${JSON.stringify(customOptions, null, 2)}`);
  return customOptions;
}

export const setCustomOptions = async (data: CustomOption[]) => {
  let optList = await Backend.setSetting("CustomOptions", data);
  logger.info(`Set user settings:\n${JSON.stringify(optList, null, 2)}`)
}