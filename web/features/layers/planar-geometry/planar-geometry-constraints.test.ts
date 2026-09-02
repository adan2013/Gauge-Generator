import { describe, expect, it } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import {
  constrainPlanarGeometryToCanvas,
  getPlanarGeometryValidationIssues,
} from "./planar-geometry-constraints";

describe("planar geometry canvas constraints", () => {
  const canvas = createProject().canvas;
  const range = createRange({ centerX: 30, centerY: 80 });

  it("derives asymmetric offset bounds that keep the center inside the canvas", () => {
    expect(getCanvasOffsetBounds(canvas, range)).toEqual({
      offsetX: { min: -30, max: canvas.widthMm - 30 },
      offsetY: { min: -80, max: canvas.heightMm - 80 },
    });
  });

  it("validates and constrains shared center and dimensions", () => {
    const baseLayer = createIconLayer(range.id, canvas);
    const layer = {
      ...baseLayer,
      geometry: {
        ...baseLayer.geometry,
        offsetXMm: -31,
        offsetYMm: canvas.heightMm - 79,
        widthMm: canvas.widthMm * 2 + 1,
        heightMm: canvas.heightMm * 2 + 1,
      },
    };

    expect(getPlanarGeometryValidationIssues(layer, canvas, range)).toEqual([
      expect.objectContaining({ path: "geometry.offsetXMm" }),
      expect.objectContaining({ path: "geometry.offsetYMm" }),
      expect.objectContaining({ path: "geometry.widthMm" }),
      expect.objectContaining({ path: "geometry.heightMm" }),
    ]);
    expect(constrainPlanarGeometryToCanvas(layer, range, canvas).geometry).toMatchObject({
      offsetXMm: -30,
      offsetYMm: canvas.heightMm - 80,
      widthMm: canvas.widthMm * 2,
      heightMm: canvas.heightMm * 2,
    });
  });
});
