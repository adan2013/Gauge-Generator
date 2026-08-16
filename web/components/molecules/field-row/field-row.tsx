import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldRowProps = {
  label: string;
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor?: string;
  unit?: string;
  className?: string;
};

export function FieldRow({
  children,
  className,
  description,
  error,
  htmlFor,
  label,
  unit,
}: FieldRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_minmax(0,9rem)] gap-x-3 gap-y-1.5 py-2",
        className,
      )}
    >
      <div className="min-w-0">
        <label className="text-sm text-muted" htmlFor={htmlFor}>
          {label}
          {unit ? <span className="ml-1 text-xs"> ({unit})</span> : null}
        </label>
        {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
      {error ? (
        <p className="col-span-2 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
