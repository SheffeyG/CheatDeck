import logger from './logger'
import { Backend } from './backend'
import { DropdownOption } from 'decky-frontend-lib';

// Gamesettings
export interface GameSettingsProps {
  enableCheat: boolean,
  enableLang: boolean,
  cheatPath: string,
  langCode: string,
}

export const defaultGameSettings: GameSettingsProps = {
  enableCheat: false,
  enableLang: false,
  cheatPath: "Choose the executable file of your cheat",
  langCode: "zh_CN.utf8",
}

export const defaultLangCodes: DropdownOption[] = [
  { label: "简体中文", data: "zh_CN.utf8" },
  { label: "繁体中文", data: "zh_TW.utf8" },
]

// Content
export interface SettingsProps {
  defaultCheatPath: string,
  defaultLangCode: DropdownOption,
  langCodeSet: DropdownOption[]
}

export const defaultSettings: SettingsProps = {
  defaultCheatPath: "/home/deck",
  defaultLangCode: { label: "简体中文", data: "zh_CN.utf8" },
  langCodeSet: [
    { label: "简体中文", data: "zh_CN.utf8" },
    { label: "繁体中文", data: "zh_TW.utf8" },
  ]
}

export class SettingsManager {

  static async saveToFile(userSettings: SettingsProps) {
    const settings = userSettings
    const promises = Object.keys(settings).map(key => {
      return Backend.setSetting(key, settings[key])
    })
    await Promise.all(promises);
    await Backend.commitSettings();

    logger.info(`Saved user settings:\n${JSON.stringify(userSettings, null, 2)}`)
  }

  static async loadFromFile() {
    let userSettings: SettingsProps = defaultSettings
    let validSettings = defaultSettings
    for (let key in validSettings) {
      userSettings[key] = await Backend.getSetting(key, validSettings[key])
    }
    logger.info(`Loaded user settings:\n${JSON.stringify(userSettings, null, 2)}`)
    return userSettings
  }
}
