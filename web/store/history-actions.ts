import type { AppDispatch, RootState } from "@/store/store";
import { historyActions } from "@/store/history-slice";
import { projectActions } from "@/store/project-slice";

export function undoProject() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const previous = state.history.past.at(-1);
    if (!previous) return;
    dispatch(projectActions.replaceProject(previous));
    dispatch(historyActions.applyUndo(state.project.current));
  };
}

export function redoProject() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const next = state.history.future.at(-1);
    if (!next) return;
    dispatch(projectActions.replaceProject(next));
    dispatch(historyActions.applyRedo(state.project.current));
  };
}

export function beginProjectHistoryTransaction() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(historyActions.beginProjectTransaction(getState().project.current));
  };
}

export function completeProjectHistoryTransaction() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(historyActions.completeProjectTransaction(getState().project.current));
  };
}
