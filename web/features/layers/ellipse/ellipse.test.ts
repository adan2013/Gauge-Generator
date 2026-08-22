import { describe, expect, it } from "vitest";
import {
  createEllipseLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { EllipseLayer } from "./ellipse";

describe("EllipseLayer", () => {
  const range = createRange();
  const project = createProject({ ranges: [range] });
  const layer = createEllipseLayer(range.id, project.canvas, {
    geometry: {
      offsetXMm: 5,
      offsetYMm: -10,
      widthMm: 40,
      heightMm: 20,
      rotationDegrees: 30,
    },
    style: { fillColor: "#BBDEFB", borderColor: "#1565C0", borderWidthMm: 1.5 },
  });
  const context = { project, rangeById: new Map([[range.id, range]]) };

  it("renders millimetre geometry relative to the Range center", () => {
    const svg = new EllipseLayer(layer).toSvg(context);

    expect(svg).toContain('cx="65" cy="50"');
    expect(svg).toContain('rx="20" ry="10"');
    expect(svg).toContain('fill="#BBDEFB" stroke="#1565C0" stroke-width="1.5"');
    expect(svg).toContain('transform="rotate(30 65 50)"');
  });
});
