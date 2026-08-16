"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type ActionButtonVariant = "primary" | "secondary" | "quiet";
type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  variant?: ActionButtonVariant;
  trailing?: ReactNode;
};

const variantClasses: Record<ActionButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-ink hover:bg-surface-subtle",
  quiet: "text-muted hover:bg-surface-subtle hover:text-ink",
};

export function ActionButton({
  icon: Icon,
  label,
  variant = "secondary",
  trailing,
  className = "",
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-2.5",
        "text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:pointer-events-none disabled:opacity-45",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
      <span>{label}</span>
      {trailing}
    </button>
  );
}
