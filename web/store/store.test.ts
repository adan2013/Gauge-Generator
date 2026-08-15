import { describe, expect, it } from "vitest";
import { createProject, createRange, createTickScaleLayer } from "@/features/project/factories/project-factories";
import { beginProjectHistoryTransaction, completeProjectHistoryTransaction, undoProject, redoProject } from "@/store/history-actions";
import { editorActions } from "@/store/editor-slice";
import { projectActions } from "@/store/project-slice";
import { createEditorState } from "@/test/create-editor-state";
import { createTestStore } from "@/test/create-test-store";

describe("project store and history", () => {
  it("does not allow a Range with dependent layers to be removed", () => {
    const range = createRange();
    const store = createTestStore({ project: { current: createProject({ ranges: [range], layers: [createTickScaleLayer(range.id)] }) } });
    store.dispatch(projectActions.removeRange(range.id));

    expect(store.getState().project.current.ranges).toHaveLength(1);
  });

  it("records project mutations but ignores editor-only state", () => {
    const store = createTestStore();
    store.dispatch(editorActions.setSidebarMode("project-settings"));
    expect(store.getState().history.past).toHaveLength(0);

    store.dispatch(projectActions.addRange(createRange()));
    expect(store.getState().history.past).toHaveLength(1);
  });

  it("rejects an invalid project mutation before it reaches the current project", () => {
    const store = createTestStore();
    store.dispatch(projectActions.setCanvas({ widthMm: -1, heightMm: 120, background: "#FFFFFF" }));

    expect(store.getState().project.current.canvas.widthMm).toBe(120);
    expect(store.getState().history.past).toHaveLength(0);
  });

  it("undoes and redoes a project mutation", () => {
    const store = createTestStore();
    const range = createRange();
    store.dispatch(projectActions.addRange(range));

    store.dispatch(undoProject());
    expect(store.getState().project.current.ranges).toHaveLength(0);
    store.dispatch(redoProject());
    expect(store.getState().project.current.ranges[0].id).toBe(range.id);
  });

  it("retains no more than fifty undo states", () => {
    const store = createTestStore();
    for (let widthMm = 20; widthMm <= 70; widthMm += 1) {
      store.dispatch(projectActions.setCanvas({ widthMm, heightMm: 120, background: "#FFFFFF" }));
    }

    expect(store.getState().history.past).toHaveLength(50);
  });

  it("records one undo snapshot for a continuous project-control interaction", () => {
    const store = createTestStore();
    store.dispatch(beginProjectHistoryTransaction());
    store.dispatch(projectActions.setCanvas({ widthMm: 140, heightMm: 120, background: "#FFFFFF" }));
    store.dispatch(projectActions.setCanvas({ widthMm: 160, heightMm: 120, background: "#FFFFFF" }));
    store.dispatch(completeProjectHistoryTransaction());

    expect(store.getState().history.past).toHaveLength(1);
    store.dispatch(undoProject());
    expect(store.getState().project.current.canvas.widthMm).toBe(120);
  });

  it("clears selection and returns to Layers when a project change removes it", () => {
    const range = createRange();
    const store = createTestStore({
      project: { current: createProject({ ranges: [range] }) },
      editor: createEditorState({ selectedObject: { collection: "ranges", id: range.id }, sidebarMode: "properties" }),
    });

    store.dispatch(projectActions.removeRange(range.id));

    expect(store.getState().editor.selectedObject).toBeNull();
    expect(store.getState().editor.sidebarMode).toBe("layers");
  });
});
