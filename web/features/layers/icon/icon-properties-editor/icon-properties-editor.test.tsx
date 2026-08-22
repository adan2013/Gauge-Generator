import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { IconPropertiesEditor } from "./icon-properties-editor";

describe("IconPropertiesEditor", () => {
  it("selects a catalog icon and edits nested geometry", () => {
    const range = createRange();
    const canvas = createProject().canvas;
    const layer = createIconLayer(range.id, canvas);
    const onLayerChange = vi.fn();
    renderEditor(
      <IconPropertiesEditor
        canvas={canvas}
        layer={layer}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={onLayerChange}
        ranges={[range]}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: false }}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Lucide icons" }), {
      target: { value: "rainbow" },
    });
    fireEvent.click(screen.getByRole("button", { name: "rainbow" }));
    const width = screen.getByRole("spinbutton", { name: "Width" });
    fireEvent.focus(width);
    fireEvent.change(width, { target: { value: "24" } });
    fireEvent.blur(width);

    expect(onLayerChange).toHaveBeenCalledWith({
      icon: { library: "lucide", name: "rainbow" },
    });
    expect(onLayerChange).toHaveBeenCalledWith({
      geometry: { ...layer.geometry, widthMm: 24 },
    });
  });
});
