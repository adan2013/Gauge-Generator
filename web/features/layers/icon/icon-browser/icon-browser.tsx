"use client";

import { useDeferredValue, useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic.mjs";
import { lucideIconNames } from "@/features/layers/icon/lucide-icon-resources";
import { cn } from "@/lib/cn";

const RESULT_LIMIT = 80;

type IconBrowserProps = {
  emptyHint: string;
  noResultsLabel: string;
  onChange: (name: string) => void;
  poweredByLabel: string;
  searchAriaLabel: string;
  searchPlaceholder: string;
  selectedName: string;
};

export function IconBrowser({
  emptyHint,
  noResultsLabel,
  onChange,
  poweredByLabel,
  searchAriaLabel,
  searchPlaceholder,
  selectedName,
}: IconBrowserProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const hasQuery = deferredSearch.length > 0;
  const matchingNames = hasQuery
    ? lucideIconNames.filter((name) => name.includes(deferredSearch)).slice(0, RESULT_LIMIT)
    : [];

  return (
    <div className="pt-3">
      <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-surface-subtle px-3 py-2">
        <DynamicIcon aria-hidden="true" name={selectedName as IconName} size={20} />
        <span className="min-w-0 truncate font-mono text-xs text-muted">{selectedName}</span>
      </div>
      <input
        aria-label={searchAriaLabel}
        className={cn(
          "h-9 w-full rounded-md border border-border bg-app px-3 text-sm text-ink",
          "placeholder:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20",
        )}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={search}
      />
      <p className="mt-1 text-right text-[10px] font-medium tracking-wide text-muted">
        <a
          className="hover:cursor-pointer hover:underline"
          href="https://lucide.dev"
          rel="noreferrer noopener"
          target="_blank"
        >
          {poweredByLabel}
        </a>
      </p>
      {!hasQuery ? (
        <p className="mt-3 text-sm leading-5 text-muted">{emptyHint}</p>
      ) : matchingNames.length ? (
        <div className="mt-2 grid max-h-64 grid-cols-4 gap-1 overflow-y-auto pr-1">
          {matchingNames.map((name) => (
            <button
              aria-label={name}
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1 py-2",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
                name === selectedName
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-app text-ink hover:border-focus hover:bg-surface-subtle",
              )}
              key={name}
              onClick={() => onChange(name)}
              type="button"
            >
              <DynamicIcon aria-hidden="true" name={name} size={20} />
              <span className="w-full truncate text-center font-mono text-[9px] leading-3">
                {name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{noResultsLabel}</p>
      )}
    </div>
  );
}
