import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { projectActions } from "@/store/project-slice";
import { makeStore } from "@/store/store";
import { renderEditor } from "@/test/render-editor";
import { EditorShell } from "./editor-shell";

describe("EditorShell", () => {
  it("warns while editing a Range with linked layers", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id);
    const store = makeStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });

    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: `Edit ${range.name}` }));

    const warning = screen
      .getByText(
        "Large changes to this Range may automatically adjust the linked layer. Element sizes and visible values may be limited to fit the new Range.",
      )
      .closest('[role="status"]');
    if (!warning) throw new Error("Range dependency warning was not rendered");
    expect(warning.querySelector("svg")).not.toBeNull();
  });

  it("creates a Range and navigates to its editor", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    expect(screen.getByRole("heading", { name: "Range setup" })).toBeTruthy();
  });
  it("creates a valid Range and opens its parameters on a 30 by 30 mm canvas", () => {
    const store = makeStore({
      project: {
        current: createProject({
          canvas: {
            widthMm: 30,
            heightMm: 30,
            background: "#FFFFFF",
            transparentBackground: true,
          },
        }),
      },
    });
    renderEditor(<EditorShell />, store);

    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);

    expect(screen.getByRole("heading", { name: "Range setup" })).toBeTruthy();
    expect(store.getState().project.current.ranges[0]).toMatchObject({
      centerX: 15,
      centerY: 15,
      radius: 12,
    });
  });
  it("navigates from the layer picker to a new layer editor", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Create first Layer" }));
    fireEvent.click(screen.getByRole("button", { name: /Tick scale/ }));
    expect(screen.getByRole("heading", { name: "Layer setup" })).toBeTruthy();
  });
  it("uses the most recently added Range as the default source for a new layer", () => {
    const store = makeStore();
    const firstRange = createRange({ name: "First Range" });
    const latestRange = createRange({ name: "Latest Range" });
    store.dispatch(projectActions.addRange(firstRange));
    store.dispatch(projectActions.addRange(latestRange));
    renderEditor(<EditorShell />, store);

    fireEvent.click(screen.getByRole("button", { name: "Create first Layer" }));
    fireEvent.click(screen.getByRole("button", { name: /Tick scale/ }));

    expect(store.getState().project.current.layers[0]?.rangeId).toBe(latestRange.id);
  });
  it("opens project settings from the layers screen", () => {
    renderEditor(<EditorShell />);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    expect(screen.getByRole("heading", { name: "Project settings" })).toBeTruthy();
  });
  it("does not commit an invalid canvas candidate", () => {
    const range = createRange({ centerX: 60, radius: 40 });
    const store = makeStore({
      project: { current: createProject({ ranges: [range] }) },
    });
    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    const width = screen.getByRole("spinbutton", { name: "Width" });

    fireEvent.focus(width);
    fireEvent.change(width, { target: { value: "50" } });
    fireEvent.blur(width);

    expect(store.getState().project.current.canvas.widthMm).toBe(120);
  });
  it("explains a rejected domain value in the Range editor", () => {
    const range = createRange({ scaleDefinition: { mode: "linear", start: 0, end: 100 } });
    const store = makeStore({
      project: { current: createProject({ ranges: [range] }) },
    });
    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: `Edit ${range.name}` }));
    const endValue = screen.getByRole("spinbutton", { name: "End value" });

    fireEvent.focus(endValue);
    fireEvent.change(endValue, { target: { value: "0" } });
    fireEvent.blur(endValue);

    expect(
      screen.getByText("The scale end value must be greater than its start value."),
    ).toBeTruthy();
    expect(store.getState().project.current.ranges[0].scaleDefinition).toEqual({
      mode: "linear",
      start: 0,
      end: 100,
    });
  });
  it("explains a rejected value in a visual-layer editor", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { name: "Major ticks" });
    const store = makeStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });
    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: `Edit ${layer.name}` }));
    const name = screen.getByRole("textbox", { name: "Name" });

    fireEvent.change(name, { target: { value: "" } });

    expect(
      screen.getByText("The name is required and must contain no more than 80 characters."),
    ).toBeTruthy();
    expect(store.getState().project.current.layers[0].name).toBe("Major ticks");
  });
  it("connects toolbar undo and redo to project history", () => {
    const { store } = renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Undo" }).at(-1)!);
    expect(store.getState().editor.sidebarMode).toBe("layers");
    fireEvent.click(screen.getAllByRole("button", { name: "Redo" }).at(-1)!);
    expect(store.getState().project.current.ranges).toHaveLength(1);
  });
});
