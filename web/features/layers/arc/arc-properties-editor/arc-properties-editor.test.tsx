import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createArcLayer, createRange } from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { ArcPropertiesEditor } from "./arc-properties-editor";

describe("ArcPropertiesEditor", () => {
  it("edits thickness and flat or rounded end caps without exposing angles", () => {
    const range = createRange();
    const layer = createArcLayer(range.id);
    const onLayerChange = vi.fn();
    renderEditor(
      <ArcPropertiesEditor
        layer={layer}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={onLayerChange}
        ranges={[range]}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: false }}
      />,
    );

    const thickness = screen.getByRole("spinbutton", { name: "Arc thickness" });
    fireEvent.focus(thickness);
    fireEvent.change(thickness, { target: { value: "4" } });
    fireEvent.blur(thickness);
    fireEvent.click(screen.getByRole("checkbox", { name: "Rounded ends" }));

    expect(onLayerChange).toHaveBeenCalledWith({ strokeWidthMm: 4 });
    expect(onLayerChange).toHaveBeenCalledWith({ roundedEnds: true });
    expect(screen.queryByRole("spinbutton", { name: /angle/i })).toBeNull();
  });
});
