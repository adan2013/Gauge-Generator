import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createLineLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LineEditingOverlay } from "./line-editing-overlay";

describe("LineEditingOverlay", () => {
  it("renders center and both endpoint handles", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    renderEditor(
      <svg>
        <LineEditingOverlay
          canvas={project.canvas}
          displayScale={1}
          layer={createLineLayer(range.id, project.canvas)}
          onInteractionEnd={vi.fn()}
          onInteractionStart={vi.fn()}
          onLayerChange={vi.fn()}
          project={project}
          snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
        />
      </svg>,
    );

    expect(screen.getByLabelText("Line editing overlay")).toBeTruthy();
    expect(screen.getByLabelText("Move line")).toBeTruthy();
    expect(screen.getByLabelText("Adjust line start")).toBeTruthy();
    expect(screen.getByLabelText("Adjust line end")).toBeTruthy();
    expect(screen.getAllByTestId("layer-handle-label-background")).toHaveLength(1);
    expect(screen.getByText("0; 0 mm")).toBeTruthy();
  });
});
