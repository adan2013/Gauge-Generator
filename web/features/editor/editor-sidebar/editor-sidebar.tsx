import type { ReactNode } from "react";
import type { SidebarMode } from "@/store/editor-slice";

type EditorSidebarProps = {
  mode: SidebarMode;
  projectSettings: ReactNode;
  layers: ReactNode;
  properties: ReactNode;
  ariaLabel: string;
};

export function EditorSidebar({
  ariaLabel,
  layers,
  mode,
  projectSettings,
  properties,
}: EditorSidebarProps) {
  const transform = {
    layers: "translateX(-33.333333%)",
    properties: "translateX(-66.666667%)",
    "project-settings": "translateX(0)",
  }[mode];
  return (
    <aside
      aria-label={ariaLabel}
      className="min-h-0 w-[min(100%,23rem)] shrink-0 border-r border-border bg-surface"
    >
      <div className="h-full overflow-hidden">
        <div
          className="flex h-full w-[300%] transition-transform duration-300 ease-out"
          style={{ transform }}
        >
          {projectSettings}
          {layers}
          {properties}
        </div>
      </div>
    </aside>
  );
}
