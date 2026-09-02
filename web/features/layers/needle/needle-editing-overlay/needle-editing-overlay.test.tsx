import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createNeedleLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { NeedleEditingOverlay } from "./needle-editing-overlay";

describe("NeedleEditingOverlay", () => {
  it("renders value, shaft length, and tail length handles", () => {
    const range = createRange();
    const layer = createNeedleLayer(range);
    const project = createProject({ ranges: [range], layers: [layer] });
    renderEditor(
      <svg>
        <NeedleEditingOverlay
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

    expect(screen.getByLabelText("Needle editing overlay")).toBeTruthy();
    expect(screen.getByLabelText("Adjust indicated value")).toBeTruthy();
    expect(screen.getByLabelText("Adjust shaft length")).toBeTruthy();
    expect(screen.getByLabelText("Adjust tail length")).toBeTruthy();
  });
});
