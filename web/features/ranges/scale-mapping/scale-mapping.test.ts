import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import type { ScaleDefinitionDto } from "@/features/project/project-dto/project-dto";
import { normalizedPositionToValue, valueToNormalizedPosition } from "./scale-mapping";

describe("scale mapping", () => {
  it("maps configured linear, logarithmic, and custom midpoint values to the same position", () => {
    const ranges = [
      createRange({ scaleDefinition: { mode: "linear", start: 1, end: 19 } }),
      createRange({
        scaleDefinition: {
          mode: "logarithmic",
          start: 1,
          end: 100,
          detailEmphasis: "low-values",
        },
      }),
      createRange({
        scaleDefinition: {
          mode: "custom",
          points: [
            { value: 1, position: 0 },
            { value: 10, position: 0.5 },
            { value: 100, position: 1 },
          ],
        },
      }),
    ];

    expect(valueToNormalizedPosition(ranges[0], 10)).toBeCloseTo(0.5);
    expect(valueToNormalizedPosition(ranges[1], 10)).toBeCloseTo(0.5);
    expect(valueToNormalizedPosition(ranges[2], 10)).toBeCloseTo(0.5);
  });

  it("reverses effective linear, logarithmic, and custom positions", () => {
    const mappings: { definition: ScaleDefinitionDto; value: number }[] = [
      { definition: { mode: "linear", start: 0, end: 100 }, value: 20 },
      {
        definition: {
          mode: "logarithmic",
          start: 1,
          end: 10,
          detailEmphasis: "low-values",
        },
        value: 2,
      },
      {
        definition: {
          mode: "custom",
          points: [
            { value: 0, position: 0 },
            { value: 50, position: 0.2 },
            { value: 100, position: 1 },
          ],
        },
        value: 25,
      },
    ];

    for (const mapping of mappings) {
      const ascending = createRange({
        valueDirection: "ascending",
        scaleDefinition: mapping.definition,
      });
      const descending = { ...ascending, valueDirection: "descending" } as const;

      expect(
        valueToNormalizedPosition(ascending, mapping.value) +
          valueToNormalizedPosition(descending, mapping.value),
      ).toBeCloseTo(1);
    }
  });

  it("assigns more arc space to the selected side of a logarithmic scale", () => {
    const lowValueDetail = createRange({
      scaleDefinition: {
        mode: "logarithmic",
        start: 1,
        end: 10,
        detailEmphasis: "low-values",
      },
    });
    const highValueDetail = createRange({
      scaleDefinition: {
        mode: "logarithmic",
        start: 1,
        end: 10,
        detailEmphasis: "high-values",
      },
    });

    expect(valueToNormalizedPosition(lowValueDetail, 2)).toBeGreaterThan(0.25);
    expect(valueToNormalizedPosition(highValueDetail, 2)).toBeLessThan(0.1);
    expect(valueToNormalizedPosition(lowValueDetail, 9)).toBeGreaterThan(0.9);
    expect(valueToNormalizedPosition(highValueDetail, 9)).toBeLessThan(0.75);
    expect(valueToNormalizedPosition(highValueDetail, 1)).toBe(0);
    expect(valueToNormalizedPosition(highValueDetail, 10)).toBe(1);
  });

  it("interpolates every segment of a custom curve", () => {
    const range = createRange({
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 20, position: 0.1 },
          { value: 100, position: 1 },
        ],
      },
    });

    expect(valueToNormalizedPosition(range, 0)).toBe(0);
    expect(valueToNormalizedPosition(range, 10)).toBeCloseTo(0.05);
    expect(valueToNormalizedPosition(range, 60)).toBeCloseTo(0.55);
    expect(valueToNormalizedPosition(range, 100)).toBe(1);
  });

  it("inverts linear, logarithmic, and custom mappings in both value directions", () => {
    const definitions: ScaleDefinitionDto[] = [
      { mode: "linear", start: 0, end: 100 },
      { mode: "logarithmic", start: 1, end: 100, detailEmphasis: "low-values" },
      { mode: "logarithmic", start: 1, end: 100, detailEmphasis: "high-values" },
      {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 30, position: 0.2 },
          { value: 100, position: 1 },
        ],
      },
    ];

    for (const definition of definitions) {
      for (const valueDirection of ["ascending", "descending"] as const) {
        const range = createRange({ scaleDefinition: definition, valueDirection });
        for (const value of [definition.mode === "logarithmic" ? 2 : 10, 50, 90]) {
          expect(
            normalizedPositionToValue(range, valueToNormalizedPosition(range, value)),
          ).toBeCloseTo(value);
        }
      }
    }
  });
});
