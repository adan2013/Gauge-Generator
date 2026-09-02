import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createRectangleLayer,
} from "@/features/project/factories/project-factories";
import { getRectangleNumericPropertyDefinitions } from "./planar-shape-properties";

describe("Planar shape properties", () => {
  it("adds shared shape border width and Rectangle corner radius", () => {
    const project = createProject();
    const range = createRange({ centerX: 30, centerY: 80 });
    const layer = createRectangleLayer(range.id, project.canvas);
    const definitions = getRectangleNumericPropertyDefinitions(layer, project.canvas, range);

    expect(definitions.slice(-2).map(({ key }) => key)).toEqual([
      "borderWidthMm",
      "cornerRadiusPercent",
    ]);
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
