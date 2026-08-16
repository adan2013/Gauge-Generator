"use client";

import { useId } from "react";
import { FieldRow } from "@/components/molecules/field-row/field-row";

type SelectPropertyOption = { label: string; value: string };
type SelectPropertyRowProps = {
  label: string;
  onChange: (value: string) => void;
  options: readonly SelectPropertyOption[];
  value: string;
};

export function SelectPropertyRow({ label, onChange, options, value }: SelectPropertyRowProps) {
  const inputId = useId();
  return (
    <FieldRow htmlFor={inputId} label={label}>
      <select
        aria-label={label}
        className="h-9 w-full rounded-md border border-border bg-app px-2 text-right text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldRow>
  );
}
