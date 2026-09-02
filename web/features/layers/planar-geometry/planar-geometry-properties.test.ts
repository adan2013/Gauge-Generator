import { describe, expect, it } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { getPlanarGeometryNumericPropertyDefinitions } from "./planar-geometry-properties";

describe("planar geometry properties", () => {
  it("declares shared position, dimensions, and rotation once", () => {
    const project = createProject();
    const range = createRange({ centerX: 30, centerY: 80 });
    const layer = createIconLayer(range.id, project.canvas);
    const definitions = getPlanarGeometryNumericPropertyDefinitions(layer, project.canvas, range);

    expect(definitions.map(({ key }) => key)).toEqual([
      "offsetXMm",
      "offsetYMm",
      "widthMm",
      "heightMm",
      "rotationDegrees",
    ]);
    expect(definitions.find(({ key }) => key === "rotationDegrees")).toMatchObject({
      integerOnly: true,
      min: 0,
      max: 359,
    });
    expect(definitions.find(({ key }) => key === "offsetXMm")).toMatchObject({
      min: -30,
      max: project.canvas.widthMm - 30,
    });
    expect(definitions.find(({ key }) => key === "offsetYMm")).toMatchObject({
      min: -80,
      max: project.canvas.heightMm - 80,
    });
    expect(definitions.find(({ key }) => key === "widthMm")).toMatchObject({
      max: project.canvas.widthMm * 2,
    });
    expect(definitions.find(({ key }) => key === "heightMm")).toMatchObject({
      max: project.canvas.heightMm * 2,
    });
  });
});
