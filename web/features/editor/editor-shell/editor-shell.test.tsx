import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { EditorShell } from "./editor-shell";

describe("EditorShell", () => {
  it("opens the properties view from the empty Range call to action", () => {
    renderEditor(<EditorShell />);
    expect(screen.queryByText("Stage 1 interface prototype")).toBeNull();
    expect(screen.getByLabelText("Preview details").textContent).toContain("120 × 120 mm");
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    expect(screen.getByRole("heading", { name: "Range setup" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Back to layers" })).toHaveLength(2);
  });

  it("returns to the separated Layers and Ranges view", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[0]);
    expect(screen.getByRole("heading", { name: "Visual layers" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ranges" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Range 1/ })).toBeTruthy();
  });

  it("keeps visual layers separate from Ranges", () => {
    renderEditor(<EditorShell />);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Layer" }).disabled).toBe(true);

    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Layer" }));
    expect(screen.getByRole("heading", { name: "Layer setup" })).toBeTruthy();
  });

  it("prompts for a visual layer after the first Range is created", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);

    expect(screen.getByRole("heading", { name: "Your Range is ready" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Create first Layer" })).toHaveLength(1);
    expect(screen.queryByText("Create your first Range to define a dial, or select one of the starter examples.")).toBeNull();
  });

  it("shows the SVG preview instead of a welcome prompt once a visual layer exists", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Create first Layer" }));

    expect(screen.getByRole("img", { name: "Gauge preview" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Your canvas is ready" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Your Range is ready" })).toBeNull();
  });

  it("allows custom names for Ranges and visual layers", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Engine range" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[1]);
    expect(screen.getByRole("button", { name: /^Engine range/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Layer" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Major ticks" } });
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Name" }).value).toBe("Major ticks");
  });

  it("opens project settings from Layers", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    expect(screen.getByRole("heading", { name: "Project settings" })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>("spinbutton", { name: "Width" }).value).toBe("120");
  });

  it("keeps a Range slider synchronized with its number input", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.change(screen.getByRole("slider", { name: "Adjust Opening angle" }), { target: { value: "180" } });
    expect(screen.getByRole<HTMLInputElement>("spinbutton", { name: "Opening angle" }).value).toBe("180");
  });

  it("constrains numeric controls to their declared bounds before committing to the store", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Width" }), { target: { value: "-25" } });

    expect(screen.getByRole<HTMLInputElement>("spinbutton", { name: "Width" }).value).toBe("20");
  });

  it("uses project dimensions for preview proportion, but keeps welcome states square", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Width" }), { target: { value: "240" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);

    expect(screen.getByTestId("canvas-frame").style.aspectRatio).toBe("1 / 1");
    expect(screen.getByRole<HTMLInputElement>("spinbutton", { name: "Center X" }).max).toBe("240");
    fireEvent.click(screen.getByRole("button", { name: "Create first Layer" }));
    expect(screen.getByTestId("canvas-frame").style.aspectRatio).toBe("240 / 120");
  });

  it("connects toolbar Undo and Redo to project history", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Undo" }).at(-1)!);

    expect(screen.getByRole("heading", { name: "Your canvas is ready" })).toBeTruthy();
    expect(screen.getAllByRole<HTMLButtonElement>("button", { name: "Redo" }).at(-1)?.disabled).toBe(false);

    fireEvent.click(screen.getAllByRole("button", { name: "Redo" }).at(-1)!);
    expect(screen.getByRole("heading", { name: "Your Range is ready" })).toBeTruthy();
  });

  it("returns to Layers when Undo removes the object currently being edited", () => {
    const { store } = renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Undo" }).at(-1)!);

    expect(store.getState().editor.selectedObject).toBeNull();
    expect(store.getState().editor.sidebarMode).toBe("layers");
  });
});
