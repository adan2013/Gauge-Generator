import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { PropertiesPanel } from "./properties-panel";

describe("PropertiesPanel", () => {
  it("lets a visual layer choose its source Range", () => {
    const first = createRange({ name: "First" });
    const second = createRange({ name: "Second" });
    const layer = createTickScaleLayer(first.id);
    const onLayerRangeChange = vi.fn();
    renderEditor(
      <PropertiesPanel
        canvas={createProject().canvas}
        onBack={vi.fn()}
        onCreateLayer={vi.fn()}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={vi.fn()}
        onLayerPreviewModifiersChange={vi.fn()}
        onLayerRangeChange={onLayerRangeChange}
        onNameChange={vi.fn()}
        onRangeChange={vi.fn()}
        onResetLayer={vi.fn()}
        ranges={[first, second]}
        layerPreviewModifiers={{
          bringSelectedLayerToFront: false,
          showEditingOverlay: true,
          showOnlySelectedLayer: false,
        }}
        selectedLayer={layer}
        selectedName={layer.name}
        selectedObject={{ collection: "layers", id: layer.id }}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Source Range" }), {
      target: { value: second.id },
    });
    expect(onLayerRangeChange).toHaveBeenCalledWith(second.id);
  });

  it("shows a Tick Scale color preview together with its hexadecimal value", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { color: "#C62828" });
    const onLayerChange = vi.fn();
    renderEditor(
      <PropertiesPanel
        canvas={createProject().canvas}
        onBack={vi.fn()}
        onCreateLayer={vi.fn()}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={onLayerChange}
        onLayerPreviewModifiersChange={vi.fn()}
        onLayerRangeChange={vi.fn()}
        onNameChange={vi.fn()}
        onRangeChange={vi.fn()}
        onResetLayer={vi.fn()}
        ranges={[range]}
        layerPreviewModifiers={{
          bringSelectedLayerToFront: false,
          showEditingOverlay: true,
          showOnlySelectedLayer: false,
        }}
        selectedLayer={layer}
        selectedName={layer.name}
        selectedObject={{ collection: "layers", id: layer.id }}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );

    expect(screen.getByText("#C62828")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Color"), { target: { value: "#a61f1f" } });
    expect(onLayerChange).toHaveBeenCalledWith({ color: "#A61F1F" });
  });
});
