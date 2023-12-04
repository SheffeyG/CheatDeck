import { ServerAPI } from 'decky-frontend-lib'
import logger from './logger'

export interface SettingsProps {
  cheatPath: string,
}

export const defaultSettings: SettingsProps = {
  cheatPath: "/"
}

export class BackendCtx {
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
    let output = await this.bridge("settings_getSetting", {key, defaults})
    return output
  }
  static async setSetting(key: string, value: any) {
    let output = await this.bridge("settings_setSetting", {key, value})
    return output
  }
  static async commitSettings() {
    let output = await this.bridge("settings_commit")
    return output
  }
}

export class SettingsManager {

  static async saveToFile(userSettings: SettingsProps) {
    let settings = userSettings
    let promises = Object.keys(settings).map(key => {
      return BackendCtx.setSetting(key, settings[key])
    })
    Promise.all(promises).then(async () => {
      await BackendCtx.commitSettings()
    })
    logger.info(`Saved user settings:\n${JSON.stringify(settings, null, 2)}`)
  }

  static async loadFromFile() {
    let userSettings: {[key:string]: any} = {}
    let validSettings = defaultSettings
    for (let key in validSettings) {
      userSettings[key] = await BackendCtx.getSetting(key, validSettings[key])
    }
    logger.info(`Loaded user settings:\n${JSON.stringify(userSettings, null, 2)}`)
    return userSettings
  }
}
