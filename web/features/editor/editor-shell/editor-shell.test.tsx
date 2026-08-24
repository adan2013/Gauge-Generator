import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createProject,
  createLabelLayer,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { projectActions } from "@/store/project-slice";
import { makeStore } from "@/store/store";
import { renderEditor } from "@/test/render-editor";
import { EditorShell } from "./editor-shell";

describe("EditorShell", () => {
  it("opens the public help center in a new tab", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderEditor(<EditorShell />);

    const help = screen.queryByRole("button", { name: "Help center" });
    if (help) fireEvent.click(help);
    else {
      fireEvent.click(screen.getByText("More actions"));
      fireEvent.click(screen.getByRole("button", { name: "Help center" }));
    }

    expect(open).toHaveBeenCalledWith("/docs/en", "_blank", "noopener,noreferrer");
    open.mockRestore();
  });

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

  it("keeps a linked point Label in place when the Range radius changes", () => {
    const range = createRange({ radius: 40 });
    const layer = createLabelLayer(range.id, {
      layout: { mode: "point", offsetXMm: 30, offsetYMm: 0, rotationDegrees: 0 },
    });
    const store = makeStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });
    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: `Edit ${range.name}` }));
    const radius = screen.getByRole("spinbutton", { name: "Radius" });

    fireEvent.focus(radius);
    fireEvent.change(radius, { target: { value: "15" } });
    fireEvent.blur(radius);

    expect(store.getState().project.current.ranges[0].radius).toBe(16);
    expect(store.getState().project.current.layers[0]).toMatchObject({
      layout: { offsetXMm: 30 },
    });
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
  it("opens project settings and updates persisted project title", async () => {
    const { store } = renderEditor(<EditorShell />);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    expect(screen.getByRole("heading", { name: "Project settings" })).toBeTruthy();
    const title = screen.getByRole("textbox", { name: "Title" });
    fireEvent.change(title, { target: { value: "Workshop gauge" } });
    fireEvent.blur(title);

    expect(store.getState().project.current.meta.title).toBe("Workshop gauge");
    await waitFor(() => expect(document.title).toBe("* Workshop gauge — Gauge Generator Web"));
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
  it("shows a temporary status when a canvas click opens layer editing", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { name: "Major ticks" });
    const store = makeStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });
    const { container } = renderEditor(<EditorShell />, store);
    const renderedTick = container.querySelector(`[data-layer-id="${layer.id}"] line`);
    if (!renderedTick) throw new Error("Expected rendered layer geometry");

    fireEvent.click(renderedTick);

    const status = screen
      .getByText("You are editing layer “Major ticks”.")
      .closest('[role="status"]');
    if (!status) throw new Error("Layer editing status was not rendered");
    expect(status.querySelector("svg")).not.toBeNull();
    expect(store.getState().editor.selectedObject).toEqual({ collection: "layers", id: layer.id });

    fireEvent.click(renderedTick);

    expect(screen.getAllByText("You are editing layer “Major ticks”.")).toHaveLength(1);
  });
  it("leaves layer editing when Escape is pressed", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id);
    const store = makeStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });
    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: `Edit ${layer.name}` }));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(store.getState().editor.sidebarMode).toBe("layers");
    expect(screen.getByRole("heading", { name: "Layers" })).toBeTruthy();
  });
  it("leaves Range editing and dismisses its dependency warning when Escape is pressed", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id);
    const store = makeStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });
    renderEditor(<EditorShell />, store);
    fireEvent.click(screen.getByRole("button", { name: `Edit ${range.name}` }));
    expect(screen.getByText(/Large changes to this Range may automatically adjust/)).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(store.getState().editor.sidebarMode).toBe("layers");
    expect(screen.getByRole("heading", { name: "Layers" })).toBeTruthy();
    expect(screen.queryByText(/Large changes to this Range may automatically adjust/)).toBeNull();
  });
  it("leaves project settings when Escape is pressed", () => {
    const { store } = renderEditor(<EditorShell />);
    fireEvent.click(screen.getByRole("button", { name: "Project" }));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(store.getState().editor.sidebarMode).toBe("layers");
    expect(screen.getByRole("heading", { name: "Layers" })).toBeTruthy();
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
