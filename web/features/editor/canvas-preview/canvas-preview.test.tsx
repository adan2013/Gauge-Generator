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
        layerPreviewModifiers={{
          bringSelectedLayerToFront: false,
          showEditingOverlay: true,
          showOnlySelectedLayer: false,
        }}
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
        layerPreviewModifiers={{
          bringSelectedLayerToFront: false,
          showEditingOverlay: true,
          showOnlySelectedLayer: false,
        }}
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
        layerPreviewModifiers={{
          bringSelectedLayerToFront: false,
          showEditingOverlay: true,
          showOnlySelectedLayer: false,
        }}
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

  it("keeps the selected layer isolated when the global preview modifier is enabled", () => {
    const range = createRange();
    const firstLayer = createTickScaleLayer(range.id, { valueEnd: 20, valueStep: 10 });
    const selectedLayer = createTickScaleLayer(range.id, { valueEnd: 40, valueStep: 10 });
    const project = createProject({ ranges: [range], layers: [firstLayer, selectedLayer] });
    const { container } = renderEditor(
      <CanvasPreview
        hoveredLayerId={firstLayer.id}
        layerPreviewModifiers={{
          bringSelectedLayerToFront: false,
          showEditingOverlay: true,
          showOnlySelectedLayer: true,
        }}
        onBrowseExamples={vi.fn()}
        onCreateRange={vi.fn()}
        onLayerChange={vi.fn()}
        onLayerInteractionEnd={vi.fn()}
        onLayerInteractionStart={vi.fn()}
        onRangeChange={vi.fn()}
        onRangeInteractionEnd={vi.fn()}
        onRangeInteractionStart={vi.fn()}
        project={project}
        selectedLayer={selectedLayer}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );

    expect(container.querySelectorAll("line")).toHaveLength(5);
  });

  it("renders the selected layer last when the front modifier is enabled", () => {
    const range = createRange();
    const firstLayer = createTickScaleLayer(range.id, {
      color: "#00AA00",
      valueEnd: 10,
      valueStep: 10,
    });
    const selectedLayer = createTickScaleLayer(range.id, {
      color: "#C62828",
      valueEnd: 10,
      valueStep: 10,
    });
    const project = createProject({ ranges: [range], layers: [firstLayer, selectedLayer] });
    const { container } = renderEditor(
      <CanvasPreview
        hoveredLayerId={null}
        layerPreviewModifiers={{
          bringSelectedLayerToFront: true,
          showEditingOverlay: false,
          showOnlySelectedLayer: false,
        }}
        onBrowseExamples={vi.fn()}
        onCreateRange={vi.fn()}
        onLayerChange={vi.fn()}
        onLayerInteractionEnd={vi.fn()}
        onLayerInteractionStart={vi.fn()}
        onRangeChange={vi.fn()}
        onRangeInteractionEnd={vi.fn()}
        onRangeInteractionStart={vi.fn()}
        project={project}
        selectedLayer={selectedLayer}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );

    expect(container.querySelectorAll("line").item(3).getAttribute("stroke")).toBe("#C62828");
    expect(container.querySelector('[data-testid="tick-scale-editing-overlay"]')).toBeNull();
  });
});
