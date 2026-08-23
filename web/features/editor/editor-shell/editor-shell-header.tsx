"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { EditorToolbar } from "@/features/editor/editor-toolbar/editor-toolbar";
import { useEditorShell } from "@/features/editor/editor-shell/editor-shell-context";
import { cn } from "@/lib/cn";

export function EditorShellHeader() {
  const t = useTranslations("Editor");
  const { actions, handleAction, openHelp } = useEditorShell().meta.toolbar;

  return (
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
  );
}
