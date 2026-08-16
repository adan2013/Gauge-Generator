import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { EditorShell } from "./editor-shell";

describe("EditorShell", () => {
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
