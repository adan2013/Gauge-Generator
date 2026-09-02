import { describe, expect, it } from "vitest";
import { extractTableOfContents, headingId } from "@/app/docs/docs-markdown";

describe("docs markdown", () => {
  it("creates stable heading identifiers", () => {
    expect(headingId("Ranges: the foundation")).toBe("ranges-the-foundation");
    expect(headingId("Skala kresek {#tick-scale}")).toBe("tick-scale");
  });

  it("extracts second- and third-level headings for the table of contents", () => {
    const markdown = ["# Guide", "## Interface tour", "### Live preview", "Body"].join("\n");

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 2, id: "interface-tour", label: "Interface tour" },
      { depth: 3, id: "live-preview", label: "Live preview" },
    ]);
  });

  it("uses explicit identifiers without exposing them in translated labels", () => {
    const markdown = "### Skala numeryczna {#numeric-scale}";

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 3, id: "numeric-scale", label: "Skala numeryczna" },
    ]);
  });
});
