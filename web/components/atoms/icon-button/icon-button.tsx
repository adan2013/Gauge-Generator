"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
};

export function IconButton({ icon: Icon, label, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button aria-label={label} className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus", className)} title={label} type={type} {...props}>
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
    </button>
  );
}
