import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createEllipseLayer,
  createProject,
  createRange,
  createRectangleLayer,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { PlanarShapePropertiesEditor } from "./planar-shape-properties-editor";

describe("PlanarShapePropertiesEditor", () => {
  const range = createRange();
  const canvas = createProject().canvas;
  const baseProps = {
    canvas,
    onHistoryTransactionEnd: vi.fn(),
    onHistoryTransactionStart: vi.fn(),
    onLayerChange: vi.fn(),
    snapping: { angleDegrees: 10, distanceMm: 2, enabled: false },
    ranges: [range],
  };

  it("edits shared nested geometry and style", () => {
    const layer = createEllipseLayer(range.id, canvas);
    const onLayerChange = vi.fn();
    renderEditor(
      <PlanarShapePropertiesEditor {...baseProps} layer={layer} onLayerChange={onLayerChange} />,
    );
    const width = screen.getByRole("spinbutton", { name: "Width" });
    fireEvent.focus(width);
    fireEvent.change(width, { target: { value: "42.5" } });
    fireEvent.blur(width);
    const borderWidth = screen.getByRole("spinbutton", { name: "Border width" });
    fireEvent.focus(borderWidth);
    fireEvent.change(borderWidth, { target: { value: "1.5" } });
    fireEvent.blur(borderWidth);

    expect(onLayerChange).toHaveBeenCalledWith({
      geometry: { ...layer.geometry, widthMm: 42.5 },
    });
    expect(onLayerChange).toHaveBeenCalledWith({
      style: { ...layer.style, borderWidthMm: 1.5 },
    });
    expect(screen.queryByRole("spinbutton", { name: "Corner radius" })).toBeNull();
  });

  it("exposes Rectangle corner radius", () => {
    renderEditor(
      <PlanarShapePropertiesEditor {...baseProps} layer={createRectangleLayer(range.id, canvas)} />,
    );

    expect(screen.getByRole("spinbutton", { name: "Corner radius" })).toBeTruthy();
  });
});
