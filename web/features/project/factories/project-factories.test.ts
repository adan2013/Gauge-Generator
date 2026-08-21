import { describe, expect, it } from "vitest";
import {
  createDevelopmentProject,
  createLayerFromType,
  createLabelLayer,
  createNumericScaleLayer,
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
    expect(project.layers).toHaveLength(5);
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
    expect(project.layers.map((layer) => layer.name)).toEqual([
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

    expect(createLayerFromType("tick-scale", range.id)).toMatchObject({
      rangeId: range.id,
      type: "tick-scale",
    });
    expect(createLayerFromType("numeric-scale", range.id)).toMatchObject({
      rangeId: range.id,
      type: "numeric-scale",
    });
    expect(createLayerFromType("label", range.id)).toMatchObject({
      rangeId: range.id,
      type: "label",
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

    expect(resetLayerToDefaults(layer)).toMatchObject({
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

    expect(resetLayerToDefaults(layer)).toMatchObject({
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

    expect(resetLayerToDefaults(layer)).toMatchObject({
      id: layer.id,
      name: "Caption",
      rangeId: range.id,
      text: "Label",
    });
  });
});
