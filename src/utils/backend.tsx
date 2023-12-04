import { FileSelectionType, ServerAPI } from "decky-frontend-lib"

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;


export class Backend {
  static initialize(serverApi: ServerAPI) {
    this.serverAPI = serverApi
  }
  static serverAPI: ServerAPI
  
  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    console.debug(`[AutoSuspend] Calling backend function: ${functionName}`)
    let output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    return output.result
  }
  static async getSetting(key: string, defaults: any) {
    let output = await this.bridge("settings_getSetting", { key, defaults })
    return output
  }
  static async setSetting(key: string, value: any) {
    let output = await this.bridge("settings_setSetting", { key, value })
    return output
  }
  static async commitSettings() {
    let output = await this.bridge("settings_commit")
    return output
  }

  static openFilePicker = (
    startPath: string,
    validFileExtensions?: string[],
    includeFiles?: boolean,
    filter?: FilePickerFilter,
    defaultHidden?: boolean,
  ): Promise<{ path: string; realpath: string }> => {
    return new Promise(async (resolve, reject) => {
      await this.serverAPI.openFilePickerV2(
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
}