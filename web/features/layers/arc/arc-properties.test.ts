import { describe, expect, it } from "vitest";
import { createArcLayer, createRange } from "@/features/project/factories/project-factories";
import { getArcNumericPropertyDefinitions } from "./arc-properties";

describe("Arc properties", () => {
  it("defines a Range interval without a step and exposes dynamic geometry limits", () => {
    const range = createRange({ radius: 10 });
    const layer = createArcLayer(range.id, { valueStart: 20, valueEnd: 80 });
    const definitions = getArcNumericPropertyDefinitions(layer, range);

    expect(definitions.map((definition) => definition.key)).toEqual([
      "valueStart",
      "valueEnd",
      "radiusOffsetMm",
      "strokeWidthMm",
    ]);
    expect(definitions.find((definition) => definition.key === "valueStart")).toMatchObject({
      integerOnly: true,
      max: 79,
    });
    expect(definitions.find((definition) => definition.key === "valueEnd")).toMatchObject({
      integerOnly: true,
      min: 21,
    });
    expect(definitions.find((definition) => definition.key === "strokeWidthMm")).toMatchObject({
      min: 0.1,
      max: 20,
      step: 0.1,
    });
  });
});
