"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { EditorToolbar } from "@/features/editor/editor-toolbar/editor-toolbar";
import { useEditorShell } from "@/features/editor/editor-shell/editor-shell-context";
import { ExamplesModal } from "@/features/examples/examples-modal";
import { ExportModal } from "@/features/project/export/export-modal/export-modal";
import { RestoreModal } from "@/features/project/persistence/restore-modal";
import { cn } from "@/lib/cn";

export function EditorShellHeader() {
  const t = useTranslations("Editor");
  const editor = useEditorShell();
  const { actions, handleAction, openHelp, projectWorkflow } = editor.meta.toolbar;

  return (
    <>
      <header className="flex min-h-14 items-center gap-2 border-b border-border bg-surface px-2 sm:px-3">
        <Link
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 font-semibold tracking-tight text-ink",
            "hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          )}
          href="/"
        >
          <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-white">
            GG
          </span>
          <span className="hidden lg:inline">{t("brand")}</span>
        </Link>
        <EditorToolbar actions={actions} onAction={handleAction} onOpenHelp={openHelp} />
      </header>
      {projectWorkflow.dialog?.kind === "examples" ? (
        <ExamplesModal
          onCancel={projectWorkflow.closeDialog}
          onSelect={projectWorkflow.openExample}
        />
      ) : null}
      {projectWorkflow.dialog?.kind === "restore" ? (
        <RestoreModal
          onCancel={projectWorkflow.closeDialog}
          onSelect={projectWorkflow.restoreSnapshot}
          snapshots={projectWorkflow.dialog.snapshots}
        />
      ) : null}
      {projectWorkflow.dialog?.kind === "export" ? (
        <ExportModal
          onCancel={projectWorkflow.closeDialog}
          onExport={projectWorkflow.exportProject}
          project={editor.state.project}
        />
      ) : null}
    </>
  );
}
