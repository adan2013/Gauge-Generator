import { describe, expect, it } from "vitest";
import { localeFromCookieValue, LOCALE_COOKIE_NAME, setLocaleCookie } from "./locale-cookie";

describe("locale cookie", () => {
  it("accepts supported locales and falls back for invalid values", () => {
    expect(localeFromCookieValue("pl")).toBe("pl");
    expect(localeFromCookieValue("unknown")).toBe("en");
    expect(localeFromCookieValue(undefined)).toBe("en");
  });

  it("stores the locale for the whole application", () => {
    setLocaleCookie("pl");

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=pl`);
  });
});
