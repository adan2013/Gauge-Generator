import { describe, expect, it } from "vitest";
import {
  createLineLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { LineLayer, getLineGeometry } from "./line";

describe("LineLayer", () => {
  const range = createRange();
  const project = createProject({ ranges: [range] });
  const layer = createLineLayer(range.id, project.canvas, {
    geometry: {
      offsetXMm: 0,
      offsetYMm: 0,
      lengthMm: 40,
      rotationDegrees: 0,
    },
    style: { color: "#123456", strokeWidthMm: 2, roundedEnds: true },
  });
  const context = { project, rangeById: new Map([[range.id, range]]) };

  it("renders a centered line with configured stroke and ends", () => {
    expect(new LineLayer(layer).toSvg(context)).toBe(
      '<line x1="40" y1="60" x2="80" y2="60" fill="none" stroke="#123456" stroke-width="2" stroke-linecap="round" />',
    );
    expect(
      new LineLayer({ ...layer, style: { ...layer.style, roundedEnds: false } }).toSvg(context),
    ).toContain('stroke-linecap="butt"');
  });

  it("derives both endpoints from center, length, and rotation", () => {
    expect(
      getLineGeometry({ ...layer, geometry: { ...layer.geometry, rotationDegrees: 90 } }, range),
    ).toMatchObject({
      center: { x: 60, y: 60 },
      start: { x: 60, y: 40 },
      end: { x: 60, y: 80 },
    });
  });

  it("moves one endpoint while keeping the opposite endpoint fixed", () => {
    const changed = new LineLayer(layer).applyHandleDrag(
      "end",
      {
        point: { x: 40, y: 104 },
        shiftKey: false,
        altKey: false,
        snapDistanceMm: 1,
        snapAngleDegrees: 1,
      },
      context,
    );

    expect(changed.geometry).toEqual({
      offsetXMm: -20,
      offsetYMm: 20,
      lengthMm: 40,
      rotationDegrees: 90,
    });
    expect(getLineGeometry(changed, range)).toMatchObject({
      start: { x: 40, y: 60 },
      end: { x: 40, y: 100 },
    });
  });

  it("rounds endpoint-derived center offsets to the property precision", () => {
    const changed = new LineLayer(layer).applyHandleDrag(
      "end",
      {
        point: { x: 90, y: 95 },
        shiftKey: false,
        altKey: false,
        snapDistanceMm: 1,
        snapAngleDegrees: 1,
      },
      context,
    );

    expect(Number.isInteger(changed.geometry.offsetXMm * 10)).toBe(true);
    expect(Number.isInteger(changed.geometry.offsetYMm * 10)).toBe(true);
    expect(changed.geometry.lengthMm).toBe(57);
    expect(changed.geometry.rotationDegrees).toBe(35);
    expect(JSON.stringify(changed.geometry)).not.toMatch(/(?:000000000|999999999)/);
  });

  it("offsets endpoint handles outwards and connects them to the actual line ends", () => {
    expect(new LineLayer(layer).getHandles(context)).toEqual([
      expect.objectContaining({ id: "position", point: { x: 60, y: 60 } }),
      expect.objectContaining({ id: "start", point: { x: 36, y: 60 } }),
      expect.objectContaining({ id: "end", point: { x: 84, y: 60 } }),
    ]);
    expect(new LineLayer(layer).getEditingOverlay(context)).toEqual([
      expect.objectContaining({
        id: "line-start-handle-guide",
        start: { x: 40, y: 60 },
        end: { x: 36, y: 60 },
      }),
      expect.objectContaining({
        id: "line-end-handle-guide",
        start: { x: 80, y: 60 },
        end: { x: 84, y: 60 },
      }),
    ]);
  });
});
