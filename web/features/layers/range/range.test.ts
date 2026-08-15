import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { Range } from "./range";

describe("Range property definitions", () => {
  it("derives editable coordinate limits from the current canvas", () => {
    const fields = new Range(createRange()).getNumericPropertyDefinitions({ widthMm: 240, heightMm: 80, background: "#FFFFFF" });

    expect(fields.centerX).toMatchObject({ min: 0, max: 240 });
    expect(fields.centerY).toMatchObject({ min: 0, max: 80 });
    expect(fields.radius).toMatchObject({ min: 0.1, max: 1_000 });
    expect(fields.openingAngle).toMatchObject({ min: -360, max: 360 });
  });
});
