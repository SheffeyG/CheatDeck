import { callable, type FilePickerRes, FileSelectionType, openFilePicker, type ToastData, toaster } from "@decky/api";

const getEnvironmentValue = callable<[string], string>("get_env");
const getSettingValue = callable<[{ key: string; defaults: unknown }], unknown>("get_setting");
const setSettingValue = callable<[{ key: string; value: unknown }], unknown>("set_setting");

export const deckyBackend = {
  getEnvironmentValue,

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    return (await getSettingValue({ key, defaults: defaultValue })) as T;
  },

  async setSetting<T>(key: string, value: T): Promise<void> {
    await setSettingValue({ key, value });
  },
};

export const getHomePath = (): Promise<string> => deckyBackend.getEnvironmentValue("DECKY_USER_HOME");

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

export const browseFiles = (
  startPath: string,
  includeFiles?: boolean,
  validFileExtensions?: string[],
  filter?: FilePickerFilter,
  defaultHidden?: boolean,
): Promise<FilePickerRes> => {
  return new Promise((resolve, reject) => {
    openFilePicker(
      FileSelectionType.FILE,
      startPath,
      includeFiles,
      true,
      filter,
      validFileExtensions,
      defaultHidden,
      false,
    ).then(resolve, () => reject("User Canceled"));
  });
};

export const sendNotice = (msg: string) => {
  const toastData: ToastData = {
    title: "CheatDeck",
    body: msg,
    duration: 2000,
    playSound: true,
    showToast: true,
  };
  toaster.toast(toastData);
};
