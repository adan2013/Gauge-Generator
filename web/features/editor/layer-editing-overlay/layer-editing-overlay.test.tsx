import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createNumericScaleLayer,
  createArcLayer,
  createLabelLayer,
  createNeedleLayer,
  createEllipseLayer,
  createRectangleLayer,
  createLineLayer,
  createIconLayer,
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LayerEditingOverlay } from "./layer-editing-overlay";

describe("LayerEditingOverlay", () => {
  const range = createRange();
  const baseProps = {
    canvas: createProject().canvas,
    displayScale: 1,
    onInteractionEnd: vi.fn(),
    onInteractionStart: vi.fn(),
    onLayerChange: vi.fn(),
    project: createProject({ ranges: [range] }),
    snapping: { angleDegrees: 10, distanceMm: 2, enabled: true },
  };

  it.each([
    ["tick-scale", createTickScaleLayer(range.id), "tick-scale-editing-overlay"],
    ["numeric-scale", createNumericScaleLayer(range.id), "numeric-scale-editing-overlay"],
    ["label", createLabelLayer(range.id), "label-editing-overlay"],
    ["arc", createArcLayer(range.id), "arc-editing-overlay"],
    ["needle", createNeedleLayer(range), "needle-editing-overlay"],
    ["ellipse", createEllipseLayer(range.id, baseProps.canvas), "ellipse-editing-overlay"],
    ["rectangle", createRectangleLayer(range.id, baseProps.canvas), "rectangle-editing-overlay"],
    ["line", createLineLayer(range.id, baseProps.canvas), "line-editing-overlay"],
    ["icon", createIconLayer(range.id, baseProps.canvas), "icon-editing-overlay"],
  ] as const)("selects the %s overlay from the registry", (_, layer, testId) => {
    renderEditor(
      <svg>
        <LayerEditingOverlay {...baseProps} layer={layer} />
      </svg>,
    );

    expect(screen.getByTestId(testId)).toBeTruthy();
  });
});
