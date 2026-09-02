"use client";

import { useEffect, useRef } from "react";
import { HardDrive, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStatusMessage } from "@/components/providers/status-message-provider/status-message-provider";
import { createProjectFingerprint } from "@/features/project/project-file/project-fingerprint";
import {
  AUTOSAVE_INTERVAL_MS,
  saveAutosaveSnapshot,
} from "@/features/project/persistence/project-autosave";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { editorActions } from "@/store/editor-slice";
import { useAppDispatch } from "@/store/hooks";

export function useProjectAutosave(project: ProjectDto) {
  const dispatch = useAppDispatch();
  const t = useTranslations("Editor");
  const { showMessage } = useStatusMessage();
  const projectRef = useRef(project);
  const lastAutosavedFingerprintRef = useRef(createProjectFingerprint(project));

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const currentProject = projectRef.current;
      const fingerprint = createProjectFingerprint(currentProject);
      if (fingerprint === lastAutosavedFingerprintRef.current) return;
      try {
        saveAutosaveSnapshot(window.localStorage, currentProject);
        lastAutosavedFingerprintRef.current = fingerprint;
        dispatch(editorActions.setAutosaveStatus("saved"));
        showMessage({
          color: "neutral",
          content: t("status.autosavedLocally"),
          duration: "long",
          icon: HardDrive,
        });
      } catch {
        dispatch(editorActions.setAutosaveStatus("error"));
        showMessage({
          color: "accent",
          content: t("status.autosaveFailed"),
          duration: "long",
          icon: TriangleAlert,
        });
      }
    }, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [dispatch, showMessage, t]);
}
