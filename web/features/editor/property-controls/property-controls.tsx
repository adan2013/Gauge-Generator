"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import {
  CANVAS_DIMENSION_MAX_MM,
  CANVAS_DIMENSION_MIN_MM,
} from "@/features/project/project-dto/project-dto";

export function PropertyGroup({ children, title }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

type TextPropertyRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
};
export function TextPropertyRow({
  label,
  onChange,
  onInteractionEnd,
  onInteractionStart,
  value,
}: TextPropertyRowProps) {
  const inputId = useId();
  return (
    <FieldRow htmlFor={inputId} label={label}>
      <input
        aria-label={label}
        className="w-full rounded-md border border-border bg-app px-2 py-1 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
        id={inputId}
        onBlur={onInteractionEnd}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onInteractionStart}
        required
        type="text"
        value={value}
      />
    </FieldRow>
  );
}

type RangePropertyRowProps = {
  label: string;
  max: number;
  min: number;
  step: number;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
};
export function RangePropertyRow({
  label,
  max,
  min,
  onChange,
  onInteractionEnd,
  onInteractionStart,
  step,
  suffix,
  value,
}: RangePropertyRowProps) {
  const t = useTranslations("Editor.controls");
  const inputId = useId();
  const hasCanvasDimensionBounds =
    min === CANVAS_DIMENSION_MIN_MM && max === CANVAS_DIMENSION_MAX_MM;
  function handleChange(nextValue: string) {
    const numericValue = Number(nextValue);
    if (Number.isFinite(numericValue)) onChange(String(Math.min(max, Math.max(min, numericValue))));
  }
  return (
    <FieldRow htmlFor={inputId} label={label}>
      <span className="relative block">
        <input
          aria-label={label}
          className="w-full rounded-md border border-border bg-app py-1 pr-8 pl-2 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
          id={inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onBlur={onInteractionEnd}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={onInteractionStart}
          type="number"
          value={value}
        />
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted">
          {suffix}
        </span>
      </span>
      {suffix && !hasCanvasDimensionBounds ? (
        <input
          aria-label={t("adjust", { label })}
          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
          max={max}
          min={min}
          onBlur={onInteractionEnd}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={onInteractionStart}
          onPointerDown={onInteractionStart}
          onPointerUp={onInteractionEnd}
          step={step}
          type="range"
          value={value}
        />
      ) : null}
    </FieldRow>
  );
}
