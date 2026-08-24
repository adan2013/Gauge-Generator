import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocsSidebar } from "@/app/docs/docs-sidebar";

describe("DocsSidebar", () => {
  it("opens and closes the navigation drawer and lists supported languages", () => {
    render(
      <DocsSidebar
        closeLabel="Close documentation navigation"
        items={[{ depth: 2, id: "interface", label: "Interface" }]}
        languageLabel="Language"
        locale="en"
        navigationLabel="Table of contents"
        openLabel="Open documentation navigation"
        tableOfContentsLabel="On this page"
      />,
    );

    const openButton = screen.getByRole("button", { name: "Open documentation navigation" });
    expect(openButton.getAttribute("aria-expanded")).toBe("false");
    expect((screen.getByRole("combobox", { name: "Language" }) as HTMLSelectElement).value).toBe(
      "en",
    );

    fireEvent.click(openButton);
    expect(openButton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getAllByRole("button", { name: "Close documentation navigation" })[1]);
    expect(openButton.getAttribute("aria-expanded")).toBe("false");
  });
});
