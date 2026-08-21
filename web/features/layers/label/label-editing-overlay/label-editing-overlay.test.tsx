import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createLabelLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LabelEditingOverlay } from "./label-editing-overlay";

describe("LabelEditingOverlay", () => {
  it("renders the layer-owned position and rotation controls", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id);
    const project = createProject({ ranges: [range], layers: [layer] });
    renderEditor(
      <svg>
        <LabelEditingOverlay
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

    expect(screen.getByLabelText("Label editing overlay")).toBeTruthy();
    expect(screen.getByLabelText("Move label")).toBeTruthy();
    expect(screen.getByLabelText("Rotate label")).toBeTruthy();
  });

  it("renders the text-path radius control for an arc layout", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: 0,
        valueStart: 0,
        valueEnd: 100,
        alignment: "center",
        direction: "forward",
      },
    });
    const project = createProject({ ranges: [range], layers: [layer] });
    renderEditor(
      <svg>
        <LabelEditingOverlay
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

    expect(screen.getByLabelText("Adjust text path radius")).toBeTruthy();
  });
});
