import { describe, expect, it } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { constrainIconToCanvas, getIconValidationIssues } from "./icon-constraints";

describe("Icon canvas constraints", () => {
  it("limits icon stroke using the active canvas", () => {
    const canvas = { ...createProject().canvas, widthMm: 100, heightMm: 60 };
    const range = createRange({ centerX: 30, centerY: 20 });
    const baseLayer = createIconLayer(range.id, canvas);
    const layer = {
      ...baseLayer,
      style: { ...baseLayer.style, strokeWidthMm: 31 },
    };

    expect(getIconValidationIssues(layer, canvas)).toEqual([
      expect.objectContaining({ path: "style.strokeWidthMm" }),
    ]);
    expect(constrainIconToCanvas(layer, range, canvas)).toMatchObject({
      style: { strokeWidthMm: 30 },
    });
  });
});
