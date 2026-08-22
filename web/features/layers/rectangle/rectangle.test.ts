import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createRectangleLayer,
} from "@/features/project/factories/project-factories";
import { RectangleLayer } from "./rectangle";

describe("RectangleLayer", () => {
  it("renders rotation, styling, and corner radius as half the short side at 50 percent", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    const layer = createRectangleLayer(range.id, project.canvas, {
      geometry: {
        offsetXMm: 0,
        offsetYMm: 0,
        widthMm: 40,
        heightMm: 20,
        rotationDegrees: 45,
      },
      style: { fillColor: "#ABCDEF", borderColor: "#123456", borderWidthMm: 2 },
      cornerRadiusPercent: 50,
    });
    const context = { project, rangeById: new Map([[range.id, range]]) };

    const svg = new RectangleLayer(layer).toSvg(context);
    expect(svg).toContain('x="40" y="50" width="40" height="20" rx="10"');
    expect(svg).toContain('fill="#ABCDEF" stroke="#123456" stroke-width="2"');
    expect(svg).toContain('transform="rotate(45 60 60)"');
  });
});
