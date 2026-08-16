import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";

export const HISTORY_LIMIT = 50;

type HistoryState = {
  past: ProjectDto[];
  future: ProjectDto[];
  transactionSnapshot: ProjectDto | null;
};

const initialState: HistoryState = { past: [], future: [], transactionSnapshot: null };

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    recordProjectMutation: (state, action: PayloadAction<ProjectDto>) => {
      state.past.push(action.payload);
      if (state.past.length > HISTORY_LIMIT) state.past.shift();
      state.future = [];
    },
    beginProjectTransaction: (state, action: PayloadAction<ProjectDto>) => {
      if (!state.transactionSnapshot) state.transactionSnapshot = action.payload;
    },
    completeProjectTransaction: (state, action: PayloadAction<ProjectDto>) => {
      const snapshot = state.transactionSnapshot;
      state.transactionSnapshot = null;
      if (!snapshot || snapshot === action.payload) return;
      state.past.push(snapshot);
      if (state.past.length > HISTORY_LIMIT) state.past.shift();
      state.future = [];
    },
    applyUndo: (state, action: PayloadAction<ProjectDto>) => {
      state.transactionSnapshot = null;
      state.past.pop();
      state.future.push(action.payload);
      if (state.future.length > HISTORY_LIMIT) state.future.shift();
    },
    applyRedo: (state, action: PayloadAction<ProjectDto>) => {
      state.transactionSnapshot = null;
      state.future.pop();
      state.past.push(action.payload);
      if (state.past.length > HISTORY_LIMIT) state.past.shift();
    },
    clearHistory: () => initialState,
  },
});

export const historyActions = historySlice.actions;
