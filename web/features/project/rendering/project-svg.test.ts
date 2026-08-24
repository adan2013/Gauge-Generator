import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { renderProjectSvgDocument } from "./project-svg";

describe("project SVG renderer", () => {
  it("creates a physical-size document in project order without hidden layers", () => {
    const range = createRange();
    const topLayer = createTickScaleLayer(range.id, { color: "#CC0000", name: "Top" });
    const bottomLayer = createTickScaleLayer(range.id, { color: "#0000CC", name: "Bottom" });
    const hiddenLayer = createTickScaleLayer(range.id, { name: "Hidden", visible: false });
    const project = createProject({
      canvas: {
        background: "#F0E0D0",
        heightMm: 80,
        transparentBackground: false,
        widthMm: 120,
      },
      layers: [topLayer, bottomLayer, hiddenLayer],
      meta: {
        createdAt: "2026-01-01T00:00:00.000Z",
        title: "Clock & dial",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      ranges: [range],
    });

    const svg = renderProjectSvgDocument(project, new Map());

    expect(svg).toContain('width="120mm" height="80mm" viewBox="0 0 120 80"');
    expect(svg).toContain("<title>Clock &amp; dial</title>");
    expect(svg).toContain('fill="#F0E0D0"');
    expect(svg).not.toContain(hiddenLayer.id);
    expect(svg.indexOf(bottomLayer.id)).toBeLessThan(svg.indexOf(topLayer.id));
  });

  it("renders a selected layer on a transparent full-size canvas", () => {
    const range = createRange();
    const firstLayer = createTickScaleLayer(range.id);
    const selectedLayer = createTickScaleLayer(range.id);
    const project = createProject({ layers: [firstLayer, selectedLayer], ranges: [range] });

    const svg = renderProjectSvgDocument(project, new Map(), {
      layerIds: new Set([selectedLayer.id]),
      transparentBackground: true,
    });

    expect(svg).toContain(selectedLayer.id);
    expect(svg).not.toContain(firstLayer.id);
    expect(svg).not.toContain(`fill="${project.canvas.background}"`);
  });
});
