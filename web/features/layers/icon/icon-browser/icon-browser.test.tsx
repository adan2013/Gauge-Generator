import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { IconBrowser } from "./icon-browser";

describe("IconBrowser", () => {
  const props = {
    emptyHint: "Type to browse icons",
    noResultsLabel: "No icons",
    onChange: vi.fn(),
    poweredByLabel: "Powered by Lucide",
    searchAriaLabel: "Search Lucide icons",
    searchPlaceholder: "Search icons",
    selectedName: "gauge",
  };

  it("shows guidance and branding before a search instead of catalog examples", () => {
    renderEditor(<IconBrowser {...props} />);

    expect(screen.getByText("Type to browse icons")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Powered by Lucide" })).toMatchObject({
      href: "https://lucide.dev/",
      target: "_blank",
    });
    expect(screen.queryByRole("button", { name: "rainbow" })).toBeNull();
    expect(
      screen
        .getByText("gauge")
        .compareDocumentPosition(screen.getByRole("searchbox", { name: "Search Lucide icons" })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("searches the Lucide catalog and selects an icon by name", () => {
    const onChange = vi.fn();
    renderEditor(<IconBrowser {...props} onChange={onChange} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Lucide icons" }), {
      target: { value: "rainbow" },
    });
    fireEvent.click(screen.getByRole("button", { name: "rainbow" }));

    expect(onChange).toHaveBeenCalledWith("rainbow");
  });
});
