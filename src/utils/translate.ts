/* eslint-disable @typescript-eslint/no-require-imports */
import { useState } from "react";

const languages = {
  en: require("../data/i18n/en.json"),
  zh: require("../data/i18n/zh.json"),
};

type typeLang = keyof typeof languages;

function getCurrentLanguage(): typeLang {
  const steamLang = window.LocalizationManager.m_rgLocalesToUse[0];
  const lang = steamLang.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  ) as typeLang;
  return languages[lang] ? lang : "en";
}

function useTranslation() {
  const [lang] = useState(getCurrentLanguage());
  return function (label: string, defaultString: string): string {
    if (languages[lang]?.[label]?.length) {
      return languages[lang]?.[label];
    }
    else if (languages.en?.[label]?.length) {
      return languages.en?.[label];
    }
    else {
      return defaultString;
    }
  };
}

export default useTranslation;
