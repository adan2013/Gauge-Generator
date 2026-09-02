import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { createProjectFingerprint } from "@/features/project/project-file/project-fingerprint";
import { editorActions } from "@/store/editor-slice";
import { historyActions } from "@/store/history-slice";
import { projectFileActions } from "@/store/project-file-slice";
import { projectActions } from "@/store/project-slice";
import type { AppDispatch } from "@/store/store";

export function replaceProjectSession(project: ProjectDto, savedOnComputer: boolean) {
  return (dispatch: AppDispatch) => {
    dispatch(projectActions.replaceProject(project));
    dispatch(historyActions.clearHistory());
    dispatch(editorActions.setSelectedObject(null));
    dispatch(editorActions.setSidebarMode("layers"));
    dispatch(editorActions.setHoveredLayerId(null));
    if (savedOnComputer)
      dispatch(projectFileActions.markProjectSaved(createProjectFingerprint(project)));
  };
}
