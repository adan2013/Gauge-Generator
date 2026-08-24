import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
