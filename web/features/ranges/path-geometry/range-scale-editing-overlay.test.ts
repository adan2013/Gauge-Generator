import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { getRangeScaleEditingOverlay } from "./range-scale-editing-overlay";

describe("getRangeScaleEditingOverlay", () => {
  it("renders the active value interval in red and both inactive complements in gray", () => {
    const overlay = getRangeScaleEditingOverlay({
      radius: 40,
      range: createRange({ angleStart: 0, openingAngle: 90 }),
      valueStart: 25,
      valueEnd: 75,
    });

    expect(overlay.filter((primitive) => primitive.segment === "inactive")).toHaveLength(2);
    expect(overlay.filter((primitive) => primitive.tone === "muted")).toHaveLength(2);
    expect(overlay.filter((primitive) => primitive.segment === "active")).toHaveLength(1);
    expect(overlay.filter((primitive) => primitive.tone === "accent")).toHaveLength(1);
  });

  it("omits inactive paths when the layer uses the full Range", () => {
    const overlay = getRangeScaleEditingOverlay({
      radius: 40,
      range: createRange({ angleStart: 0, openingAngle: 90 }),
      valueStart: 0,
      valueEnd: 100,
    });

    expect(overlay.some((primitive) => primitive.segment === "inactive")).toBe(false);
    expect(overlay.some((primitive) => primitive.segment === "active")).toBe(true);
  });

  it("places the active path at the mapped end of a descending Range", () => {
    const overlay = getRangeScaleEditingOverlay({
      radius: 40,
      range: createRange({
        angleStart: 0,
        openingAngle: 90,
        valueDirection: "descending",
      }),
      valueStart: 0,
      valueEnd: 25,
    });

    const activePath = overlay.find((primitive) => primitive.segment === "active");
    expect(activePath).toMatchObject({ kind: "path", tone: "accent" });
    expect(activePath?.kind === "path" ? activePath.d : "").toMatch(
      /^M 75\.307 96\.955 A 40 40 0 0 1 60 100$/,
    );
  });
});
