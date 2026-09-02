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
  });

  it("duplicates a layer with the name submitted from the modal", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { name: "Major ticks" });
    const onDuplicateLayer = vi.fn();
    renderEditor(
      <LayersBrowser
        layers={[layer]}
        onCreateLayer={vi.fn()}
        onCreateRange={vi.fn()}
        onDeleteLayer={vi.fn()}
        onDeleteRange={vi.fn()}
        onDuplicateLayer={onDuplicateLayer}
        onHoverLayer={vi.fn()}
        onOpenLayerProperties={vi.fn()}
        onOpenProjectSettings={vi.fn()}
        onOpenRangeProperties={vi.fn()}
        onReorderLayer={vi.fn()}
        onToggleLayerVisibility={vi.fn()}
        project={createProject({ layers: [layer], ranges: [range] })}
        ranges={[range]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Duplicate Major ticks" }));
    expect(onDuplicateLayer).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Duplicate layer" });
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    const nameInput = screen.getByRole("textbox", { name: "Layer name" }) as HTMLInputElement;
    expect(nameInput.value).toBe("Major ticks");
    expect(nameInput.selectionStart).toBe(0);
    expect(nameInput.selectionEnd).toBe("Major ticks".length);

    fireEvent.change(nameInput, { target: { value: "Copied markers" } });
    fireEvent.click(screen.getByRole("button", { name: "Duplicate" }));

    expect(onDuplicateLayer).toHaveBeenCalledWith(layer.id, "Copied markers");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
