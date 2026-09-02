import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import {
  getRangeLayerIntervalPropertyDefinitions,
  getRangeLayerValuePropertyDefinitions,
} from "./range-layer-properties";

describe("Range-linked layer value properties", () => {
  it("derives the shared visible-sequence fields from the Range domain", () => {
    const definitions = getRangeLayerValuePropertyDefinitions(
      { valueStart: 0, valueEnd: 100, valueStep: 10 },
      createRange({
        scaleDefinition: {
          mode: "custom",
          points: [
            { value: -25, position: 0 },
            { value: 125, position: 1 },
          ],
        },
      }),
    );

    expect(definitions).toEqual([
      expect.objectContaining({
        integerOnly: true,
        key: "valueStart",
        min: -25,
        max: 100,
      }),
      expect.objectContaining({
        integerOnly: true,
        key: "valueEnd",
        min: 0,
        max: 125,
      }),
      expect.objectContaining({
        integerOnly: true,
        key: "valueStep",
        min: 1,
        max: 100,
      }),
    ]);
  });

  it("supports a non-zero interval without adding a step field", () => {
    const definitions = getRangeLayerIntervalPropertyDefinitions(
      { valueStart: 20, valueEnd: 80 },
      createRange(),
      1,
    );

    expect(definitions.map((definition) => definition.key)).toEqual(["valueStart", "valueEnd"]);
    expect(definitions[0]).toMatchObject({ max: 79 });
    expect(definitions[1]).toMatchObject({ min: 21 });
  });
});
