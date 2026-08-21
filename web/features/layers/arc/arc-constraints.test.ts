import { describe, expect, it } from "vitest";
import { createArcLayer, createRange } from "@/features/project/factories/project-factories";
import { constrainArcToRange, getArcGeometryBounds } from "./arc-constraints";

describe("Arc Range constraints", () => {
  it("derives thickness limits from the effective radius", () => {
    const range = createRange({ radius: 20 });
    const layer = createArcLayer(range.id, { radiusOffsetMm: -10 });

    expect(getArcGeometryBounds(layer, range)).toMatchObject({
      minRadiusOffsetMm: -19.95,
      maxRadiusOffsetMm: 20,
      maxStrokeWidthMm: 20,
    });
  });

  it("keeps a non-zero value interval and clamps thickness after Range changes", () => {
    const range = createRange({ radius: 20 });
    const layer = createArcLayer(range.id, {
      valueStart: 100,
      valueEnd: 100,
      radiusOffsetMm: -10,
      strokeWidthMm: 30,
    });

    expect(constrainArcToRange(layer, range)).toMatchObject({
      valueStart: 99,
      valueEnd: 100,
      radiusOffsetMm: -10,
      strokeWidthMm: 20,
    });
  });
});
