import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { LayerEditorControls } from "./layer-editor-controls";

describe("LayerEditorControls", () => {
  const modifiers = {
    showOnlySelectedLayer: false,
    bringSelectedLayerToFront: false,
    showEditingOverlay: true,
  };

  it("changes a preview modifier without coupling it to a layer", () => {
    const onModifiersChange = vi.fn();
    renderEditor(
      <LayerEditorControls
        modifiers={modifiers}
        onModifiersChange={onModifiersChange}
        onReset={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("Display only this layer"));

    expect(onModifiersChange).toHaveBeenCalledWith({ ...modifiers, showOnlySelectedLayer: true });
  });

  it("marks an enabled modifier as pressed", () => {
    renderEditor(
      <LayerEditorControls
        modifiers={{ ...modifiers, showEditingOverlay: true }}
        onModifiersChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Show editing overlay" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("shows an immediate tooltip for an icon-only preview control", async () => {
    renderEditor(
      <LayerEditorControls modifiers={modifiers} onModifiersChange={vi.fn()} onReset={vi.fn()} />,
    );

    fireEvent.pointerMove(screen.getByRole("button", { name: "Display only this layer" }));

    expect((await screen.findByRole("tooltip")).textContent).toBe("Display only this layer");
  });

  it("requires confirmation before resetting the selected layer", async () => {
    const onReset = vi.fn();
    renderEditor(
      <LayerEditorControls modifiers={modifiers} onModifiersChange={vi.fn()} onReset={onReset} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset layer" }));

    expect(onReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(onReset).toHaveBeenCalledOnce());
  });
});
