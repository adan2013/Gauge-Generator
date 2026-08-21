import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { createPointLabelLayout, createTextArcLabelLayout } from "./label-layout-factories";

describe("Label layout factories", () => {
  it("creates a centered point layout", () => {
    expect(createPointLabelLayout()).toEqual({
      mode: "point",
      offsetXMm: 0,
      offsetYMm: 0,
      rotationDegrees: 0,
    });
  });

  it("derives text-path values from its Range", () => {
    const range = createRange({
      scaleDefinition: { mode: "linear", start: 10, end: 90 },
    });

    expect(createTextArcLabelLayout(range)).toEqual({
      mode: "text-arc",
      radiusOffsetMm: 0,
      valueStart: 10,
      valueEnd: 90,
      alignment: "center",
      direction: "forward",
    });
  });
});
