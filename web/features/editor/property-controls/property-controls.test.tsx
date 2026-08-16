import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { RangePropertyRow } from "./property-controls";

describe("RangePropertyRow", () => {
  it("keeps values inside its declared bounds", () => {
    const onChange = vi.fn();
    renderEditor(
      <RangePropertyRow
        label="Radius"
        max={50}
        min={5}
        onChange={onChange}
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        step={1}
        suffix="mm"
        value="10"
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Radius" }), {
      target: { value: "2" },
    });
    expect(onChange).toHaveBeenCalledWith("5");
  });
});
