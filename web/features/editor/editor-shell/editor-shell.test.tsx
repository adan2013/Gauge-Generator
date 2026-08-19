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
  it("connects toolbar undo and redo to project history", () => {
    const { store } = renderEditor(<EditorShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Undo" }).at(-1)!);
    expect(store.getState().editor.sidebarMode).toBe("layers");
    fireEvent.click(screen.getAllByRole("button", { name: "Redo" }).at(-1)!);
    expect(store.getState().project.current.ranges).toHaveLength(1);
  });
});
