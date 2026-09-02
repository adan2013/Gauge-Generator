"use client";

import { useId } from "react";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import { cn } from "@/lib/cn";

type ColorPropertyRowProps = {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  onInteractionEnd?: () => void;
  onInteractionStart?: () => void;
  value: string;
};

export function ColorPropertyRow({
  disabled = false,
  label,
  onChange,
  onInteractionEnd,
  onInteractionStart,
  value,
}: ColorPropertyRowProps) {
  const inputId = useId();
  return (
    <FieldRow htmlFor={inputId} label={label}>
      <span className="flex items-center justify-end gap-2">
        <input
          aria-label={label}
          className="size-9 cursor-pointer rounded border border-border bg-app p-1 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disabled}
          id={inputId}
          onBlur={onInteractionEnd}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          onFocus={onInteractionStart}
          type="color"
          value={value}
        />
        <output className={cn("font-mono text-xs text-muted", disabled && "opacity-40")}>
          {value}
        </output>
      </span>
    </FieldRow>
  );
}
