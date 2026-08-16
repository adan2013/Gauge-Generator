import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRange, createTickScaleLayer } from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LayersBrowser } from "./layers-browser";

describe("LayersBrowser", () => {
  it("shows the separated Range count", () => {
    renderEditor(
      <LayersBrowser
        layers={[]}
        onCreateLayer={vi.fn()}
        onCreateRange={vi.fn()}
        onDeleteLayer={vi.fn()}
        onDeleteRange={vi.fn()}
        onOpenLayerProperties={vi.fn()}
        onOpenProjectSettings={vi.fn()}
        onOpenRangeProperties={vi.fn()}
        onReorderLayer={vi.fn()}
        onToggleLayerVisibility={vi.fn()}
        ranges={[createRange()]}
      />,
    );
    expect(screen.getByText("1 / 5")).toBeTruthy();
  });

  it("requires confirmation before deleting a visual layer", async () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { name: "Major ticks" });
    const onDeleteLayer = vi.fn();
    renderEditor(
      <LayersBrowser
        layers={[layer]}
        onCreateLayer={vi.fn()}
        onCreateRange={vi.fn()}
        onDeleteLayer={onDeleteLayer}
        onDeleteRange={vi.fn()}
        onOpenLayerProperties={vi.fn()}
        onOpenProjectSettings={vi.fn()}
        onOpenRangeProperties={vi.fn()}
        onReorderLayer={vi.fn()}
        onToggleLayerVisibility={vi.fn()}
        ranges={[range]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete Major ticks" }));
    expect(onDeleteLayer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDeleteLayer).toHaveBeenCalledWith(layer.id));
  });
});
