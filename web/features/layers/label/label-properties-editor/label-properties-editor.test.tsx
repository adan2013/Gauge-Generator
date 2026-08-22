import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createLabelLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { LabelPropertiesEditor } from "./label-properties-editor";

describe("LabelPropertiesEditor", () => {
  const canvas = createProject().canvas;

  it("edits content and keeps point-layout updates nested", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id);
    const onLayerChange = vi.fn();
    renderEditor(
      <LabelPropertiesEditor
        canvas={canvas}
        layer={layer}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onLayerChange={onLayerChange}
        ranges={[range]}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: false }}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), {
      target: { value: "Pressure" },
    });
    const rotation = screen.getByRole("spinbutton", { name: "Rotation" });
    fireEvent.focus(rotation);
    fireEvent.change(rotation, { target: { value: "45" } });
    fireEvent.blur(rotation);

    expect(onLayerChange).toHaveBeenCalledWith({ text: "Pressure" });
    expect(onLayerChange).toHaveBeenCalledWith({
      layout: { ...layer.layout, rotationDegrees: 45 },
    });
  });

  it("switches to a Range-mapped text path and edits its own controls", () => {
    const range = createRange({
      scaleDefinition: { mode: "linear", start: 10, end: 90 },
    });
    const layer = createLabelLayer(range.id);
    const onLayerChange = vi.fn();
    const sharedProps = {
      canvas,
      onHistoryTransactionEnd: vi.fn(),
      onHistoryTransactionStart: vi.fn(),
      onLayerChange,
      ranges: [range],
      snapping: { angleDegrees: 10, distanceMm: 2, enabled: false },
    };
    const { unmount } = renderEditor(<LabelPropertiesEditor {...sharedProps} layer={layer} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Text layout" }), {
      target: { value: "text-arc" },
    });
    expect(onLayerChange).toHaveBeenCalledWith({
      layout: {
        mode: "text-arc",
        radiusOffsetMm: 0,
        valueStart: 10,
        valueEnd: 90,
        alignment: "center",
        direction: "forward",
      },
    });

    unmount();
    const textArcLayer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: 0,
        valueStart: 10,
        valueEnd: 90,
        alignment: "center",
        direction: "forward",
      },
    });
    renderEditor(<LabelPropertiesEditor {...sharedProps} layer={textArcLayer} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Direction" }), {
      target: { value: "reverse" },
    });

    expect(onLayerChange).toHaveBeenLastCalledWith({
      layout: { ...textArcLayer.layout, direction: "reverse" },
    });
  });
});
