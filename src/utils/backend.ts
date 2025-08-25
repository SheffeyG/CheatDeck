import {
  callable,
  FilePickerRes,
  FileSelectionType,
  openFilePicker,
  ToastData,
  toaster,
} from "@decky/api";

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

export class Backend {
  static async getEnv(env: string) {
    const callback = callable<[string], string>("get_env");
    return await callback(env);
  }

  static async getSetting(key: string, defaults: unknown) {
    const callback = callable<[{ key: string; defaults: unknown }], unknown>("get_setting");
    return await callback({ key, defaults });
  }

  static async setSetting(key: string, value: unknown) {
    const callback = callable<[{ key: string; value: unknown }], unknown>("set_setting");
    return await callback({ key, value });
  }

  static async commitSettings() {
    const callback = callable<[], unknown>("commit_settings");
    return await callback();
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
