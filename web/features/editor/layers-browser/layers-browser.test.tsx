import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LayersBrowser } from "./layers-browser";

describe("LayersBrowser", () => {
  it("shows the separated Range count", () => {
    const range = createRange();
    renderEditor(
      <LayersBrowser
        layers={[]}
        onCreateLayer={vi.fn()}
        onCreateRange={vi.fn()}
        onDuplicateLayer={vi.fn()}
        onDeleteLayer={vi.fn()}
        onDeleteRange={vi.fn()}
        onHoverLayer={vi.fn()}
        onOpenLayerProperties={vi.fn()}
        onOpenProjectSettings={vi.fn()}
        onOpenRangeProperties={vi.fn()}
        onReorderLayer={vi.fn()}
        onToggleLayerVisibility={vi.fn()}
        project={createProject({ ranges: [range] })}
        ranges={[range]}
      />,
    );
    expect(screen.getByText("1 / 5")).toBeTruthy();
  });

  it("requires confirmation before deleting a visual layer", async () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { name: "Major ticks" });
    const onDeleteLayer = vi.fn();
    const onDuplicateLayer = vi.fn();
    const onHoverLayer = vi.fn();
    renderEditor(
      <LayersBrowser
        layers={[layer]}
        onCreateLayer={vi.fn()}
        onCreateRange={vi.fn()}
        onDuplicateLayer={onDuplicateLayer}
        onDeleteLayer={onDeleteLayer}
        onDeleteRange={vi.fn()}
        onHoverLayer={onHoverLayer}
        onOpenLayerProperties={vi.fn()}
        onOpenProjectSettings={vi.fn()}
        onOpenRangeProperties={vi.fn()}
        onReorderLayer={vi.fn()}
        onToggleLayerVisibility={vi.fn()}
        project={createProject({ layers: [layer], ranges: [range] })}
        ranges={[range]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete Major ticks" }));
    expect(onDeleteLayer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDeleteLayer).toHaveBeenCalledWith(layer.id));
    fireEvent.pointerEnter(screen.getByTestId(`layer-thumbnail-${layer.id}`));
    expect(onHoverLayer).toHaveBeenLastCalledWith(layer.id);
    fireEvent.pointerLeave(screen.getByTestId(`layer-thumbnail-${layer.id}`));
    expect(onHoverLayer).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "Duplicate Major ticks" }));
    expect(onDuplicateLayer).toHaveBeenCalledWith(layer.id);
  });
});
