import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { localeFromCookieValue, LOCALE_COOKIE_NAME } from "@/i18n/locale-cookie";

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  const locale = localeFromCookieValue(explicitLocale ?? cookieLocale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
