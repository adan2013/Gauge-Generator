import { combineReducers, configureStore, type Middleware } from "@reduxjs/toolkit";
import { editorActions, editorSlice } from "@/store/editor-slice";
import { historyActions, historySlice } from "@/store/history-slice";
import { projectActions, projectSlice } from "@/store/project-slice";
import { projectFileSlice, type ProjectFileState } from "@/store/project-file-slice";
import { createProjectFingerprint } from "@/features/project/project-file/project-fingerprint";

const rootReducer = combineReducers({
  project: projectSlice.reducer,
  projectFile: projectFileSlice.reducer,
  editor: editorSlice.reducer,
  history: historySlice.reducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const projectHistoryMiddleware: Middleware<unknown, RootState> =
  (storeApi) => (next) => (action) => {
    const previousProject = storeApi.getState().project.current;
    const result = next(action);
    const currentProject = storeApi.getState().project.current;
    const isProjectMutation =
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      action.type.startsWith("project/") &&
      action.type !== projectActions.replaceProject.type;
    if (
      isProjectMutation &&
      previousProject !== currentProject &&
      !storeApi.getState().history.transactionSnapshot
    ) {
      storeApi.dispatch(historyActions.recordProjectMutation(previousProject));
    }
    return result;
  };

const projectSelectionMiddleware: Middleware<unknown, RootState> =
  (storeApi) => (next) => (action) => {
    const result = next(action);
    const isProjectAction =
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      action.type.startsWith("project/");
    if (!isProjectAction) return result;

    const { editor, project } = storeApi.getState();
    const selection = editor.selectedObject;
    if (!selection) return result;
    const collection =
      selection.collection === "ranges" ? project.current.ranges : project.current.layers;
    if (collection.some((item) => item.id === selection.id)) return result;

    storeApi.dispatch(editorActions.setSelectedObject(null));
    storeApi.dispatch(editorActions.setSidebarMode("layers"));
    return result;
  };

export function makeStore(preloadedState?: Partial<RootState>) {
  const baseState = rootReducer(undefined, { type: "store/initialize" });
  const project = preloadedState?.project ?? baseState.project;
  const projectFile: ProjectFileState = preloadedState?.projectFile ?? {
    savedProjectFingerprint: createProjectFingerprint(project.current),
  };
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(projectHistoryMiddleware, projectSelectionMiddleware),
    preloadedState: { ...baseState, ...preloadedState, project, projectFile },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
