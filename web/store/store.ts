import { combineReducers, configureStore, type Middleware } from "@reduxjs/toolkit";
import { editorActions, editorSlice } from "@/store/editor-slice";
import { historyActions, historySlice } from "@/store/history-slice";
import { projectActions, projectSlice } from "@/store/project-slice";

const rootReducer = combineReducers({ project: projectSlice.reducer, editor: editorSlice.reducer, history: historySlice.reducer });
export type RootState = ReturnType<typeof rootReducer>;

const projectHistoryMiddleware: Middleware<unknown, RootState> = (storeApi) => (next) => (action) => {
  const previousProject = storeApi.getState().project.current;
  const result = next(action);
  const currentProject = storeApi.getState().project.current;
  const isProjectMutation = typeof action === "object" && action !== null && "type" in action && typeof action.type === "string" && action.type.startsWith("project/") && action.type !== projectActions.replaceProject.type;
  if (isProjectMutation && previousProject !== currentProject && !storeApi.getState().history.transactionSnapshot) {
    storeApi.dispatch(historyActions.recordProjectMutation(previousProject));
  }
  return result;
};

const projectSelectionMiddleware: Middleware<unknown, RootState> = (storeApi) => (next) => (action) => {
  const result = next(action);
  const isProjectAction = typeof action === "object" && action !== null && "type" in action && typeof action.type === "string" && action.type.startsWith("project/");
  if (!isProjectAction) return result;

  const { editor, project } = storeApi.getState();
  const selection = editor.selectedObject;
  if (!selection) return result;
  const collection = selection.collection === "ranges" ? project.current.ranges : project.current.layers;
  if (collection.some((item) => item.id === selection.id)) return result;

  storeApi.dispatch(editorActions.setSelectedObject(null));
  storeApi.dispatch(editorActions.setSidebarMode("layers"));
  return result;
};

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(projectHistoryMiddleware, projectSelectionMiddleware),
    preloadedState: preloadedState as RootState | undefined,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
