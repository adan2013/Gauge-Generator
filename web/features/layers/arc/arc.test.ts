import { describe, expect, it } from "vitest";
import {
  createArcLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { getRangeMappedLayerPathGeometry } from "@/features/layers/core/range-mapped-layer-geometry";
import { ArcLayer } from "./arc";

describe("ArcLayer", () => {
  const range = createRange({ angleStart: 0, openingAngle: 180, radius: 40 });
  const layer = createArcLayer(range.id, {
    valueStart: 25,
    valueEnd: 75,
    strokeWidthMm: 3,
    color: "#123456",
    roundedEnds: true,
  });
  const project = createProject({ ranges: [range], layers: [layer] });
  const context = {
    project,
    rangeById: new Map([[range.id, range]]),
  };

  it("renders only the Range-mapped value interval with configured stroke styling", () => {
    const svg = new ArcLayer(layer).toSvg(context);

    expect(svg).toContain('<path d="M 88.284 88.284');
    expect(svg).toContain('stroke="#123456"');
    expect(svg).toContain('stroke-width="3"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).not.toContain("angleStart");
    expect(svg).not.toContain("openingAngle");
  });

  it("uses a flat SVG line cap when rounded ends are disabled", () => {
    expect(new ArcLayer({ ...layer, roundedEnds: false }).toSvg(context)).toContain(
      'stroke-linecap="butt"',
    );
  });

  it("maps start and end values through a Custom Range rather than storing angles", () => {
    const customRange = createRange({
      angleStart: 10,
      openingAngle: 200,
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 50, position: 0.25 },
          { value: 100, position: 1 },
        ],
      },
    });

    expect(
      getRangeMappedLayerPathGeometry(
        createArcLayer(customRange.id, { valueStart: 50, valueEnd: 100 }),
        customRange,
      ),
    ).toEqual({ angleStart: 60, openingAngle: 150, radius: customRange.radius });
  });

  it("rejects a zero value span and a stroke wider than the effective diameter", () => {
    const invalid = createArcLayer(range.id, {
      valueStart: 50,
      valueEnd: 50,
      radiusOffsetMm: -35,
      strokeWidthMm: 11,
    });

    expect(new ArcLayer(invalid).validate(context)).toEqual([
      { path: "valueStart", code: PROJECT_VALIDATION_CODES.valueRangeMustHaveSpan },
      { path: "strokeWidthMm", code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange },
    ]);
  });

  it("reuses the Range-mapped radius handle and snapping", () => {
    const next = new ArcLayer(layer).applyHandleDrag(
      "radius-offset",
      { point: { x: 90, y: 60 }, shiftKey: false, altKey: false, snapDistanceMm: 2 },
      context,
    );

    expect(next.radiusOffsetMm).toBe(-10);
  });
});
