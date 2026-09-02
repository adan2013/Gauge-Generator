"use client";

import { useId } from "react";
import { FieldRow } from "@/components/molecules/field-row/field-row";

type BooleanPropertyRowProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function BooleanPropertyRow({ checked, label, onChange }: BooleanPropertyRowProps) {
  const inputId = useId();
  return (
    <FieldRow htmlFor={inputId} label={label}>
      <span className="flex h-9 items-center justify-end">
        <input
          aria-label={label}
          checked={checked}
          className="size-4 accent-accent"
          id={inputId}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
      </span>
    </FieldRow>
  );
}
