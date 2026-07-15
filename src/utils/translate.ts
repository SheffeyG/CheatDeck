import * as de from "../data/locales/de.json";
import * as en from "../data/locales/en.json";
import * as fr from "../data/locales/fr.json";
import * as ja from "../data/locales/ja.json";
import * as ko from "../data/locales/ko.json";
import * as ru from "../data/locales/ru.json";
import * as zhCn from "../data/locales/zh-cn.json";
import * as zhTw from "../data/locales/zh-tw.json";
import { logger } from "./logger";

type Lang = { [key: string]: string };
type Languages = { [key: string]: Lang };

const languages: Languages = {
  de,
  en,
  fr,
  ja,
  ko,
  ru,
  zhCn,
  zhTw,
};

function getCurrentLangCode(): string {
  const steamLang = window.LocalizationManager?.m_rgLocalesToUse?.[0] ?? "en";
  const langCode = steamLang.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  logger.info(`LanguageCode: ${langCode}`);
  return langCode;
}

function translate() {
  const langCode: string = getCurrentLangCode();
  const lang: Lang = languages[langCode] ?? languages.en;
  return (label: string, defaultString: string): string => lang[label] ?? defaultString;
}

export const t = translate();
