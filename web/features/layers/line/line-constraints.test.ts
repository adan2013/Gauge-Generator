import { describe, expect, it } from "vitest";
import {
  createLineLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { constrainLineToCanvas, getLineValidationIssues } from "./line-constraints";

describe("Line canvas constraints", () => {
  it("limits center, length, and stroke using the active canvas", () => {
    const canvas = { ...createProject().canvas, widthMm: 100, heightMm: 60 };
    const range = createRange({ centerX: 30, centerY: 20 });
    const baseLayer = createLineLayer(range.id, canvas);
    const layer = {
      ...baseLayer,
      geometry: { ...baseLayer.geometry, offsetXMm: 71, offsetYMm: -21, lengthMm: 201 },
      style: { ...baseLayer.style, strokeWidthMm: 31 },
    };

    expect(getLineValidationIssues(layer, canvas, range)).toEqual([
      expect.objectContaining({ path: "geometry.offsetXMm" }),
      expect.objectContaining({ path: "geometry.offsetYMm" }),
      expect.objectContaining({ path: "geometry.lengthMm" }),
      expect.objectContaining({ path: "style.strokeWidthMm" }),
    ]);
    expect(constrainLineToCanvas(layer, range, canvas)).toMatchObject({
      geometry: { offsetXMm: 70, offsetYMm: -20, lengthMm: 200 },
      style: { strokeWidthMm: 30 },
    });
  });
});
