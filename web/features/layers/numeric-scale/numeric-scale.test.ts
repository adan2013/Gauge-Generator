import { describe, expect, it } from "vitest";
import {
  createNumericScaleLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { NumericScaleLayer } from "./numeric-scale";
import { getNumericScaleNumericPropertyDefinitions } from "./numeric-scale-properties";
import { getTextStyleSizePropertyDefinition } from "@/features/layers/core/text-style/text-style-properties";
import { getNumericScaleGeometryBounds } from "./numeric-scale-constraints";

describe("NumericScaleLayer", () => {
  const range = createRange({ angleStart: 0, openingAngle: 90, radius: 40 });
  const layer = createNumericScaleLayer(range.id, {
    valueEnd: 100,
    valueStep: 50,
    textStyle: {
      font: { source: "system", family: "Arial" },
      sizeMm: 3,
      color: "#20242B",
      bold: false,
      italic: false,
      underline: false,
    },
  });
  const project = createProject({ ranges: [range], layers: [layer] });
  const context = {
    project,
    rangeById: new Map(project.ranges.map((item) => [item.id, item])),
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

  it("renders the shared nested typography settings", () => {
    const svg = new NumericScaleLayer({
      ...layer,
      textStyle: {
        ...layer.textStyle,
        font: { source: "system", family: "Courier New" },
        color: "#123456",
        bold: true,
        italic: true,
        underline: true,
      },
    }).toSvg(context);

    expect(svg).toContain('fill="#123456"');
    expect(svg).toContain('font-family="Courier New"');
    expect(svg).toContain('font-weight="700"');
    expect(svg).toContain('font-style="italic"');
    expect(svg).toContain('text-decoration="underline"');
  });

  it("distinguishes its active and inactive value intervals in the editing overlay", () => {
    const overlay = new NumericScaleLayer({
      ...layer,
      valueStart: 25,
      valueEnd: 75,
    }).getEditingOverlay(context);

    expect(overlay.filter((primitive) => primitive.segment === "inactive")).toHaveLength(2);
    expect(overlay.some((primitive) => primitive.segment === "active")).toBe(true);
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
    expect(
      getTextStyleSizePropertyDefinition(
        layer.textStyle.sizeMm,
        getNumericScaleGeometryBounds(layer, range).maxFontSizeMm,
      ),
    ).toMatchObject({ max: 32 });
  });

  it("never exposes a font-size limit above the DTO maximum", () => {
    const largeRange = createRange({ radius: 500 });

    expect(
      getTextStyleSizePropertyDefinition(
        layer.textStyle.sizeMm,
        getNumericScaleGeometryBounds(layer, largeRange).maxFontSizeMm,
      ),
    ).toMatchObject({ max: 50 });
  });

  it("snaps the label-radius handle and keeps the label circle valid", () => {
    const next = new NumericScaleLayer(layer).applyHandleDrag(
      "radius-offset",
      { point: { x: 64.24, y: 64.24 }, shiftKey: false, altKey: false, snapDistanceMm: 2 },
      context,
    );

    expect(next.radiusOffsetMm).toBe(-34);
  });

  it("keeps labels on the normal extension of ticks for a square Range", () => {
    const squareRange = createRange({
      angleStart: 160,
      openingAngle: 1,
      radius: 40,
      cornerRadiusPercent: 0,
    });
    const squareLayer = createNumericScaleLayer(squareRange.id, {
      valueEnd: 0,
      valueStep: 1,
      radiusOffsetMm: -10,
    });
    const squareProject = createProject({ ranges: [squareRange], layers: [squareLayer] });
    const svg = new NumericScaleLayer(squareLayer).toSvg({
      project: squareProject,
      rangeById: new Map([[squareRange.id, squareRange]]),
    });

    expect(svg).toContain('y="74.559"');
  });

  it("keeps overlay-edited offsets integral when the source radius is fractional", () => {
    const fractionalRange = { ...range, radius: 40.5 };
    const fractionalProject = createProject({ ranges: [fractionalRange], layers: [layer] });
    const fractionalContext = {
      project: fractionalProject,
      rangeById: new Map([[fractionalRange.id, fractionalRange]]),
    };

    const nextLayer = new NumericScaleLayer(layer).applyHandleDrag(
      "radius-offset",
      { point: { x: 71.4, y: 60 }, shiftKey: false, altKey: false },
      fractionalContext,
    );

    expect(Number.isInteger(nextLayer.radiusOffsetMm)).toBe(true);
  });
});
