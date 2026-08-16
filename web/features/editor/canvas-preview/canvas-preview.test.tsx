import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { CanvasPreview } from "./canvas-preview";

describe("CanvasPreview", () => {
  it("renders the empty-project welcome state", () => {
    const project = createProject();
    renderEditor(
      <CanvasPreview
        hoveredLayerId={null}
        onBrowseExamples={vi.fn()}
        onCreateRange={vi.fn()}
        onLayerChange={vi.fn()}
        onLayerInteractionEnd={vi.fn()}
        onLayerInteractionStart={vi.fn()}
        onRangeChange={vi.fn()}
        onRangeInteractionEnd={vi.fn()}
        onRangeInteractionStart={vi.fn()}
        project={project}
        selectedLayer={undefined}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Your canvas is ready" })).toBeTruthy();
  });

  it("renders visible Tick Scale SVG elements in the project preview", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { valueEnd: 20, valueStep: 10 });
    const project = createProject({ ranges: [range], layers: [layer] });
    const { container } = renderEditor(
      <CanvasPreview
        hoveredLayerId={null}
        onBrowseExamples={vi.fn()}
        onCreateRange={vi.fn()}
        onLayerChange={vi.fn()}
        onLayerInteractionEnd={vi.fn()}
        onLayerInteractionStart={vi.fn()}
        onRangeChange={vi.fn()}
        onRangeInteractionEnd={vi.fn()}
        onRangeInteractionStart={vi.fn()}
        project={project}
        selectedLayer={undefined}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );

    expect(container.querySelectorAll("line")).toHaveLength(3);
  });

  it("temporarily isolates the hovered layer in the preview", () => {
    const range = createRange();
    const firstLayer = createTickScaleLayer(range.id, { valueEnd: 20, valueStep: 10 });
    const hoveredLayer = createTickScaleLayer(range.id, { valueEnd: 40, valueStep: 10 });
    const project = createProject({ ranges: [range], layers: [firstLayer, hoveredLayer] });
    const { container } = renderEditor(
      <CanvasPreview
        hoveredLayerId={hoveredLayer.id}
        onBrowseExamples={vi.fn()}
        onCreateRange={vi.fn()}
        onLayerChange={vi.fn()}
        onLayerInteractionEnd={vi.fn()}
        onLayerInteractionStart={vi.fn()}
        onRangeChange={vi.fn()}
        onRangeInteractionEnd={vi.fn()}
        onRangeInteractionStart={vi.fn()}
        project={project}
        selectedLayer={undefined}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );

    expect(container.querySelectorAll("line")).toHaveLength(5);
  });
});
