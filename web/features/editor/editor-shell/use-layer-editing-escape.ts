"use client";

import { useEffect } from "react";

type UseLayerEditingEscapeOptions = {
  enabled: boolean;
  onEscape: () => void;
};

export function useLayerEditingEscape({ enabled, onEscape }: UseLayerEditingEscapeOptions) {
  useEffect(() => {
    if (!enabled) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.repeat || event.defaultPrevented) return;
      if (document.querySelector('[role="alertdialog"], [role="dialog"]')) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      onEscape();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onEscape]);
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select") || target.isContentEditable)
  );
}
