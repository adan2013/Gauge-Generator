import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { TickScaleLayer } from "./tick-scale";
import { getTickScaleNumericPropertyDefinitions } from "./tick-scale-properties";

describe("TickScaleLayer", () => {
  const range = createRange({ angleStart: 0, openingAngle: 90, radius: 40 });
  const layer = createTickScaleLayer(range.id, {
    valueEnd: 100,
    valueStep: 50,
    tickLengthMm: 5,
    tickWidthMm: 1,
  });
  const project = createProject({ ranges: [range], layers: [layer] });
  const context = {
    project,
    rangeById: new Map(project.ranges.map((item) => [item.id, item])),
  };

  it("renders one radial SVG line for every tick across its source Range", () => {
    const svg = new TickScaleLayer(layer).toSvg(context);

    expect(svg.match(/<line /g)).toHaveLength(3);
    expect(svg).toContain('stroke="#20242B"');
    expect(svg).toContain('x1="95" y1="60" x2="100" y2="60"');
    expect(svg).toContain('x1="60" y1="95" x2="60" y2="100"');
  });

  it("uses visible start, end, and step values to choose marks", () => {
    const partialLayer = { ...layer, valueStart: 20, valueEnd: 80, valueStep: 30 };
    const svg = new TickScaleLayer(partialLayer).toSvg(context);

    expect(svg.match(/<line /g)).toHaveLength(3);
    expect(svg).toContain('x1="93.287" y1="70.816" x2="98.042" y2="72.361"');
  });

  it("distinguishes its active and inactive value intervals in the editing overlay", () => {
    const overlay = new TickScaleLayer({
      ...layer,
      valueStart: 25,
      valueEnd: 75,
    }).getEditingOverlay(context);

    expect(overlay.filter((primitive) => primitive.segment === "inactive")).toHaveLength(2);
    expect(overlay.some((primitive) => primitive.segment === "active")).toBe(true);
  });

  it("does not duplicate the closing tick of a full 360-degree scale", () => {
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
    };

    const svg = new TickScaleLayer(fullLayer).toSvg(fullContext);
    expect(svg).toContain('x1="95" y1="60" x2="100" y2="60"');
    expect(svg).toContain('x1="42.5" y1="90.311" x2="40" y2="94.641"');
  });

  it("derives spatial limits from its source Range", () => {
    const fields = getTickScaleNumericPropertyDefinitions(layer, range);

    expect(fields.find((field) => field.key === "radiusOffsetMm")).toMatchObject({
      min: -39.8,
      max: 40,
      snap: "distance",
    });
    expect(fields.find((field) => field.key === "valueStart")).toMatchObject({ min: 0, max: 100 });
    expect(fields.find((field) => field.key === "valueEnd")).toMatchObject({ min: 0, max: 100 });
    expect(fields.find((field) => field.key === "tickLengthMm")).toMatchObject({ max: 40 });
    expect(fields.find((field) => field.key === "tickWidthMm")).toMatchObject({ max: 5 });
  });

  it("snaps a dragged tick-radius handle and keeps its rendered radius positive", () => {
    const nextLayer = new TickScaleLayer(layer).applyHandleDrag(
      "radius-offset",
      {
        point: { x: 64.24, y: 64.24 },
        shiftKey: false,
        altKey: false,
        snapDistanceMm: 2,
      },
      context,
    );

    expect(nextLayer.radiusOffsetMm).toBe(-34);
    expect(new TickScaleLayer({ ...layer, radiusOffsetMm: -40 }).validate(context)).toContainEqual({
      path: "radiusOffsetMm",
      code: "project.validation.valueMustBePositive",
    });
  });

  it("keeps overlay-edited offsets integral when the source radius is fractional", () => {
    const fractionalRange = { ...range, radius: 40.5 };
    const fractionalProject = createProject({ ranges: [fractionalRange], layers: [layer] });
    const fractionalContext = {
      project: fractionalProject,
      rangeById: new Map([[fractionalRange.id, fractionalRange]]),
    };

    const nextLayer = new TickScaleLayer(layer).applyHandleDrag(
      "radius-offset",
      { point: { x: 71.4, y: 60 }, shiftKey: false, altKey: false },
      fractionalContext,
    );

    expect(Number.isInteger(nextLayer.radiusOffsetMm)).toBe(true);
  });

  it("never exposes a tick-length limit above the DTO maximum", () => {
    const largeRange = createRange({ radius: 500 });
    const fields = getTickScaleNumericPropertyDefinitions(layer, largeRange);

    expect(fields.find((field) => field.key === "tickLengthMm")).toMatchObject({ max: 50 });
  });
});
