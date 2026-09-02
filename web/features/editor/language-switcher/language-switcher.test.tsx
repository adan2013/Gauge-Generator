import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { localeFromCookieValue, LOCALE_COOKIE_NAME, setLocaleCookie } from "@/i18n/locale-cookie";
import { projectActions } from "@/store/project-slice";
import { makeStore } from "@/store/store";
import { renderEditor } from "@/test/render-editor";
import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  it("opens the language modal and presents the current language and contribution link", () => {
    renderEditor(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "Language: English" }));

    expect(screen.getByRole("heading", { name: "Language" })).toBeTruthy();
    expect(screen.getByText("Selected")).toBeTruthy();
    expect(screen.getByRole("link", { name: "GitHub" }).getAttribute("href")).toBe(
      "https://github.com/adan2013/Gauge-Generator",
    );
  });

  it("closes the modal when the current language is selected", () => {
    renderEditor(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Language: English" }));

    fireEvent.click(screen.getByRole("button", { name: "Select English" }));

    expect(screen.queryByRole("heading", { name: "Language" })).toBeNull();
  });

  it("switches languages without warning when the project has unsaved changes", () => {
    setLocaleCookie("en");
    const store = makeStore();
    renderEditor(<LanguageSwitcher />, store);
    act(() => store.dispatch(projectActions.addRange(createRange())));
    fireEvent.click(screen.getByRole("button", { name: "Language: English" }));

    fireEvent.click(screen.getByRole("button", { name: "Select Polski" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(
      localeFromCookieValue(
        document.cookie.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`))?.[1],
      ),
    ).toBe("pl");
    expect(store.getState().project.current.ranges).toHaveLength(1);
  });
});
