import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createProjectFingerprint } from "@/features/project/project-file/project-fingerprint";

export type ProjectFileState = {
  savedProjectFingerprint: string;
};

const initialState: ProjectFileState = { savedProjectFingerprint: "" };

export const projectFileSlice = createSlice({
  name: "projectFile",
  initialState,
  reducers: {
    markProjectSaved: (state, action: PayloadAction<string>) => {
      state.savedProjectFingerprint = action.payload;
    },
  },
});

export const projectFileActions = projectFileSlice.actions;

export const selectIsProjectDirty = createSelector(
  [
    (state: { project: { current: Parameters<typeof createProjectFingerprint>[0] } }) =>
      state.project.current,
    (state: { projectFile: ProjectFileState }) => state.projectFile.savedProjectFingerprint,
  ],
  (project, savedProjectFingerprint) =>
    createProjectFingerprint(project) !== savedProjectFingerprint,
);
