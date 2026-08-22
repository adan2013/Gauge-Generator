import { describe, expect, it } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { getIconNumericPropertyDefinitions } from "./icon-properties";

describe("Icon properties", () => {
  it("derives dimensions, stroke, and position limits from the canvas", () => {
    const canvas = { ...createProject().canvas, widthMm: 100, heightMm: 60 };
    const range = createRange({ centerX: 30, centerY: 20 });
    const definitions = getIconNumericPropertyDefinitions(
      createIconLayer(range.id, canvas),
      canvas,
      range,
    );

    expect(definitions.find(({ key }) => key === "offsetXMm")).toMatchObject({
      min: -30,
      max: 70,
    });
    expect(definitions.find(({ key }) => key === "widthMm")).toMatchObject({ max: 200 });
    expect(definitions.find(({ key }) => key === "heightMm")).toMatchObject({ max: 120 });
    expect(definitions.find(({ key }) => key === "strokeWidthMm")).toMatchObject({ max: 30 });
    expect(definitions.find(({ key }) => key === "rotationDegrees")).toMatchObject({
      integerOnly: true,
      min: 0,
      max: 359,
    });
  });
});
