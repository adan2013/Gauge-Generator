import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createLineLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LinePropertiesEditor } from "./line-properties-editor";

describe("LinePropertiesEditor", () => {
  it("edits nested geometry and appearance", () => {
    const range = createRange();
    const canvas = createProject().canvas;
    const layer = createLineLayer(range.id, canvas);
    const onLayerChange = vi.fn();
    renderEditor(
      <LinePropertiesEditor
        canvas={canvas}
        layer={layer}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={onLayerChange}
        ranges={[range]}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: false }}
      />,
    );

    const length = screen.getByRole("spinbutton", { name: "Length" });
    fireEvent.focus(length);
    fireEvent.change(length, { target: { value: "42.5" } });
    fireEvent.blur(length);
    const roundedEnds = screen.getByRole("checkbox", { name: "Rounded ends" });
    fireEvent.click(roundedEnds);

    expect(onLayerChange).toHaveBeenCalledWith({
      geometry: { ...layer.geometry, lengthMm: 42.5 },
    });
    expect(onLayerChange).toHaveBeenCalledWith({
      style: { ...layer.style, roundedEnds: true },
    });
  });
});
