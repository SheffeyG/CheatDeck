import de from "../data/locales/de.json";
import en from "../data/locales/en.json";
import fr from "../data/locales/fr.json";
import ja from "../data/locales/ja.json";
import ko from "../data/locales/ko.json";
import ru from "../data/locales/ru.json";
import zhCn from "../data/locales/zh-cn.json";
import zhTw from "../data/locales/zh-tw.json";
import { logger } from "./logger";

type TranslationKey = keyof typeof en;
type Language = Record<TranslationKey, string>;

const languages = {
  de,
  en,
  fr,
  ja,
  ko,
  ru,
  zhCn,
  zhTw,
} satisfies Record<string, Language>;

type LanguageCode = keyof typeof languages;

function getCurrentLangCode(): string {
  const steamLang = window.LocalizationManager?.m_rgLocalesToUse?.[0] ?? "en";
  const langCode = steamLang.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  logger.info(`LanguageCode: ${langCode}`);
  return langCode;
}

const langCode = getCurrentLangCode();
const language: Language = languages[langCode as LanguageCode] ?? languages.en;

export const t = (key: TranslationKey): string => language[key];
