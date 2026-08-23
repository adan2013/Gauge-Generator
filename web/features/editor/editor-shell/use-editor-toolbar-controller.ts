"use client";

import {
  BookOpen,
  Download,
  FileDown,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  History,
  Redo2,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useStatusMessage } from "@/components/providers/status-message-provider/status-message-provider";
import type { EditorToolbarAction } from "@/features/editor/editor-toolbar/editor-toolbar";
import { useProjectWorkflowController } from "@/features/editor/editor-shell/use-project-workflow-controller";
import type { ProjectDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { redoProject, undoProject } from "@/store/history-actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type UseEditorToolbarControllerOptions = {
  dismissRangeDependencyWarning: () => void;
  selectedRange: RangeDto | undefined;
  showRangeDependencyWarning: (rangeId: string, project?: ProjectDto) => void;
};

export function useEditorToolbarController({
  dismissRangeDependencyWarning,
  selectedRange,
  showRangeDependencyWarning,
}: UseEditorToolbarControllerOptions) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { past, future } = useAppSelector((state) => state.history);
  const t = useTranslations("Editor");
  const { showMessage } = useStatusMessage();
  const projectWorkflow = useProjectWorkflowController();
  const actions: EditorToolbarAction[] = [
    { id: "newProject", label: t("toolbar.newProject"), icon: FilePlus2 },
    { id: "open", label: t("toolbar.open"), icon: FolderOpen },
    { id: "download", label: t("toolbar.download"), icon: Download },
    { id: "export", label: t("toolbar.export"), icon: FileDown },
    { id: "undo", label: t("toolbar.undo"), icon: Undo2, disabled: past.length === 0 },
    { id: "redo", label: t("toolbar.redo"), icon: Redo2, disabled: future.length === 0 },
    { id: "restore", label: t("toolbar.restore"), icon: History },
    { id: "examples", label: t("toolbar.examples"), icon: BookOpen },
    { id: "helpCenter", label: t("toolbar.helpCenter"), icon: HelpCircle },
  ];

  function handleAction(action: EditorToolbarAction) {
    if (action.id === "newProject") {
      void projectWorkflow.newProject();
      return;
    }
    if (action.id === "open") {
      void projectWorkflow.openProject();
      return;
    }
    if (action.id === "download") {
      projectWorkflow.downloadProject();
      return;
    }
    if (action.id === "restore") {
      projectWorkflow.openRestore();
      return;
    }
    if (action.id === "examples") {
      projectWorkflow.openExamples();
      return;
    }
    if (action.id === "undo") {
      const targetProject = past.at(-1);
      dispatch(undoProject());
      if (selectedRange && targetProject?.ranges.some((range) => range.id === selectedRange.id))
        showRangeDependencyWarning(selectedRange.id, targetProject);
      else dismissRangeDependencyWarning();
      showMessage({ content: t("status.undo"), duration: "short" });
      return;
    }
    if (action.id === "redo") {
      const targetProject = future.at(-1);
      dispatch(redoProject());
      if (selectedRange && targetProject?.ranges.some((range) => range.id === selectedRange.id))
        showRangeDependencyWarning(selectedRange.id, targetProject);
      else dismissRangeDependencyWarning();
      showMessage({ content: t("status.redo"), duration: "short" });
    }
  }

  return {
    actions,
    handleAction,
    openHelp: () => router.push("/app/help"),
    projectWorkflow,
  };
}
