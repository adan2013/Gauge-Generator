import { describe, expect, it } from "vitest";
import {
  createEllipseLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { EllipseLayer } from "@/features/layers/ellipse/ellipse";
import { getPlanarGeometry } from "./planar-geometry";

describe("PlanarGeometryLayer", () => {
  const range = createRange();
  const project = createProject({ ranges: [range] });
  const layer = createEllipseLayer(range.id, project.canvas, {
    geometry: {
      offsetXMm: 0,
      offsetYMm: 0,
      widthMm: 40,
      heightMm: 20,
      rotationDegrees: 90,
    },
  });
  const context = { project, rangeById: new Map([[range.id, range]]) };

  it("places center, rotation, and bottom-right resize handles in rotated local axes", () => {
    expect(getPlanarGeometry(layer, range)).toMatchObject({
      center: { x: 60, y: 60 },
      rotationGuideStart: { x: 60, y: 60 },
      rotationHandle: { x: 72, y: 60 },
      sizeHandle: { x: 50, y: 80 },
    });
    expect(new EllipseLayer(layer).getHandles(context).map(({ id }) => id)).toEqual([
      "position",
      "rotation",
      "size",
    ]);
  });

  it("keeps the rotation handle at a fixed distance when the shape size changes", () => {
    const tallerLayer = {
      ...layer,
      geometry: { ...layer.geometry, widthMm: 100, heightMm: 100 },
    };

    expect(getPlanarGeometry(tallerLayer, range).rotationHandle).toEqual({ x: 72, y: 60 });
  });

  it("resizes in local axes after rotation", () => {
    const resized = new EllipseLayer(layer).applyHandleDrag(
      "size",
      { point: { x: 45, y: 90 }, shiftKey: false, altKey: false, snapDistanceMm: 1 },
      context,
    );

    expect(resized.geometry).toMatchObject({ widthMm: 60, heightMm: 30 });
  });

  it("moves relative to the Range center and normalizes rotation to 0 through 359", () => {
    const model = new EllipseLayer(layer);
    expect(
      model.applyHandleDrag(
        "position",
        { point: { x: 70, y: 45 }, shiftKey: false, altKey: false, snapDistanceMm: 1 },
        context,
      ).geometry,
    ).toMatchObject({ offsetXMm: 10, offsetYMm: -15 });
    expect(
      model.applyHandleDrag(
        "rotation",
        { point: { x: 50, y: 60 }, shiftKey: false, altKey: false, snapAngleDegrees: 1 },
        context,
      ).geometry.rotationDegrees,
    ).toBe(270);
  });

  it("keeps the center handle inside the canvas", () => {
    const moved = new EllipseLayer(layer).applyHandleDrag(
      "position",
      { point: { x: -20, y: 200 }, shiftKey: false, altKey: false, snapDistanceMm: 1 },
      context,
    );

    expect(moved.geometry).toMatchObject({ offsetXMm: -60, offsetYMm: 60 });
  });

  it("draws only the rotation guide from the top edge to its handle", () => {
    expect(new EllipseLayer(layer).getEditingOverlay(context)).toEqual([
      expect.objectContaining({
        id: "planar-rotation-guide",
        start: expect.objectContaining({ x: 60, y: 60 }),
        end: expect.objectContaining({ x: 72, y: 60 }),
      }),
    ]);
  });
});
