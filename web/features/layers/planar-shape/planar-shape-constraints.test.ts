import { describe, expect, it } from "vitest";
import {
  createEllipseLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import {
  constrainPlanarShapeToCanvas,
  getPlanarShapeValidationIssues,
} from "./planar-shape-constraints";

describe("planar shape canvas constraints", () => {
  const canvas = createProject().canvas;
  const range = createRange({ centerX: 30, centerY: 80 });

  it("adds the border-width limit to the shared geometry constraints", () => {
    const baseLayer = createEllipseLayer(range.id, canvas);
    const layer = {
      ...baseLayer,
      style: {
        ...baseLayer.style,
        borderWidthMm: Math.min(canvas.widthMm, canvas.heightMm) / 2 + 1,
      },
    };

    expect(getPlanarShapeValidationIssues(layer, canvas, range)).toEqual([
      expect.objectContaining({ path: "style.borderWidthMm" }),
    ]);
    expect(constrainPlanarShapeToCanvas(layer, range, canvas)).toMatchObject({
      style: {
        borderWidthMm: Math.min(canvas.widthMm, canvas.heightMm) / 2,
      },
    });
  });
});
