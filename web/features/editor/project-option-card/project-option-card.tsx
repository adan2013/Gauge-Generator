"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ProjectOptionCard({
  accessibleLabel,
  children,
  className,
  onClick,
}: {
  accessibleLabel: string;
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={accessibleLabel}
      className={cn(
        "group w-full overflow-hidden rounded-xl border border-border bg-surface text-left",
        "transition-[border-color,transform] hover:-translate-y-0.5 hover:border-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
