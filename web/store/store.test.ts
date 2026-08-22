import { describe, expect, it } from "vitest";
import {
  createProject,
  createLabelLayer,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import {
  beginProjectHistoryTransaction,
  completeProjectHistoryTransaction,
  undoProject,
  redoProject,
} from "@/store/history-actions";
import { editorActions } from "@/store/editor-slice";
import { projectActions } from "@/store/project-slice";
import { createEditorState } from "@/test/create-editor-state";
import { createTestStore } from "@/test/create-test-store";

describe("project store and history", () => {
  it("does not allow a Range with dependent layers to be removed", () => {
    const range = createRange();
    const store = createTestStore({
      project: {
        current: createProject({ ranges: [range], layers: [createTickScaleLayer(range.id)] }),
      },
    });
    store.dispatch(projectActions.removeRange(range.id));

    expect(store.getState().project.current.ranges).toHaveLength(1);
  });

  it("constrains dependent Tick Scale geometry when its Range radius is reduced", () => {
    const range = createRange({ radius: 48 });
    const layer = createTickScaleLayer(range.id, {
      radiusOffsetMm: 40,
      tickLengthMm: 50,
      tickWidthMm: 8,
    });
    const store = createTestStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });

    store.dispatch(projectActions.updateRange({ ...range, radius: 20 }));

    expect(store.getState().project.current.layers[0]).toMatchObject({
      radiusOffsetMm: 20,
      tickLengthMm: 40,
      tickWidthMm: 8,
    });
  });

  it("constrains dependent Tick Scale values when the source Range values change", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { valueStart: 20, valueEnd: 100, valueStep: 10 });
    const store = createTestStore({
      project: { current: createProject({ ranges: [range], layers: [layer] }) },
    });

    store.dispatch(
      projectActions.updateRange({
        ...range,
        scaleDefinition: { mode: "linear", start: 30, end: 70 },
      }),
    );

    expect(store.getState().project.current.layers[0]).toMatchObject({
      valueStart: 30,
      valueEnd: 70,
      valueStep: 10,
    });
  });

  it("constrains only the Range-mapped Label layout when its Range changes", () => {
    const range = createRange({ radius: 40 });
    const pointLabel = createLabelLayer(range.id, {
      layout: { mode: "point", offsetXMm: 30, offsetYMm: -30, rotationDegrees: 0 },
    });
    const textArcLabel = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: 30,
        valueStart: 20,
        valueEnd: 80,
        alignment: "center",
        direction: "forward",
      },
    });
    const store = createTestStore({
      project: {
        current: createProject({ ranges: [range], layers: [pointLabel, textArcLabel] }),
      },
    });

    store.dispatch(
      projectActions.updateRange({
        ...range,
        radius: 15,
        scaleDefinition: { mode: "linear", start: 40, end: 60 },
      }),
    );

    expect(store.getState().project.current.layers[0]).toMatchObject({
      layout: { offsetXMm: 30, offsetYMm: -30 },
    });
    expect(store.getState().project.current.layers[1]).toMatchObject({
      layout: { radiusOffsetMm: 15, valueStart: 40, valueEnd: 60 },
    });
  });

  it("reorders only visual layers while preserving the topmost index convention", () => {
    const range = createRange();
    const first = { ...createTickScaleLayer(range.id), name: "Top" };
    const second = { ...createTickScaleLayer(range.id), name: "Bottom" };
    const store = createTestStore({
      project: { current: createProject({ ranges: [range], layers: [first, second] }) },
    });

    store.dispatch(projectActions.reorderLayer({ layerId: second.id, targetIndex: 0 }));

    expect(store.getState().project.current.layers.map((layer) => layer.name)).toEqual([
      "Bottom",
      "Top",
    ]);
  });

  it("adds a new visual layer at the top of the stack", () => {
    const range = createRange();
    const existing = { ...createTickScaleLayer(range.id), name: "Existing" };
    const added = { ...createTickScaleLayer(range.id), name: "Added" };
    const store = createTestStore({
      project: { current: createProject({ ranges: [range], layers: [existing] }) },
    });

    store.dispatch(projectActions.addLayer(added));

    expect(store.getState().project.current.layers.map((layer) => layer.name)).toEqual([
      "Added",
      "Existing",
    ]);
  });

  it("duplicates a layer immediately above its source with a fresh identity", () => {
    const range = createRange();
    const first = { ...createTickScaleLayer(range.id), name: "Top" };
    const second = { ...createTickScaleLayer(range.id), name: "Markers" };
    const store = createTestStore({
      project: { current: createProject({ ranges: [range], layers: [first, second] }) },
    });

    store.dispatch(projectActions.duplicateLayer(second.id));

    const layers = store.getState().project.current.layers;
    expect(layers.map((layer) => layer.name)).toEqual(["Top", "Markers_Copy", "Markers"]);
    expect(layers[1]).toMatchObject({ ...second, id: expect.any(String), name: "Markers_Copy" });
    expect(layers[1].id).not.toBe(second.id);
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
    store.dispatch(
      projectActions.setCanvas({
        widthMm: -1,
        heightMm: 120,
        background: "#FFFFFF",
        transparentBackground: true,
      }),
    );

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
      store.dispatch(
        projectActions.setCanvas({
          widthMm,
          heightMm: 120,
          background: "#FFFFFF",
          transparentBackground: true,
        }),
      );
    }

    expect(store.getState().history.past).toHaveLength(50);
  });

  it("records one undo snapshot for a continuous project-control interaction", () => {
    const store = createTestStore();
    store.dispatch(beginProjectHistoryTransaction());
    store.dispatch(
      projectActions.setCanvas({
        widthMm: 140,
        heightMm: 120,
        background: "#FFFFFF",
        transparentBackground: true,
      }),
    );
    store.dispatch(
      projectActions.setCanvas({
        widthMm: 160,
        heightMm: 120,
        background: "#FFFFFF",
        transparentBackground: true,
      }),
    );
    store.dispatch(completeProjectHistoryTransaction());

    expect(store.getState().history.past).toHaveLength(1);
    store.dispatch(undoProject());
    expect(store.getState().project.current.canvas.widthMm).toBe(120);
  });

  it("clears selection and returns to Layers when a project change removes it", () => {
    const range = createRange();
    const store = createTestStore({
      project: { current: createProject({ ranges: [range] }) },
      editor: createEditorState({
        selectedObject: { collection: "ranges", id: range.id },
        sidebarMode: "properties",
      }),
    });

    store.dispatch(projectActions.removeRange(range.id));

    expect(store.getState().editor.selectedObject).toBeNull();
    expect(store.getState().editor.sidebarMode).toBe("layers");
  });
});
