export const SUPPORTED_LANGUAGES = [
  { locale: "en", name: "English" },
  { locale: "pl", name: "Polski" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number]["locale"];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LANGUAGES.some((language) => language.locale === locale);
}
