import { describe, expect, it } from "vitest";
import { createNeedleLayer, createRange } from "@/features/project/factories/project-factories";
import { constrainNeedleToRange, getNeedleGeometryBounds } from "./needle-constraints";

describe("Needle Range constraints", () => {
  it("derives physical limits from the source Range", () => {
    const range = createRange({ radius: 20 });
    const layer = createNeedleLayer(range);

    expect(getNeedleGeometryBounds(layer, range)).toEqual({
      maxLengthMm: 40,
      maxTailLengthMm: 20,
      maxWidthMm: 40,
      maxHubRadiusMm: 20,
    });
  });

  it("clamps nested geometry and value after its Range changes", () => {
    const range = createRange({
      radius: 10,
      scaleDefinition: { mode: "linear", start: 20, end: 80 },
    });
    const layer = createNeedleLayer(range, {
      value: 100,
      shaft: {
        lengthMm: 50,
        tailLengthMm: 30,
        widthMm: 30,
        tipStyle: "flat",
        color: "#000000",
        tailColor: "#111111",
      },
      hub: { visible: true, radiusMm: 30, color: "#222222", placement: "front" },
    });

    expect(constrainNeedleToRange(layer, range)).toMatchObject({
      value: 80,
      shaft: { lengthMm: 20, tailLengthMm: 10, widthMm: 20 },
      hub: { radiusMm: 10 },
    });
  });
});
