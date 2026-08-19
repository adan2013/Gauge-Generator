"use client";

import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import {
  CANVAS_DIMENSION_MAX_MM,
  CANVAS_DIMENSION_MIN_MM,
} from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";

type PendingCommitContextValue = {
  hintId: string;
  pendingLabel: string | null;
  setPendingLabel: (label: string | null) => void;
};

const PendingCommitContext = createContext<PendingCommitContextValue | null>(null);

export function PendingCommitProvider({ children }: { children: ReactNode }) {
  const hintId = useId();
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  return (
    <PendingCommitContext value={{ hintId, pendingLabel, setPendingLabel }}>
      {children}
    </PendingCommitContext>
  );
}

export function PendingCommitIndicator({ className }: { className?: string }) {
  const t = useTranslations("Editor.controls");
  const pendingCommit = useContext(PendingCommitContext);
  if (!pendingCommit?.pendingLabel) return null;
  return (
    <div
      aria-live="polite"
      className={cn(
        "z-10 flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2",
        "text-xs leading-5 text-ink shadow-md",
        className,
      )}
      id={pendingCommit.hintId}
      role="status"
    >
      <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
      <span>{t("pendingCommit")}</span>
    </div>
  );
}

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
        className="h-9 w-full rounded-md border border-border bg-app px-2 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
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
  className?: string;
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
  className,
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
  const pendingCommit = useContext(PendingCommitContext);
  const [draftValue, setDraftValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const cancelCommitRef = useRef(false);
  const hasPendingChange = isEditing && draftValue !== value;
  const hasCanvasDimensionBounds =
    min === CANVAS_DIMENSION_MIN_MM && max === CANVAS_DIMENSION_MAX_MM;
  function normalize(nextValue: string) {
    if (!nextValue.trim()) return null;
    const numericValue = Number(nextValue);
    return Number.isFinite(numericValue)
      ? String(Math.min(max, Math.max(min, numericValue)))
      : null;
  }
  function applyNormalizedValue(nextValue: string) {
    const normalizedValue = normalize(nextValue);
    if (normalizedValue !== null) onChange(normalizedValue);
  }
  function handleFocus() {
    cancelCommitRef.current = false;
    setDraftValue(value);
    setIsEditing(true);
    pendingCommit?.setPendingLabel(null);
    onInteractionStart();
  }
  function handleBlur() {
    const normalizedValue = normalize(draftValue);
    setIsEditing(false);
    if (!cancelCommitRef.current && normalizedValue !== null && normalizedValue !== value)
      onChange(normalizedValue);
    pendingCommit?.setPendingLabel(null);
    onInteractionEnd();
  }
  return (
    <FieldRow className={className} htmlFor={inputId} label={label}>
      <span className="relative block">
        <input
          aria-describedby={hasPendingChange ? pendingCommit?.hintId : undefined}
          aria-label={label}
          className={cn(
            "w-full rounded-md border bg-app py-1 pr-8 pl-2 text-right text-sm text-ink outline-none",
            "border-border focus:border-focus focus:ring-2 focus:ring-focus/30",
            hasPendingChange && "border-focus ring-2 ring-focus/20",
          )}
          id={inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onBlur={handleBlur}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);
            pendingCommit?.setPendingLabel(nextValue !== value ? label : null);
          }}
          onFocus={handleFocus}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              cancelCommitRef.current = true;
              setDraftValue(value);
              pendingCommit?.setPendingLabel(null);
            }
            if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
          }}
          step={step}
          type="number"
          value={isEditing ? draftValue : value}
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
          onChange={(event) => applyNormalizedValue(event.target.value)}
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
