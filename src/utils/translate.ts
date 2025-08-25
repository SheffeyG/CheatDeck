import * as de from "../data/i18n/de.json";
import * as en from "../data/i18n/en.json";
import * as fr from "../data/i18n/fr.json";
import * as ja from "../data/i18n/ja.json";
import * as ko from "../data/i18n/ko.json";
import * as ru from "../data/i18n/ru.json";
import * as zhCn from "../data/i18n/zh-cn.json";
import * as zhTw from "../data/i18n/zh-tw.json";
import logger from "./logger";

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
  const langCode = steamLang.replace(
    /-([a-z])/g, (_, letter: string) => letter.toUpperCase(),
  );
  logger.info(`LanguageCode: ${langCode}`);
  return langCode;
}

function translate() {
  const langCode: string = getCurrentLangCode();
  const lang: Lang = languages[langCode] ?? languages.en;
  return function (label: string, defaultString: string): string {
    return lang[label] ?? defaultString;
  };
}

const t = translate();

export default t;
