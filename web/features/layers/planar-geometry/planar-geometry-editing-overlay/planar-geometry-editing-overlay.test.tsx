import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createEllipseLayer,
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { PlanarGeometryEditingOverlay } from "./planar-geometry-editing-overlay";

describe("PlanarGeometryEditingOverlay", () => {
  it("renders center, rotation, and rotated size handles", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    const layer = createEllipseLayer(range.id, project.canvas);
    renderEditor(
      <svg>
        <PlanarGeometryEditingOverlay
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

    expect(screen.getByLabelText("Layer geometry editing overlay")).toBeTruthy();
    expect(screen.getByLabelText("Move layer")).toBeTruthy();
    expect(screen.getByLabelText("Rotate layer")).toBeTruthy();
    expect(screen.getByLabelText("Resize layer")).toBeTruthy();
  });

  it("uses the same overlay for icons", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    renderEditor(
      <svg>
        <PlanarGeometryEditingOverlay
          canvas={project.canvas}
          displayScale={1}
          layer={createIconLayer(range.id, project.canvas)}
          onInteractionEnd={vi.fn()}
          onInteractionStart={vi.fn()}
          onLayerChange={vi.fn()}
          project={project}
          snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
        />
      </svg>,
    );

    expect(screen.getByLabelText("Layer geometry editing overlay")).toBeTruthy();
    expect(screen.getByLabelText("Move layer")).toBeTruthy();
    expect(screen.getByLabelText("Rotate layer")).toBeTruthy();
    expect(screen.getByLabelText("Resize layer")).toBeTruthy();
  });
});
