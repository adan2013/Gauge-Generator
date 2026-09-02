import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createNeedleLayer, createRange } from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { NeedlePropertiesEditor } from "./needle-properties-editor";

describe("NeedlePropertiesEditor", () => {
  it("edits Range value and nested shaft and hub settings", () => {
    const range = createRange();
    const layer = createNeedleLayer(range);
    const onLayerChange = vi.fn();
    renderEditor(
      <NeedlePropertiesEditor
        layer={layer}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={onLayerChange}
        ranges={[range]}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: false }}
      />,
    );

    const value = screen.getByRole("spinbutton", { name: "Value" });
    fireEvent.focus(value);
    fireEvent.change(value, {
      target: { value: "72" },
    });
    fireEvent.blur(value);
    const length = screen.getByRole("spinbutton", { name: "Length" });
    fireEvent.focus(length);
    fireEvent.change(length, {
      target: { value: "35" },
    });
    fireEvent.blur(length);
    fireEvent.click(screen.getByRole("checkbox", { name: "Show hub" }));

    expect(onLayerChange).toHaveBeenCalledWith({ value: 72 });
    expect(onLayerChange).toHaveBeenCalledWith({
      shaft: { ...layer.shaft, lengthMm: 35 },
    });
    expect(onLayerChange).toHaveBeenCalledWith({ hub: { ...layer.hub, visible: false } });
    expect(screen.getByRole("option", { name: "Arrowhead" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Rounded taper" })).toBeTruthy();
  });
});
