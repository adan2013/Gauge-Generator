import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import {
  PendingCommitIndicator,
  PendingCommitProvider,
  RangePropertyRow,
  TextPropertyRow,
} from "./property-controls";

describe("TextPropertyRow", () => {
  it("keeps an empty value as a draft and commits it on blur", () => {
    const onChange = vi.fn();
    renderEditor(
      <TextPropertyRow
        label="Text"
        onChange={onChange}
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        value="Label"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Text" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });

    expect((input as HTMLInputElement).value).toBe("");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("commits with Enter and cancels with Escape", () => {
    const onChange = vi.fn();
    renderEditor(
      <TextPropertyRow
        label="Name"
        onChange={onChange}
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        value="Original"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Name" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Changed");

    onChange.mockClear();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Cancelled" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

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

  it("shows a status message when a numeric draft is empty", () => {
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
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);

    expect(screen.getByText("Enter a number for Radius between 5 and 50.")).toBeTruthy();
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
