import {
  FileSelectionType,
  FilePickerRes,
  ToastData,
  callable,
  openFilePicker,
  toaster,
} from "@decky/api"

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

const settingsGetSettings = callable<[{key: string, defaults: any}], any>("settings_getSetting");
const settingsSetSettings = callable<[{key: string, value: any}], any>("settings_setSetting");
const settingsCommit = callable<[], any>("settings_commit");

export class Backend {
  static async getSetting(key: string, defaults: any) {
    let output = await settingsGetSettings({ key, defaults })
    return output
  }
  static async setSetting(key: string, value: any) {
    let output = await settingsSetSettings({ key, value })
    return output
  }
  static async commitSettings() {
    let output = await settingsCommit()
    return output
  }

  static openFilePicker = (
    startPath: string,
    includeFiles?: boolean,
    validFileExtensions?: string[],
    filter?: FilePickerFilter,
    defaultHidden?: boolean,
  ): Promise<FilePickerRes> => {
    return new Promise(async (resolve, reject) => {
      await openFilePicker(
        FileSelectionType.FILE,
        startPath,
        includeFiles,
        true,
        filter,
        validFileExtensions,
        defaultHidden,
        false
      ).then(resolve, () => reject('User Canceled'));
    });
  };

  static sendNotice = (msg: string) => {
    const toastData: ToastData = {
      title: "CheatDeck",
      body: msg,
      duration: 2000,
      playSound: true,
      showToast: true
    }
    toaster.toast(toastData);
  }
}