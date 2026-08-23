"use client";

import { useState } from "react";
import { CircleCheck, FilePlus2, FolderOpen, HardDrive, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useConfirmation } from "@/components/providers/confirmation-provider/confirmation-provider";
import { useStatusMessage } from "@/components/providers/status-message-provider/status-message-provider";
import { EXAMPLE_PROJECTS } from "@/features/examples/example-projects";
import { createProject } from "@/features/project/factories/project-factories";
import {
  chooseProjectJsonFile,
  downloadProjectJson,
} from "@/features/project/project-file/browser-project-file";
import { createProjectFingerprint } from "@/features/project/project-file/project-fingerprint";
import { parseProjectJson } from "@/features/project/project-file/project-json";
import {
  readAutosaveSnapshots,
  type AutosaveSnapshot,
} from "@/features/project/persistence/project-autosave";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { projectFileActions, selectIsProjectDirty } from "@/store/project-file-slice";
import { replaceProjectSession } from "@/store/project-session-actions";

export type OpenProjectDialog =
  { kind: "examples" } | { kind: "restore"; snapshots: AutosaveSnapshot[] } | null;

export function useProjectWorkflowController() {
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.project.current);
  const isDirty = useAppSelector(selectIsProjectDirty);
  const { confirm } = useConfirmation();
  const { showMessage } = useStatusMessage();
  const t = useTranslations("Editor");
  const [openDialog, setOpenDialog] = useState<OpenProjectDialog>(null);

  async function confirmReplacement(kind: "example" | "new" | "open" | "restore") {
    if (!isDirty) return true;
    return confirm({
      confirmIcon: kind === "new" ? FilePlus2 : FolderOpen,
      confirmLabel: t(`confirmation.unsaved.${kind}Confirm`),
      description: t("confirmation.unsaved.description"),
      title: t("confirmation.unsaved.title"),
      variant: "danger",
    });
  }

  async function replaceProject(
    nextProject: ProjectDto,
    kind: "example" | "new" | "open" | "restore",
    savedOnComputer: boolean,
  ) {
    if (!(await confirmReplacement(kind))) return false;
    dispatch(replaceProjectSession(nextProject, savedOnComputer));
    setOpenDialog(null);
    showMessage({
      color: "neutral",
      content: t(`status.projectLoaded.${kind}`),
      duration: "medium",
      icon: CircleCheck,
    });
    return true;
  }

  async function newProject() {
    const timestamp = new Date().toISOString();
    await replaceProject(
      createProject({
        meta: { title: "Untitled project", createdAt: timestamp, updatedAt: timestamp },
      }),
      "new",
      true,
    );
  }

  async function openProject() {
    const file = await chooseProjectJsonFile();
    if (!file) return;
    try {
      const result = parseProjectJson(await file.text());
      if (result.success) {
        await replaceProject(result.project, "open", true);
        return;
      }
    } catch {
      // The same non-destructive error is shown for unreadable and invalid files.
    }
    showMessage({
      color: "accent",
      content: t("status.openFailed"),
      duration: "long",
      icon: TriangleAlert,
    });
  }

  function downloadProject() {
    try {
      downloadProjectJson(project);
      dispatch(projectFileActions.markProjectSaved(createProjectFingerprint(project)));
      showMessage({
        color: "neutral",
        content: t("status.downloaded"),
        duration: "medium",
        icon: CircleCheck,
      });
    } catch {
      showMessage({
        color: "accent",
        content: t("status.downloadFailed"),
        duration: "long",
        icon: TriangleAlert,
      });
    }
  }

  function openRestore() {
    try {
      const snapshots = readAutosaveSnapshots(window.localStorage);
      if (snapshots.length === 0) {
        showMessage({
          color: "neutral",
          content: t("status.noAutosaves"),
          duration: "medium",
          icon: HardDrive,
        });
        return;
      }
      setOpenDialog({ kind: "restore", snapshots });
    } catch {
      showMessage({
        color: "accent",
        content: t("status.restoreFailed"),
        duration: "long",
        icon: TriangleAlert,
      });
    }
  }

  function openExamples() {
    setOpenDialog({ kind: "examples" });
  }

  async function openExample(id: string) {
    const example = EXAMPLE_PROJECTS.find((candidate) => candidate.id === id);
    if (example) await replaceProject(example.project, "example", false);
  }

  async function restoreSnapshot(savedAt: string) {
    if (openDialog?.kind !== "restore") return;
    const snapshot = openDialog.snapshots.find((candidate) => candidate.savedAt === savedAt);
    if (snapshot) await replaceProject(snapshot.project, "restore", false);
  }

  return {
    closeDialog: () => setOpenDialog(null),
    dialog: openDialog,
    downloadProject,
    isDirty,
    newProject,
    openExample,
    openExamples,
    openProject,
    openRestore,
    restoreSnapshot,
  };
}
