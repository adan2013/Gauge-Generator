import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createEllipseLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { PlanarShapeEditingOverlay } from "./planar-shape-editing-overlay";

describe("PlanarShapeEditingOverlay", () => {
  it("renders center, rotation, and rotated size handles", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    const layer = createEllipseLayer(range.id, project.canvas);
    renderEditor(
      <svg>
        <PlanarShapeEditingOverlay
          canvas={project.canvas}
          displayScale={1}
          layer={layer}
          onInteractionEnd={vi.fn()}
          onInteractionStart={vi.fn()}
          onLayerChange={vi.fn()}
          project={project}
          snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
        />
      </svg>,
    );

    expect(screen.getByLabelText("Shape editing overlay")).toBeTruthy();
    expect(screen.getByLabelText("Move shape")).toBeTruthy();
    expect(screen.getByLabelText("Rotate shape")).toBeTruthy();
    expect(screen.getByLabelText("Resize shape")).toBeTruthy();
  });
});
