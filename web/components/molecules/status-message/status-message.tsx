import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatusMessageColor = "accent" | "danger" | "neutral";

type StatusMessageProps = {
  children?: ReactNode;
  color?: StatusMessageColor;
  icon?: LucideIcon;
};

export function StatusMessage({ children, color = "neutral", icon: Icon }: StatusMessageProps) {
  if (!children) return null;
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-surface px-3 py-2 text-sm",
        "shadow-[0_12px_30px_rgba(32,36,43,0.12)]",
        color === "neutral" && "border-border text-muted",
        color === "accent" && "border-accent/30 text-ink",
        color === "danger" && "border-danger/30 text-danger",
      )}
      role="status"
    >
      {Icon ? (
        <Icon
          aria-hidden="true"
          className={cn(
            "mt-0.5 shrink-0",
            color === "neutral" && "text-muted",
            color === "accent" && "text-accent",
            color === "danger" && "text-danger",
          )}
          size={17}
        />
      ) : null}
      <span>{children}</span>
    </div>
  );
}
