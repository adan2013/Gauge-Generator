"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { EditorToolbar } from "@/features/editor/editor-toolbar/editor-toolbar";
import { LanguageSwitcher } from "@/features/editor/language-switcher/language-switcher";
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
          aria-label={t("brand")}
          className={cn(
            "flex shrink-0 items-center rounded-md px-1.5 py-1",
            "hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          )}
          href="/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt=""
            className="size-7 lg:hidden"
            height={512}
            priority
            src="/brand/gauge-generator-mark.svg"
            width={512}
          />
          <Image
            alt=""
            className="hidden h-11 w-auto lg:block"
            height={300}
            priority
            src="/brand/gauge-generator-logo-horizontal.svg"
            width={1180}
          />
        </Link>
        <LanguageSwitcher />
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
