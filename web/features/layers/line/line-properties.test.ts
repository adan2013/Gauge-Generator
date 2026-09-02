import { describe, expect, it } from "vitest";
import {
  createLineLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { getLineNumericPropertyDefinitions } from "./line-properties";

describe("Line properties", () => {
  it("derives editor limits from the canvas", () => {
    const canvas = { ...createProject().canvas, widthMm: 100, heightMm: 60 };
    const range = createRange({ centerX: 30, centerY: 20 });
    const definitions = getLineNumericPropertyDefinitions(
      createLineLayer(range.id, canvas),
      canvas,
      range,
    );

    expect(definitions.find(({ key }) => key === "offsetXMm")).toMatchObject({
      min: -30,
      max: 70,
    });
    expect(definitions.find(({ key }) => key === "lengthMm")).toMatchObject({ max: 200 });
    expect(definitions.find(({ key }) => key === "strokeWidthMm")).toMatchObject({ max: 30 });
    expect(definitions.find(({ key }) => key === "rotationDegrees")).toMatchObject({
      integerOnly: true,
      min: 0,
      max: 359,
    });
  });
});
