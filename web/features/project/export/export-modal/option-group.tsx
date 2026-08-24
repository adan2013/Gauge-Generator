import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function OptionGroup({
  children,
  columns = "choices",
  legend,
  legendTone = "section",
}: {
  children: ReactNode;
  columns?: "choices" | "dpi" | "formats";
  legend: string;
  legendTone?: "field" | "section";
}) {
  return (
    <fieldset>
      <legend
        className={cn(
          "mb-2 text-sm",
          legendTone === "section" ? "font-semibold text-ink" : "text-muted",
        )}
      >
        {legend}
      </legend>
      <div
        className={cn(
          "grid gap-2",
          columns === "formats"
            ? "grid-cols-3"
            : columns === "dpi"
              ? "grid-cols-5"
              : "sm:grid-cols-2",
        )}
      >
        {children}
      </div>
    </fieldset>
  );
}
