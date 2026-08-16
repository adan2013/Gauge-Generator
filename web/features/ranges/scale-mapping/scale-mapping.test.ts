import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { getScaleItemCount, getScaleValues } from "./scale-mapping";

describe("scale mapping", () => {
  it("includes a decimal-step endpoint despite floating-point representation", () => {
    expect(getScaleItemCount({ valueStart: 0, valueEnd: 0.7, valueStep: 0.1 })).toBe(8);
    expect(
      getScaleValues(
        { valueStart: 0, valueEnd: 0.7, valueStep: 0.1 },
        createRange({ scaleDefinition: { mode: "linear", start: 0, end: 0.7 } }),
      ),
    ).toHaveLength(8);
  });

  it("removes only a physically duplicated full-circle endpoint", () => {
    const range = createRange({
      openingAngle: 360,
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0.1 },
          { value: 60, position: 0.9 },
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
});
