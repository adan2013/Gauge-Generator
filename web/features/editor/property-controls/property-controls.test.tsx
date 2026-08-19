import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import {
  PendingCommitIndicator,
  PendingCommitProvider,
  RangePropertyRow,
} from "./property-controls";

describe("RangePropertyRow", () => {
  it("keeps a typed value as a draft and clamps it when editing finishes", () => {
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
    const input = screen.getByRole("spinbutton", { name: "Radius" });
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: { value: "2" },
    });

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith("5");
  });

  it("keeps a draft value until a deferred edit is committed", () => {
    const onChange = vi.fn();
    renderEditor(
      <PendingCommitProvider>
        <RangePropertyRow
          label="End value"
          max={1000}
          min={-1000}
          onChange={onChange}
          onInteractionEnd={vi.fn()}
          onInteractionStart={vi.fn()}
          step={1}
          suffix=""
          value="100"
        />
        <PendingCommitIndicator />
      </PendingCommitProvider>,
    );
    const input = screen.getByRole("spinbutton", { name: "End value" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "6" } });

    expect((input as HTMLInputElement).value).toBe("6");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Press Enter or click outside to apply. Esc cancels.")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("6");
    expect(screen.queryByText("Press Enter or click outside to apply. Esc cancels.")).toBeNull();
  });

  it("cancels a deferred edit with Escape", () => {
    const onChange = vi.fn();
    renderEditor(
      <RangePropertyRow
        label="End value"
        max={1000}
        min={-1000}
        onChange={onChange}
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        step={1}
        suffix=""
        value="100"
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "End value" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "6" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect((input as HTMLInputElement).value).toBe("100");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps slider changes live", () => {
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

    fireEvent.change(screen.getByRole("slider", { name: "Adjust Radius" }), {
      target: { value: "20" },
    });

    expect(onChange).toHaveBeenCalledWith("20");
  });
});
