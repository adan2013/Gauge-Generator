import { fireEvent, screen } from "@testing-library/react";
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
});
