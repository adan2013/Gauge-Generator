import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { SelectPropertyRow } from "./select-property-row";

describe("SelectPropertyRow", () => {
  it("renders options and returns the selected value", () => {
    const onChange = vi.fn();
    renderEditor(
      <SelectPropertyRow
        label="Source Range"
        onChange={onChange}
        options={[
          { label: "First", value: "first" },
          { label: "Second", value: "second" },
        ]}
        value="first"
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Source Range" }), {
      target: { value: "second" },
    });

    expect(onChange).toHaveBeenCalledWith("second");
  });
});
