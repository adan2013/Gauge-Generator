import { afterEach, describe, expect, it, vi } from "vitest";
import { queryLocalFontFamilies, uniqueFontFamilies } from "./local-font-access";

const originalQueryLocalFonts = Object.getOwnPropertyDescriptor(window, "queryLocalFonts");

afterEach(() => {
  if (originalQueryLocalFonts)
    Object.defineProperty(window, "queryLocalFonts", originalQueryLocalFonts);
  else Reflect.deleteProperty(window, "queryLocalFonts");
});

describe("local font access", () => {
  it("deduplicates, trims, and sorts font families", () => {
    expect(
      uniqueFontFamilies([
        { family: "Verdana" },
        { family: " Avenir Next " },
        { family: "Verdana" },
        { family: "" },
      ]),
    ).toEqual(["Avenir Next", "Verdana"]);
  });

  it("loads installed family names through the browser API", async () => {
    Object.defineProperty(window, "queryLocalFonts", {
      configurable: true,
      value: vi.fn().mockResolvedValue([{ family: "Verdana" }, { family: "Verdana" }]),
    });

    await expect(queryLocalFontFamilies()).resolves.toEqual({
      families: ["Verdana"],
      status: "loaded",
    });
  });

  it("reports unsupported browsers and denied permission", async () => {
    expect(await queryLocalFontFamilies()).toEqual({ families: [], status: "unsupported" });

    Object.defineProperty(window, "queryLocalFonts", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError")),
    });
    expect(await queryLocalFontFamilies()).toEqual({ families: [], status: "denied" });
  });
});
