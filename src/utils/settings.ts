import logger from './logger'
import { Backend } from './backend'
import { DropdownOption } from 'decky-frontend-lib';

// GameSettings
export interface GameSettingsProps {
  enableCheat: boolean,
  enableLang: boolean,
  enableDxvk: boolean,
  cheatPath: string,
  langCode: string,
}

export const defaultGameSettings: GameSettingsProps = {
  enableCheat: false,
  enableLang: false,
  enableDxvk: false,
  cheatPath: "Choose the executable file of your cheat",
  langCode: "zh_CN.utf8",
}

export const defaultLangCodes: DropdownOption[] = [
  { label: "简体中文", data: "zh_CN.utf8" },
  { label: "繁體中文", data: "zh_TW.utf8" },
  { label: "English", data: "en_US.utf8" },
  { label: "日本語", data: "ja_JP.utf8" },
  { label: "Español", data: "es_ES.utf8" },
  { label: "Français", data: "fr_FR.utf8" },
  { label: "Deutsch", data: "de_DE.utf8" },
  { label: "Italiano", data: "it_IT.utf8" },
  { label: "한국어", data: "ko_KR.utf8" },
  { label: "Português", data: "pt_PT.utf8" },
  { label: "Русский", data: "ru_RU.utf8" },
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
    { label: "繁體中文", data: "zh_TW.utf8" },
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
