import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function CompactChoice({
  checked,
  icon,
  label,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  icon?: ReactNode;
  label: string;
  name: string;
  onChange: () => void;
  value: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 transition-colors",
        checked
          ? "border-accent bg-accent-subtle/50 text-ink"
          : "border-border bg-surface text-muted hover:border-muted hover:text-ink",
      )}
    >
      <input
        checked={checked}
        className="accent-accent"
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
