import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createArcLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { ArcEditingOverlay } from "./arc-editing-overlay";

describe("ArcEditingOverlay", () => {
  it("renders the shared Range-mapped radius handle", () => {
    const range = createRange();
    const layer = createArcLayer(range.id, { radiusOffsetMm: 4 });
    const project = createProject({ ranges: [range], layers: [layer] });

    renderEditor(
      <svg viewBox="0 0 120 120">
        <ArcEditingOverlay
          canvas={project.canvas}
          displayScale={1}
          layer={layer}
          onInteractionEnd={vi.fn()}
          onInteractionStart={vi.fn()}
          onLayerChange={vi.fn()}
          project={project}
          snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
        />
      </svg>,
    );

    expect(screen.getByTestId("arc-editing-overlay")).toBeTruthy();
    expect(screen.getByLabelText("Adjust arc radius")).toBeTruthy();
    expect(screen.getByText("4 mm")).toBeTruthy();
  });
});
