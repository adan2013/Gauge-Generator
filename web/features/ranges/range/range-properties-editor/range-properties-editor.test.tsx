import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createProject, createRange } from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { RangePropertiesEditor } from "./range-properties-editor";

describe("RangePropertiesEditor", () => {
  it("commits scale bounds only after the user finishes editing", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    const onRangeChange = vi.fn();
    renderEditor(
      <RangePropertiesEditor
        canvas={project.canvas}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onNameChange={vi.fn()}
        onRangeChange={onRangeChange}
        range={range}
        selectedName={range.name}
        snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "End value" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "6" } });

    expect(onRangeChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onRangeChange).toHaveBeenCalledWith({
      scaleDefinition: { mode: "linear", start: 0, end: 6 },
    });
  });

  it("warns before changing Custom to Logarithmic and resets its values", async () => {
    const range = createRange({
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 20, position: 0 },
          { value: 50, position: 0.8 },
          { value: 80, position: 1 },
        ],
      },
    });
    const onRangeChange = vi.fn();
    renderEditor(
      <RangePropertiesEditor
        canvas={createProject().canvas}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onNameChange={vi.fn()}
        onRangeChange={onRangeChange}
        range={range}
        selectedName={range.name}
        snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Scale mode" }), {
      target: { value: "logarithmic" },
    });

    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(onRangeChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Change mode" }));
    await waitFor(() =>
      expect(onRangeChange).toHaveBeenCalledWith({
        scaleDefinition: {
          mode: "logarithmic",
          start: 1,
          end: 100,
          detailEmphasis: "low-values",
        },
      }),
    );
  });

  it("warns before changing Logarithmic to Custom and opens a clean curve", async () => {
    const range = createRange({
      scaleDefinition: {
        mode: "logarithmic",
        start: 10,
        end: 1_000,
        detailEmphasis: "high-values",
      },
    });
    const onRangeChange = vi.fn();
    renderEditor(
      <RangePropertiesEditor
        canvas={createProject().canvas}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onNameChange={vi.fn()}
        onRangeChange={onRangeChange}
        range={range}
        selectedName={range.name}
        snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Scale mode" }), {
      target: { value: "custom" },
    });
    expect(onRangeChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Change mode" }));
    await waitFor(() =>
      expect(onRangeChange).toHaveBeenCalledWith({
        scaleDefinition: {
          mode: "custom",
          points: [
            { value: 0, position: 0 },
            { value: 100, position: 1 },
          ],
        },
      }),
    );
  });

  it("changes value direction without resetting the current scale", () => {
    const range = createRange({
      scaleDefinition: {
        mode: "logarithmic",
        start: 1,
        end: 10,
        detailEmphasis: "low-values",
      },
    });
    const onRangeChange = vi.fn();
    renderEditor(
      <RangePropertiesEditor
        canvas={createProject().canvas}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onNameChange={vi.fn()}
        onRangeChange={onRangeChange}
        range={range}
        selectedName={range.name}
        snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Value direction" }), {
      target: { value: "descending" },
    });

    expect(onRangeChange).toHaveBeenCalledWith({ valueDirection: "descending" });
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("changes which logarithmic values receive more space", () => {
    const range = createRange({
      scaleDefinition: {
        mode: "logarithmic",
        start: 1,
        end: 10,
        detailEmphasis: "low-values",
      },
    });
    const onRangeChange = vi.fn();
    renderEditor(
      <RangePropertiesEditor
        canvas={createProject().canvas}
        onHistoryTransactionEnd={vi.fn()}
        onHistoryTransactionStart={vi.fn()}
        onNameChange={vi.fn()}
        onRangeChange={onRangeChange}
        range={range}
        selectedName={range.name}
        snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Detail emphasis" }), {
      target: { value: "high-values" },
    });

    expect(onRangeChange).toHaveBeenCalledWith({
      scaleDefinition: { ...range.scaleDefinition, detailEmphasis: "high-values" },
    });
  });
});
