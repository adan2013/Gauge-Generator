import { describe, expect, it } from "vitest";
import {
  createLabelLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import {
  getLabelPointPropertyDefinitions,
  getLabelTextArcPropertyDefinitions,
} from "./label-properties";

describe("Label property definitions", () => {
  const canvas = createProject().canvas;
  const range = createRange({ centerX: 30, centerY: 80, radius: 30 });

  it("uses millimetres and Range-derived bounds for point offsets", () => {
    const layer = createLabelLayer(range.id);
    if (layer.layout.mode !== "point") throw new Error("Expected point layout");

    expect(getLabelPointPropertyDefinitions(layer.layout, canvas, range)[0]).toMatchObject({
      key: "offsetXMm",
      min: -30,
      max: canvas.widthMm - 30,
      snap: "distance",
      unit: "millimeters",
    });
  });

  it("uses Range values and effective-radius bounds for text paths", () => {
    const layout = {
      mode: "text-arc" as const,
      radiusOffsetMm: 0,
      valueStart: 0,
      valueEnd: 100,
      alignment: "center" as const,
      direction: "forward" as const,
    };
    const definitions = getLabelTextArcPropertyDefinitions(layout, range);

    expect(definitions.find((definition) => definition.key === "valueStart")).toMatchObject({
      min: 0,
      max: 99,
    });
    expect(definitions.find((definition) => definition.key === "radiusOffsetMm")).toMatchObject({
      min: -29.5,
      max: 30,
    });
  });
});
