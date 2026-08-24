import { describe, expect, it } from "vitest";
import {
  createArcLayer,
  createLayerFromType,
  createLabelLayer,
  createNumericScaleLayer,
  createNeedleLayer,
  createEllipseLayer,
  createRectangleLayer,
  createProject,
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

describe("createLayerFromType", () => {
  it("creates a visual layer from its registered type", () => {
    const range = createRange();
    const canvas = createProject().canvas;

    expect(createLayerFromType("tick-scale", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "tick-scale",
    });
    expect(createLayerFromType("numeric-scale", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "numeric-scale",
    });
    expect(createLayerFromType("label", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "label",
    });
    expect(createLayerFromType("arc", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "arc",
    });
    expect(createLayerFromType("needle", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "needle",
    });
    expect(createLayerFromType("ellipse", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "ellipse",
    });
    expect(createLayerFromType("rectangle", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "rectangle",
    });
    expect(createLayerFromType("line", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "line",
      geometry: { lengthMm: canvas.widthMm / 2, rotationDegrees: 0 },
      style: { roundedEnds: false },
    });
    expect(createLayerFromType("icon", range, canvas)).toMatchObject({
      rangeId: range.id,
      type: "icon",
      icon: { library: "lucide", name: "gauge" },
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
    expect(createLayerFromType("needle", range, createProject().canvas)).toMatchObject({
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

    expect(resetLayerToDefaults(layer, range, createProject().canvas)).toMatchObject({
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

    expect(resetLayerToDefaults(layer, range, createProject().canvas)).toMatchObject({
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

    expect(resetLayerToDefaults(layer, range, createProject().canvas)).toMatchObject({
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

    expect(resetLayerToDefaults(layer, range, createProject().canvas)).toMatchObject({
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

    expect(resetLayerToDefaults(layer, range, createProject().canvas)).toMatchObject({
      id: layer.id,
      name: "Pointer",
      rangeId: range.id,
      value: 0,
      shaft: { lengthMm: 40, tipStyle: "tapered-rounded", color: "#C62828" },
    });
  });

  it("restores shape dimensions from the current canvas", () => {
    const range = createRange();
    const canvas = { ...createProject().canvas, widthMm: 200, heightMm: 80 };
    const ellipse = createEllipseLayer(range.id, canvas, {
      geometry: {
        offsetXMm: 12,
        offsetYMm: -4,
        widthMm: 10,
        heightMm: 20,
        rotationDegrees: 45,
      },
    });
    const rectangle = createRectangleLayer(range.id, canvas, { cornerRadiusPercent: 30 });

    expect(resetLayerToDefaults(ellipse, range, canvas)).toMatchObject({
      geometry: { offsetXMm: 0, offsetYMm: 0, widthMm: 100, heightMm: 40, rotationDegrees: 0 },
      style: { fillColor: "#BBDEFB", borderColor: "#1565C0", borderWidthMm: 0 },
    });
    expect(resetLayerToDefaults(rectangle, range, canvas)).toMatchObject({
      cornerRadiusPercent: 0,
      geometry: { widthMm: 100, heightMm: 40 },
    });
  });
});
