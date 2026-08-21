import { describe, expect, it } from "vitest";
import {
  createLabelLayer,
  createProject,
  createRange,
  createTextStyle,
} from "@/features/project/factories/project-factories";
import { LabelLayer } from "./label";

describe("LabelLayer", () => {
  const range = createRange({
    centerX: 60,
    centerY: 60,
    radius: 40,
    angleStart: 0,
    openingAngle: 90,
  });
  const layer = createLabelLayer(range.id, {
    text: "Oil & <water>",
    layout: {
      mode: "point",
      offsetXMm: 10,
      offsetYMm: -20,
      rotationDegrees: 30,
    },
    textStyle: createTextStyle({
      font: { source: "system", family: "Georgia" },
      sizeMm: 5,
      color: "#123456",
      bold: true,
      italic: true,
      underline: true,
    }),
  });
  const project = createProject({ ranges: [range], layers: [layer] });
  const context = { project, rangeById: new Map([[range.id, range]]) };

  it("renders escaped point text with the shared typography contract", () => {
    const svg = new LabelLayer(layer).toSvg(context);

    expect(svg).toContain('x="70" y="40"');
    expect(svg).toContain('font-family="Georgia"');
    expect(svg).toContain('font-size="5"');
    expect(svg).toContain('font-weight="700"');
    expect(svg).toContain('font-style="italic"');
    expect(svg).toContain('text-decoration="underline"');
    expect(svg).toContain('transform="rotate(30 70 40)"');
    expect(svg).toContain(">Oil &amp; &lt;water&gt;</text>");
  });

  it("exposes independent move and rotation handles", () => {
    const model = new LabelLayer(layer);

    expect(model.getEditingOverlay(context)).toHaveLength(2);
    expect(model.getHandles(context).map((handle) => handle.id)).toEqual(["position", "rotation"]);
  });

  it("keeps values edited by handles integral", () => {
    const moved = new LabelLayer(layer).applyHandleDrag(
      "position",
      { point: { x: 73.4, y: 49.2 }, shiftKey: false, altKey: false },
      context,
    );
    const rotated = new LabelLayer(moved).applyHandleDrag(
      "rotation",
      { point: { x: 83, y: 49 }, shiftKey: false, altKey: false },
      context,
    );

    expect(moved.layout).toMatchObject({ offsetXMm: 13, offsetYMm: -11 });
    expect(rotated.layout).toMatchObject({ rotationDegrees: expect.any(Number) });
    if (moved.layout.mode !== "point" || rotated.layout.mode !== "point")
      throw new Error("Expected point layouts");
    expect(Number.isInteger(moved.layout.offsetXMm)).toBe(true);
    expect(Number.isInteger(moved.layout.offsetYMm)).toBe(true);
    expect(Number.isInteger(rotated.layout.rotationDegrees)).toBe(true);
  });

  it("normalizes handle rotation to the zero-through-359 range", () => {
    const rotated = new LabelLayer(layer).applyHandleDrag(
      "rotation",
      { point: { x: 60, y: 30 }, shiftKey: false, altKey: false },
      context,
    );

    expect(rotated.layout).toMatchObject({ mode: "point", rotationDegrees: 315 });
  });

  it("renders text along the mapped rounded Range path", () => {
    const textArcLayer = createLabelLayer(range.id, {
      text: "PRESSURE",
      layout: {
        mode: "text-arc",
        radiusOffsetMm: -5,
        valueStart: 0,
        valueEnd: 100,
        alignment: "center",
        direction: "forward",
      },
    });
    const svg = new LabelLayer(textArcLayer).toSvg(context);

    expect(svg).toContain(`<path id="label-text-path-${textArcLayer.id}"`);
    expect(svg).toContain('d="M 95 60 A 35 35 0 0 1 60 95"');
    expect(svg).toContain('startOffset="50%" text-anchor="middle"');
    expect(svg).toContain(">PRESSURE</textPath>");
  });

  it("reverses the text path independently from Range value direction", () => {
    const textArcLayer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: -5,
        valueStart: 0,
        valueEnd: 100,
        alignment: "start",
        direction: "reverse",
      },
    });
    const svg = new LabelLayer(textArcLayer).toSvg(context);

    expect(svg).toContain('d="M 60 95 A 35 35 0 0 0 95 60"');
    expect(svg).toContain('startOffset="0%" text-anchor="start"');
  });

  it("adjusts the text-path radius with its own handle", () => {
    const textArcLayer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: 0,
        valueStart: 0,
        valueEnd: 100,
        alignment: "center",
        direction: "forward",
      },
    });
    const model = new LabelLayer(textArcLayer);
    const next = model.applyHandleDrag(
      "radius-offset",
      { point: { x: 90, y: 60 }, shiftKey: false, altKey: false },
      context,
    );

    expect(model.getHandles(context).map((handle) => handle.id)).toEqual(["radius-offset"]);
    expect(next.layout).toMatchObject({ mode: "text-arc", radiusOffsetMm: -10 });
  });
});
