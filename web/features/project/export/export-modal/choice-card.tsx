import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChoiceCard({
  checked,
  description,
  icon,
  label,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  description: string;
  icon?: ReactNode;
  label: string;
  name: string;
  onChange: () => void;
  value: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
        checked
          ? "border-accent bg-accent-subtle/50"
          : "border-border bg-surface hover:border-muted",
      )}
    >
      <input
        checked={checked}
        className="mt-1 accent-accent"
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
      {icon ? <span className="mt-0.5 shrink-0 text-muted">{icon}</span> : null}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
    </label>
  );
}
