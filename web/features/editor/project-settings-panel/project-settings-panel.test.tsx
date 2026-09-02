import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { ProjectSettingsPanel } from "./project-settings-panel";

const props = {
  angleSnap: "10",
  background: "#FFFFFF",
  canvasHeight: "120",
  canvasWidth: "120",
  distanceSnap: "2",
  snapEnabled: true,
  title: "Pressure gauge",
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
  onTitleChange: vi.fn(),
  onTransparentBackgroundChange: vi.fn(),
};
describe("ProjectSettingsPanel", () => {
  beforeEach(() => vi.clearAllMocks());

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

  it("commits a trimmed project title and restores an empty draft", () => {
    renderEditor(<ProjectSettingsPanel {...props} />);
    const input = screen.getByRole("textbox", { name: "Title" }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  New gauge  " } });
    fireEvent.blur(input);
    expect(props.onTitleChange).toHaveBeenCalledWith("New gauge");

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.blur(input);
    expect(props.onTitleChange).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("Pressure gauge");
  });
});
