import enDictionary from "@/messages/en.json";
import trDictionary from "@/messages/tr.json";

import type { Locale } from "@/lib/i18n/settings";

const dictionaries = {
  tr: trDictionary,
  en: enDictionary,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
