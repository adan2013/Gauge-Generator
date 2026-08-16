import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { ColorPropertyRow } from "./color-property-row";

describe("ColorPropertyRow", () => {
  it("normalizes a selected color to uppercase hexadecimal", () => {
    const onChange = vi.fn();
    renderEditor(<ColorPropertyRow label="Color" onChange={onChange} value="#C62828" />);

    fireEvent.change(screen.getByLabelText("Color"), { target: { value: "#a61f1f" } });

    expect(onChange).toHaveBeenCalledWith("#A61F1F");
  });
});
