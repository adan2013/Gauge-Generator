"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TableOfContentsItem } from "@/app/docs/docs-markdown";
import { SUPPORTED_LANGUAGES, type SupportedLocale } from "@/i18n/locales";
import { cn } from "@/lib/cn";

type DocsSidebarProps = {
  closeLabel: string;
  items: TableOfContentsItem[];
  languageLabel: string;
  locale: SupportedLocale;
  navigationLabel: string;
  openLabel: string;
  tableOfContentsLabel: string;
};

export function DocsSidebar({
  closeLabel,
  items,
  languageLabel,
  locale,
  navigationLabel,
  openLabel,
  tableOfContentsLabel,
}: DocsSidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-controls="docs-sidebar"
        aria-expanded={isOpen}
        aria-label={openLabel}
        className={cn(
          "fixed left-4 top-4 z-40 grid size-10 place-items-center rounded-lg border border-border bg-surface text-ink shadow-sm transition-opacity",
          "hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus xl:hidden",
          isOpen && "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      {isOpen ? (
        <button
          aria-label={closeLabel}
          className="fixed inset-0 z-20 cursor-default bg-ink/20 xl:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 -translate-x-full border-r border-border bg-surface px-5 py-6 shadow-xl transition-transform",
          "xl:w-64 xl:translate-x-0 xl:shadow-none",
          isOpen && "translate-x-0",
        )}
        id="docs-sidebar"
      >
        <div className="flex items-center justify-between gap-3">
          <Link aria-label="Gauge Generator home" className="min-w-0" href="/">
            <Image
              alt=""
              className="h-11 w-auto max-w-44"
              height={300}
              priority
              src="/brand/gauge-generator-logo-horizontal.svg"
              width={1180}
            />
          </Link>
          <button
            aria-label={closeLabel}
            className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-subtle hover:text-ink xl:hidden"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {languageLabel}
          <select
            className={cn(
              "mt-2 h-10 w-full rounded-lg border border-border bg-app px-3 text-sm font-medium normal-case tracking-normal text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            )}
            onChange={(event) => router.push(`/docs/${event.target.value}`)}
            value={locale}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.locale} value={language.locale}>
                {language.name}
              </option>
            ))}
          </select>
        </label>
        <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {tableOfContentsLabel}
        </p>
        <nav aria-label={navigationLabel} className="h-[calc(100dvh-12.5rem)] overflow-y-auto pr-2">
          <ol className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  className={cn(
                    "block rounded-md py-1.5 text-sm leading-5 text-muted hover:bg-surface-subtle hover:text-ink",
                    item.depth === 2 ? "px-2 font-medium" : "py-1 pl-5 pr-2 text-[13px]",
                  )}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
    </>
  );
}
