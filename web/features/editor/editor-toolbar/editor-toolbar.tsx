"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Tooltip } from "@/components/atoms/tooltip/tooltip";

export type EditorToolbarAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type EditorToolbarProps = {
  actions: EditorToolbarAction[];
  onAction: (action: EditorToolbarAction) => void;
  onOpenHelp: () => void;
};

export function EditorToolbar({ actions, onAction, onOpenHelp }: EditorToolbarProps) {
  const t = useTranslations("Editor");
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [visibleCount, setVisibleCount] = useState(actions.length);

  useLayoutEffect(() => {
    function calculateVisibleActions() {
      const availableWidth = containerRef.current?.clientWidth ?? 0;
      const actionWidths = measurementRefs.current.map(
        (element) => element?.getBoundingClientRect().width ?? 0,
      );
      const moreWidth = 40;
      const gap = 4;
      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (let index = 0; index < actionWidths.length; index += 1) {
        const actionGap = nextVisibleCount > 0 ? gap : 0;
        const mustReserveMore = index < actionWidths.length - 1 ? moreWidth + gap : 0;
        if (usedWidth + actionGap + actionWidths[index] + mustReserveMore > availableWidth) break;
        usedWidth += actionGap + actionWidths[index];
        nextVisibleCount += 1;
      }
      setVisibleCount(nextVisibleCount);
    }

    calculateVisibleActions();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(calculateVisibleActions);
    if (containerRef.current && observer) observer.observe(containerRef.current);
    return () => observer?.disconnect();
  }, [actions]);

  const visibleActions = actions.slice(0, visibleCount);
  const overflowActions = actions.slice(visibleCount);
  function handleAction(action: EditorToolbarAction) {
    if (action.disabled) return;
    if (action.id === "helpCenter") {
      onOpenHelp();
      return;
    }
    onAction(action);
  }

  return (
    <nav aria-label={t("toolbar.ariaLabel")} className="ml-auto min-w-0 flex-1">
      <div className="relative flex justify-end gap-1" ref={containerRef}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute invisible flex gap-1 whitespace-nowrap"
        >
          {actions.map(({ icon, id, label }, index) => (
            <span
              key={id}
              ref={(element) => {
                measurementRefs.current[index] = element;
              }}
            >
              <ActionButton icon={icon} label={label} variant="quiet" />
            </span>
          ))}
        </div>
        {visibleActions.map((action) => (
          <ActionButton
            disabled={action.disabled}
            icon={action.icon}
            key={action.id}
            label={action.label}
            onClick={() => handleAction(action)}
            variant="quiet"
          />
        ))}
        {overflowActions.length > 0 ? (
          <details className="relative shrink-0">
            <Tooltip content={t("toolbar.moreActions")}>
              <summary className="flex size-8 cursor-pointer list-none items-center justify-center rounded-md text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                <MoreHorizontal aria-hidden="true" size={18} />
                <span className="sr-only">{t("toolbar.moreActions")}</span>
              </summary>
            </Tooltip>
            <div className="absolute right-0 top-10 z-30 flex w-52 flex-col gap-1 rounded-lg border border-border bg-surface p-1.5 shadow-[0_16px_40px_rgba(32,36,43,0.16)]">
              {overflowActions.map((action) => (
                <ActionButton
                  className="justify-start"
                  disabled={action.disabled}
                  icon={action.icon}
                  key={action.id}
                  label={action.label}
                  onClick={() => handleAction(action)}
                  variant="quiet"
                />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </nav>
  );
}
