import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { ProjectSettingsPanel } from "./project-settings-panel";

const props = {
  angleSnap: "10",
  background: "#FFFFFF",
  canvasHeight: "120",
  canvasWidth: "120",
  distanceSnap: "2",
  snapEnabled: true,
  transparentBackground: true,
  onAngleSnapChange: vi.fn(),
  onBack: vi.fn(),
  onBackgroundChange: vi.fn(),
  onCanvasHeightChange: vi.fn(),
  onCanvasWidthChange: vi.fn(),
  onDistanceSnapChange: vi.fn(),
  onHistoryTransactionEnd: vi.fn(),
  onHistoryTransactionStart: vi.fn(),
  onSnapEnabledChange: vi.fn(),
  onTransparentBackgroundChange: vi.fn(),
};
describe("ProjectSettingsPanel", () => {
  it("clamps canvas dimensions before passing them to the editor", () => {
    renderEditor(<ProjectSettingsPanel {...props} />);
    const input = screen.getByRole("spinbutton", { name: "Width" });
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: { value: "-10" },
    });
    expect(props.onCanvasWidthChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(props.onCanvasWidthChange).toHaveBeenCalledWith("20");
  });
});
