import { describe, expect, it } from "vitest";
import {
  createDevelopmentProject,
  createArcLayer,
  createLayerFromType,
  createLabelLayer,
  createNumericScaleLayer,
  createNeedleLayer,
  createRange,
  createRangeForCanvas,
  createTickScaleLayer,
  resetLayerToDefaults,
} from "./project-factories";

describe("createRangeForCanvas", () => {
  it("centers and sizes a valid initial Range for a small canvas", () => {
    expect(
      createRangeForCanvas({
        widthMm: 30,
        heightMm: 30,
        background: "#FFFFFF",
        transparentBackground: true,
      }),
    ).toMatchObject({ centerX: 15, centerY: 15, radius: 12 });
  });
});

describe("createDevelopmentProject", () => {
  it("provides a logarithmic pressure-gauge workbench", () => {
    const project = createDevelopmentProject();

    expect(project.ranges).toHaveLength(1);
    expect(project.layers).toHaveLength(7);
    expect(project.layers.every((layer) => layer.rangeId === project.ranges[0].id)).toBe(true);
    expect(project.ranges[0]).toMatchObject({
      angleStart: 135,
      cornerRadiusPercent: 30,
      openingAngle: 270,
      radius: 46,
      valueDirection: "ascending",
      scaleDefinition: {
        mode: "logarithmic",
        start: 10,
        end: 100,
        detailEmphasis: "high-values",
      },
    });
    expect(project.canvas).toMatchObject({ background: "#FFFFFF", transparentBackground: false });
    expect(project.layers.filter((layer) => layer.type === "tick-scale")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: "#C4C4C4" }),
        expect.objectContaining({ color: "#3F3F3F" }),
      ]),
    );
    expect(project.layers.find((layer) => layer.type === "arc")).toMatchObject({
      radiusOffsetMm: 3,
      roundedEnds: false,
    });
    expect(project.layers.find((layer) => layer.type === "needle")).toMatchObject({
      value: 70,
      shaft: { lengthMm: 35, tipStyle: "tapered-rounded" },
      hub: { placement: "front" },
    });
    expect(project.layers.map((layer) => layer.name)).toEqual([
      "Warning arc",
      "Pressure needle",
      "Unit label",
      "Arc caption",
      "Major pressure ticks",
      "Minor pressure ticks",
      "Pressure values (bar)",
    ]);
  });
});

describe("createLayerFromType", () => {
  it("creates a visual layer from its registered type", () => {
    const range = createRange();

    expect(createLayerFromType("tick-scale", range)).toMatchObject({
      rangeId: range.id,
      type: "tick-scale",
    });
    expect(createLayerFromType("numeric-scale", range)).toMatchObject({
      rangeId: range.id,
      type: "numeric-scale",
    });
    expect(createLayerFromType("label", range)).toMatchObject({
      rangeId: range.id,
      type: "label",
    });
    expect(createLayerFromType("arc", range)).toMatchObject({
      rangeId: range.id,
      type: "arc",
    });
    expect(createLayerFromType("needle", range)).toMatchObject({
      rangeId: range.id,
      type: "needle",
    });
  });

  it("uses the source Range minimum and rounded taper as Needle defaults", () => {
    const range = createRange({
      scaleDefinition: { mode: "linear", start: 20, end: 80 },
    });

    expect(createNeedleLayer(range)).toMatchObject({
      rangeId: range.id,
      value: 20,
      shaft: { tipStyle: "tapered-rounded" },
    });
    expect(createLayerFromType("needle", range)).toMatchObject({
      value: 20,
      shaft: { tipStyle: "tapered-rounded" },
    });
  });
});

describe("resetLayerToDefaults", () => {
  it("restores visual fields without losing layer identity or its Range", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, {
      color: "#C62828",
      name: "Custom markers",
      radiusOffsetMm: -6,
      valueEnd: 60,
      visible: false,
    });

    expect(resetLayerToDefaults(layer, range)).toMatchObject({
      id: layer.id,
      name: "Custom markers",
      rangeId: range.id,
      visible: false,
      color: "#20242B",
      radiusOffsetMm: 0,
      valueEnd: 100,
    });
  });

  it("restores Numeric Scale settings without losing identity or its Range", () => {
    const range = createRange();
    const layer = createNumericScaleLayer(range.id, {
      name: "Labels",
      textStyle: {
        font: { source: "system", family: "Georgia" },
        sizeMm: 8,
        color: "#123456",
        bold: true,
        italic: true,
        underline: true,
      },
    });

    expect(resetLayerToDefaults(layer, range)).toMatchObject({
      id: layer.id,
      name: "Labels",
      rangeId: range.id,
      textStyle: expect.objectContaining({
        font: { source: "system", family: "Arial" },
        sizeMm: 3,
        bold: false,
      }),
    });
  });

  it("restores Label settings without losing identity or its Range", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id, { text: "Custom", name: "Caption" });

    expect(resetLayerToDefaults(layer, range)).toMatchObject({
      id: layer.id,
      name: "Caption",
      rangeId: range.id,
      text: "Label",
    });
  });

  it("restores Arc settings without losing identity or its Range", () => {
    const range = createRange();
    const layer = createArcLayer(range.id, {
      name: "Limit",
      strokeWidthMm: 8,
      roundedEnds: false,
    });

    expect(resetLayerToDefaults(layer, range)).toMatchObject({
      id: layer.id,
      name: "Limit",
      rangeId: range.id,
      strokeWidthMm: 2,
      roundedEnds: false,
      color: "#2E7D32",
    });
  });

  it("restores nested Needle settings without losing identity or its Range", () => {
    const range = createRange();
    const layer = createNeedleLayer(range, {
      name: "Pointer",
      value: 80,
      shaft: {
        lengthMm: 20,
        tailLengthMm: 0,
        widthMm: 4,
        tipStyle: "flat",
        color: "#000000",
        tailColor: "#111111",
      },
    });

    expect(resetLayerToDefaults(layer, range)).toMatchObject({
      id: layer.id,
      name: "Pointer",
      rangeId: range.id,
      value: 0,
      shaft: { lengthMm: 40, tipStyle: "tapered-rounded", color: "#C62828" },
    });
  });
});
