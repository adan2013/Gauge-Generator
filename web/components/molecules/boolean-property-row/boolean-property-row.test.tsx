import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { BooleanPropertyRow } from "./boolean-property-row";

describe("BooleanPropertyRow", () => {
  it("returns the checkbox state", () => {
    const onChange = vi.fn();
    renderEditor(<BooleanPropertyRow checked={true} label="Enable snapping" onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Enable snapping" }));

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
