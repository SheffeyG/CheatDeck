import logger from './logger'
import { Backend } from './backend'

export interface SettingsProps {
  cheatPath: string,
}

export const defaultSettings: SettingsProps = {
  cheatPath: "/home/deck"
}

export class SettingsManager {

  static async saveToFile(userSettings: SettingsProps) {
    let settings = userSettings
    let promises = Object.keys(settings).map(key => {
      return Backend.setSetting(key, settings[key])
    })
    Promise.all(promises).then(async () => {
      await Backend.commitSettings()
    })
    logger.info(`Saved user settings:\n${JSON.stringify(settings, null, 2)}`)
  }

  static async loadFromFile() {
    let userSettings: {[key:string]: any} = {}
    let validSettings = defaultSettings
    for (let key in validSettings) {
      userSettings[key] = await Backend.getSetting(key, validSettings[key])
    }
    logger.info(`Loaded user settings:\n${JSON.stringify(userSettings, null, 2)}`)
    return userSettings
  }
}
