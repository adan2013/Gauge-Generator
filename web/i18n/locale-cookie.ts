import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from "@/i18n/locales";

export const LOCALE_COOKIE_NAME = "gauge-generator-locale";

const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function localeFromCookieValue(value: string | undefined): SupportedLocale {
  return value && isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function setLocaleCookie(locale: SupportedLocale) {
  document.cookie = [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    "path=/",
    `max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}`,
    "samesite=lax",
  ].join(";");
}
