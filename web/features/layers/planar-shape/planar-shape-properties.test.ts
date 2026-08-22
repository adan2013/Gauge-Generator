import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createRectangleLayer,
} from "@/features/project/factories/project-factories";
import { getRectangleNumericPropertyDefinitions } from "./planar-shape-properties";

describe("Planar shape properties", () => {
  it("shares millimetre geometry and adds Rectangle corner radius", () => {
    const project = createProject();
    const range = createRange({ centerX: 30, centerY: 80 });
    const layer = createRectangleLayer(range.id, project.canvas);
    const definitions = getRectangleNumericPropertyDefinitions(layer, project.canvas, range);

    expect(definitions.map(({ key }) => key)).toEqual([
      "offsetXMm",
      "offsetYMm",
      "widthMm",
      "heightMm",
      "rotationDegrees",
      "borderWidthMm",
      "cornerRadiusPercent",
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
    expect(definitions.find(({ key }) => key === "borderWidthMm")).toMatchObject({
      max: Math.min(project.canvas.widthMm, project.canvas.heightMm) / 2,
      step: 0.1,
      snap: "none",
    });
    expect(definitions.find(({ key }) => key === "cornerRadiusPercent")).toMatchObject({
      min: 0,
      max: 50,
      unit: "percent",
    });
  });
});
