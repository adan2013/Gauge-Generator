"use client";

import { useLayoutEffect } from "react";

type UseProjectDocumentTitleOptions = {
  applicationName: string;
  isDirty: boolean;
  projectTitle: string;
};

export function useProjectDocumentTitle({
  applicationName,
  isDirty,
  projectTitle,
}: UseProjectDocumentTitleOptions) {
  useLayoutEffect(() => {
    document.title = `${isDirty ? "* " : ""}${projectTitle} — ${applicationName}`;
  }, [applicationName, isDirty, projectTitle]);
}
