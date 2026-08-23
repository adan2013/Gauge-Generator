"use client";

import { EditorShellCanvas } from "@/features/editor/editor-shell/editor-shell-canvas";
import { EditorShellProvider } from "@/features/editor/editor-shell/editor-shell-context";
import { EditorShellHeader } from "@/features/editor/editor-shell/editor-shell-header";
import { EditorShellSidebar } from "@/features/editor/editor-shell/editor-shell-sidebar";

export function EditorShell() {
  return (
    <EditorShellProvider>
      <main className="flex h-dvh flex-col overflow-hidden bg-app text-ink">
        <EditorShellHeader />
        <section className="flex min-h-0 flex-1 overflow-hidden">
          <EditorShellSidebar />
          <EditorShellCanvas />
        </section>
      </main>
    </EditorShellProvider>
  );
}
