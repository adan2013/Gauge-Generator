import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { MAX_GENERATED_SCALE_ITEMS } from "./scale-constants";
import {
  constrainScaleIntervalToRange,
  constrainScaleSequenceToRange,
  getScaleDistribution,
  getScaleItemCount,
  getScaleValues,
} from "./scale-sequence";

describe("scale sequence", () => {
  it("counts and generates an inclusive value sequence", () => {
    const sequence = { valueStart: 10, valueEnd: 35, valueStep: 10 };

    expect(getScaleItemCount(sequence)).toBe(3);
    expect(getScaleValues(sequence, createRange())).toEqual([10, 20, 30]);
  });

  it("caps generated items at the shared rendering limit", () => {
    const values = getScaleValues(
      { valueStart: 0, valueEnd: 1_000, valueStep: 1 },
      createRange({ scaleDefinition: { mode: "linear", start: 0, end: 1_000 } }),
    );

    expect(values).toHaveLength(MAX_GENERATED_SCALE_ITEMS);
    expect(values.at(-1)).toBe(MAX_GENERATED_SCALE_ITEMS - 1);
  });

  it("removes only a physically duplicated full-circle endpoint", () => {
    const range = createRange({
      openingAngle: 360,
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 60, position: 0.8 },
          { value: 100, position: 1 },
        ],
      },
    });

    expect(getScaleValues({ valueStart: 0, valueEnd: 60, valueStep: 60 }, range)).toEqual([0, 60]);
  });

  it("does not use a value-domain tolerance to remove a near-closing position", () => {
    const range = createRange({
      openingAngle: 360,
      scaleDefinition: { mode: "linear", start: 0, end: 995_000_000 },
    });

    const values = getScaleValues(
      { valueStart: 0, valueEnd: 990_000_000, valueStep: 10_000_000 },
      range,
    );

    expect(values.at(-1)).toBe(990_000_000);
  });

  it("returns ready-to-render positions and angles for every value", () => {
    const range = createRange({
      angleStart: 10,
      openingAngle: 180,
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 50, position: 0.25 },
          { value: 100, position: 1 },
        ],
      },
    });

    expect(getScaleDistribution({ valueStart: 0, valueEnd: 100, valueStep: 50 }, range)).toEqual([
      { value: 0, position: 0, angle: 10 },
      { value: 50, position: 0.25, angle: 55 },
      { value: 100, position: 1, angle: 190 },
    ]);
  });

  it("constrains only the visible sequence bounds to the Range domain", () => {
    const sequence = { valueStart: -20, valueEnd: 120, valueStep: 10, marker: "kept" } as const;

    expect(constrainScaleSequenceToRange(sequence, createRange())).toEqual({
      valueStart: 0,
      valueEnd: 100,
      valueStep: 10,
      marker: "kept",
    });
  });

  it("preserves a required minimum span when constraining a mapped interval", () => {
    expect(
      constrainScaleIntervalToRange(
        { valueStart: 100, valueEnd: 100, marker: "kept" },
        createRange(),
        1,
      ),
    ).toEqual({ valueStart: 99, valueEnd: 100, marker: "kept" });
  });
});
