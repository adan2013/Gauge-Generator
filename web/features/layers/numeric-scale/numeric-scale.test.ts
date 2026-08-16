import { describe, expect, it } from "vitest";
import {
  createNumericScaleLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { NumericScaleLayer } from "./numeric-scale";
import { getNumericScaleNumericPropertyDefinitions } from "./numeric-scale-properties";

describe("NumericScaleLayer", () => {
  const range = createRange({ angleStart: 0, openingAngle: 90, radius: 40 });
  const layer = createNumericScaleLayer(range.id, {
    valueEnd: 100,
    valueStep: 50,
    fontSizeMm: 3,
  });
  const project = createProject({ ranges: [range], layers: [layer] });
  const context = {
    project,
    rangeById: new Map(project.ranges.map((item) => [item.id, item])),
    zoom: 1,
  };

  it("renders formatted labels at values mapped through its source Range", () => {
    const svg = new NumericScaleLayer({
      ...layer,
      scaleMultiplier: 0.5,
      decimalPlaces: 1,
    }).toSvg(context);

    expect(svg.match(/<text /g)).toHaveLength(3);
    expect(svg).toContain('x="92" y="60"');
    expect(svg).toContain('x="60" y="92"');
    expect(svg).toContain(">25.0</text>");
  });

  it("does not duplicate the closing label on a full circle", () => {
    const fullRange = {
      ...range,
      openingAngle: 360,
      scaleDefinition: { mode: "linear" as const, start: 0, end: 60 },
    };
    const fullLayer = { ...layer, valueEnd: 60, valueStep: 20 };
    const fullProject = createProject({ ranges: [fullRange], layers: [fullLayer] });
    const fullContext = {
      project: fullProject,
      rangeById: new Map(fullProject.ranges.map((item) => [item.id, item])),
      zoom: 1,
    };

    expect(new NumericScaleLayer(fullLayer).toSvg(fullContext).match(/<text /g)).toHaveLength(3);
  });

  it("derives its label radius and font-size limits from the source Range", () => {
    const fields = getNumericScaleNumericPropertyDefinitions(layer, range);

    expect(fields.find((field) => field.key === "radiusOffsetMm")).toMatchObject({
      min: -39.5,
      max: 40,
      snap: "distance",
    });
    expect(fields.find((field) => field.key === "fontSizeMm")).toMatchObject({ max: 32 });
  });

  it("snaps the label-radius handle and keeps the label circle valid", () => {
    const next = new NumericScaleLayer(layer).applyHandleDrag(
      "radius-offset",
      { point: { x: 54, y: 60 }, shiftKey: false, altKey: false, snapDistanceMm: 2 },
      context,
    );

    expect(next.radiusOffsetMm).toBe(-34);
  });
});
