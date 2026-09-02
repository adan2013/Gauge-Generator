import { describe, expect, it } from "vitest";
import { createNeedleLayer, createRange } from "@/features/project/factories/project-factories";
import { getNeedleNumericPropertyDefinitions } from "./needle-properties";

describe("Needle properties", () => {
  it("exposes the Range value and dynamic nested geometry limits", () => {
    const range = createRange({
      radius: 10,
      scaleDefinition: { mode: "linear", start: 20, end: 80 },
    });
    const definitions = getNeedleNumericPropertyDefinitions(createNeedleLayer(range), range);

    expect(definitions.map((definition) => definition.key)).toEqual([
      "value",
      "lengthMm",
      "tailLengthMm",
      "widthMm",
      "hubRadiusMm",
    ]);
    expect(definitions.find(({ key }) => key === "value")).toMatchObject({
      integerOnly: true,
      min: 20,
      max: 80,
      snap: "none",
    });
    expect(definitions.find(({ key }) => key === "lengthMm")).toMatchObject({ max: 20 });
    expect(definitions.find(({ key }) => key === "widthMm")).toMatchObject({
      step: 0.1,
      snap: "none",
    });
    expect(definitions.find(({ key }) => key === "hubRadiusMm")).toMatchObject({ max: 10 });
  });
});
