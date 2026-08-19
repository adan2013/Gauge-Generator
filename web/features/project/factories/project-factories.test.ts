import { describe, expect, it } from "vitest";
import {
  createDevelopmentProject,
  createLayerFromType,
  createNumericScaleLayer,
  createRange,
  createTickScaleLayer,
  resetLayerToDefaults,
} from "./project-factories";

describe("createDevelopmentProject", () => {
  it("provides a logarithmic pressure-gauge workbench", () => {
    const project = createDevelopmentProject();

    expect(project.ranges).toHaveLength(1);
    expect(project.layers).toHaveLength(3);
    expect(project.layers.every((layer) => layer.rangeId === project.ranges[0].id)).toBe(true);
    expect(project.ranges[0]).toMatchObject({
      angleStart: 135,
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
        expect.objectContaining({ cornerRadiusPercent: 30, color: "#C4C4C4" }),
        expect.objectContaining({ cornerRadiusPercent: 30, color: "#3F3F3F" }),
      ]),
    );
    expect(project.layers.map((layer) => layer.name)).toEqual([
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
    const layer = createNumericScaleLayer(range.id, { name: "Labels", fontSizeMm: 8, bold: true });

    expect(resetLayerToDefaults(layer)).toMatchObject({
      id: layer.id,
      name: "Labels",
      rangeId: range.id,
      fontSizeMm: 3,
      bold: false,
    });
  });
});
