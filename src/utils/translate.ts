import { useMemo } from "react";

import * as en from "../data/i18n/en.json";
import * as zhCn from "../data/i18n/zh-cn.json";
import logger from "./logger";

type Language = { [key: string]: string };
type Languages = { [key: string]: Language };

const languages: Languages = { zhCn, en };

function getCurrentLangCode(): string {
  const steamLang = window.LocalizationManager.m_rgLocalesToUse[0];
  const langCode = steamLang.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
  logger.info(`LanguageCode: ${langCode}`);
  return langCode;
}

function translate() {
  const langCode: string = useMemo(() => getCurrentLangCode(), []);
  const lang: Language = languages[langCode] ?? languages.en;
  return function (label: string, defaultString: string): string {
    return lang[label] ?? defaultString;
  };
}

export default translate;
