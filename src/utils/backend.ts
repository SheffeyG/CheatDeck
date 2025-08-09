import {
  callable,
  FilePickerRes,
  FileSelectionType,
  openFilePicker,
  ToastData,
  toaster,
} from "@decky/api";

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

const envGetEnv = callable<[string], string>("get_env");
const settingsGetSettings = callable<[{ key: string; defaults: unknown }], unknown>("settings_getSetting");
const settingsSetSettings = callable<[{ key: string; value: unknown }], unknown>("settings_setSetting");
const settingsCommit = callable<[], unknown>("settings_commit");

export class Backend {
  static async getEnv(env: string) {
    const output = await envGetEnv(env);
    return output;
  }

  static async getSetting(key: string, defaults: unknown) {
    const output = await settingsGetSettings({ key, defaults });
    return output;
  }

  static async setSetting(key: string, value: unknown) {
    const output = await settingsSetSettings({ key, value });
    return output;
  }

  static async commitSettings() {
    const output = await settingsCommit();
    return output;
  }

  static openFilePicker(
    startPath: string,
    includeFiles?: boolean,
    validFileExtensions?: string[],
    filter?: FilePickerFilter,
    defaultHidden?: boolean,
  ): Promise<FilePickerRes> {
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
  }

  static sendNotice(msg: string) {
    const toastData: ToastData = {
      title: "CheatDeck",
      body: msg,
      duration: 2000,
      playSound: true,
      showToast: true,
    };
    toaster.toast(toastData);
  }
};
