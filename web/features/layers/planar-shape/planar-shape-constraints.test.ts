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
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";

describe("planar shape canvas constraints", () => {
  const canvas = createProject().canvas;
  const range = createRange({ centerX: 30, centerY: 80 });

  it("derives asymmetric offset bounds that keep the center inside the canvas", () => {
    expect(getCanvasOffsetBounds(canvas, range)).toEqual({
      offsetX: { min: -30, max: canvas.widthMm - 30 },
      offsetY: { min: -80, max: canvas.heightMm - 80 },
    });
  });

  it("validates and constrains both center coordinates in one shared implementation", () => {
    const layer = createEllipseLayer(range.id, canvas, {
      geometry: {
        offsetXMm: -31,
        offsetYMm: canvas.heightMm - 79,
        widthMm: 20,
        heightMm: 20,
        rotationDegrees: 0,
      },
    });

    expect(getPlanarShapeValidationIssues(layer, canvas, range)).toEqual([
      expect.objectContaining({ path: "geometry.offsetXMm" }),
      expect.objectContaining({ path: "geometry.offsetYMm" }),
    ]);
    expect(constrainPlanarShapeToCanvas(layer, range, canvas).geometry).toMatchObject({
      offsetXMm: -30,
      offsetYMm: canvas.heightMm - 80,
    });
  });

  it("limits dimensions to twice the canvas and border width to half its shorter side", () => {
    const baseLayer = createEllipseLayer(range.id, canvas);
    const layer = {
      ...baseLayer,
      geometry: {
        ...baseLayer.geometry,
        widthMm: canvas.widthMm * 2 + 1,
        heightMm: canvas.heightMm * 2 + 1,
      },
      style: {
        ...baseLayer.style,
        borderWidthMm: Math.min(canvas.widthMm, canvas.heightMm) / 2 + 1,
      },
    };

    expect(getPlanarShapeValidationIssues(layer, canvas, range)).toEqual([
      expect.objectContaining({ path: "geometry.widthMm" }),
      expect.objectContaining({ path: "geometry.heightMm" }),
      expect.objectContaining({ path: "style.borderWidthMm" }),
    ]);
    expect(constrainPlanarShapeToCanvas(layer, range, canvas)).toMatchObject({
      geometry: {
        widthMm: canvas.widthMm * 2,
        heightMm: canvas.heightMm * 2,
      },
      style: {
        borderWidthMm: Math.min(canvas.widthMm, canvas.heightMm) / 2,
      },
    });
  });
});
