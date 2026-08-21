import { describe, expect, it } from "vitest";
import {
  createNeedleLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { NeedleLayer, angleToRangePosition, getNeedleGeometry } from "./needle";

describe("NeedleLayer", () => {
  const range = createRange({ angleStart: 0, openingAngle: 180, radius: 40 });
  const layer = createNeedleLayer(range, {
    value: 50,
    shaft: {
      lengthMm: 30,
      tailLengthMm: 5,
      widthMm: 2,
      tipStyle: "pointed",
      color: "#123456",
      tailColor: "#654321",
    },
  });
  const project = createProject({ ranges: [range], layers: [layer] });
  const context = { project, rangeById: new Map([[range.id, range]]) };

  it("maps its value through the Range and renders separate shaft, tail, and hub styling", () => {
    const svg = new NeedleLayer(layer).toSvg(context);

    expect(getNeedleGeometry(layer, range)).toMatchObject({
      angle: 90,
      center: { x: 60, y: 60 },
      tip: { x: 60, y: 90 },
      tail: { x: 60, y: 55 },
    });
    expect(svg).toContain('fill="#123456"');
    expect(svg).toContain('stroke="#654321"');
    expect(svg.indexOf("<path")).toBeLessThan(svg.indexOf("<circle"));
  });

  it("supports flat and rounded ends and hub placement behind the shaft", () => {
    const rounded = { ...layer, shaft: { ...layer.shaft, tipStyle: "rounded" as const } };
    const behind = { ...rounded, hub: { ...rounded.hub, placement: "behind" as const } };

    expect(new NeedleLayer(rounded).toSvg(context)).toContain('stroke-linecap="round"');
    expect(
      new NeedleLayer({
        ...rounded,
        shaft: { ...rounded.shaft, tipStyle: "flat" },
      }).toSvg(context),
    ).toContain('stroke-linecap="butt"');
    expect(new NeedleLayer(behind).toSvg(context).indexOf("<circle")).toBeLessThan(
      new NeedleLayer(behind).toSvg(context).indexOf("<line"),
    );
  });

  it("renders a local arrowhead and a tapered shaft with a rounded tip", () => {
    const arrowhead = {
      ...layer,
      shaft: { ...layer.shaft, tipStyle: "arrowhead" as const },
      hub: { ...layer.hub, visible: false },
    };
    const taperedRounded = {
      ...layer,
      shaft: { ...layer.shaft, tipStyle: "tapered-rounded" as const },
      hub: { ...layer.hub, visible: false },
    };

    expect(new NeedleLayer(arrowhead).toSvg(context)).toContain(
      'd="M 59 60 L 59 87 L 60 90 L 61 87 L 61 60 Z"',
    );
    expect(new NeedleLayer(taperedRounded).toSvg(context)).toContain(
      "L 59.6 89.6 C 59.6 90.133 60.4 90.133 60.4 89.6",
    );
  });

  it("uses the inverse custom mapping when the value handle is dragged", () => {
    const customRange = createRange({
      angleStart: 0,
      openingAngle: 180,
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 20, position: 0.5 },
          { value: 100, position: 1 },
        ],
      },
    });
    const customLayer = createNeedleLayer(customRange);
    const customProject = createProject({ ranges: [customRange], layers: [customLayer] });

    expect(
      new NeedleLayer(customLayer).applyHandleDrag(
        "value",
        { point: { x: 60, y: 100 }, shiftKey: false, altKey: false },
        { project: customProject, rangeById: new Map([[customRange.id, customRange]]) },
      ).value,
    ).toBe(20);
  });

  it("snaps and clamps the shaft and tail handles along the needle axis", () => {
    const model = new NeedleLayer(layer);
    expect(model.getHandles(context)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "length", point: { x: 60, y: 94 } }),
        expect.objectContaining({ id: "tail-length", point: { x: 60, y: 51 } }),
      ]),
    );
    expect(
      model.applyHandleDrag(
        "length",
        { point: { x: 60, y: 88 }, shiftKey: false, altKey: false, snapDistanceMm: 5 },
        context,
      ).shaft.lengthMm,
    ).toBe(25);
    expect(
      model.applyHandleDrag(
        "tail-length",
        { point: { x: 60, y: 46 }, shiftKey: false, altKey: false, snapDistanceMm: 5 },
        context,
      ).shaft.tailLengthMm,
    ).toBe(10);
  });

  it("draws the value guide only between the value and length handles", () => {
    const model = new NeedleLayer(layer);
    const handles = model.getHandles(context);
    const valueGuide = model
      .getEditingOverlay(context)
      .find((primitive) => primitive.id === "needle-value-guide");

    expect(valueGuide).toMatchObject({
      start: handles.find((handle) => handle.id === "length")?.point,
      end: handles.find((handle) => handle.id === "value")?.point,
    });
    expect(model.getEditingOverlay(context).map((primitive) => primitive.id)).toEqual([
      "needle-value-path",
      "needle-value-guide",
    ]);
  });

  it("validates dimensions derived from the source Range", () => {
    const invalid = createNeedleLayer(range, {
      value: 101,
      shaft: { ...layer.shaft, lengthMm: 90, tailLengthMm: 50, widthMm: 40 },
      hub: { ...layer.hub, radiusMm: 41 },
    });

    expect(new NeedleLayer(invalid).validate(context)).toEqual([
      { path: "value", code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange },
      { path: "shaft.lengthMm", code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange },
      { path: "shaft.tailLengthMm", code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange },
      { path: "hub.radiusMm", code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange },
    ]);
  });
});

describe("angleToRangePosition", () => {
  it("supports negative openings and clamps angles outside a partial Range to its nearest end", () => {
    expect(angleToRangePosition(0, 90, -180)).toBe(0.5);
    expect(angleToRangePosition(80, 90, 180)).toBe(0);
    expect(angleToRangePosition(280, 90, 180)).toBe(1);
  });
});
