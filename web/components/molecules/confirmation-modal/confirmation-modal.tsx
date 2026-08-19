"use client";

import { AlertTriangle, X, type LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { cn } from "@/lib/cn";

type ConfirmationModalProps = {
  cancelLabel: string;
  confirmIcon: LucideIcon;
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: "danger" | "default";
};

export function ConfirmationModal({
  cancelLabel,
  confirmIcon,
  confirmLabel,
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
  variant = "default",
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" role="presentation">
      <section
        aria-describedby="confirmation-modal-description"
        aria-labelledby="confirmation-modal-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-[0_20px_65px_rgba(32,36,43,0.2)]"
        role="alertdialog"
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg",
              variant === "danger"
                ? "bg-accent-subtle text-accent"
                : "bg-surface-subtle text-muted",
            )}
          >
            <AlertTriangle aria-hidden="true" size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink" id="confirmation-modal-title">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted" id="confirmation-modal-description">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <ActionButton icon={X} label={cancelLabel} onClick={onCancel} variant="quiet" />
          <ActionButton
            icon={confirmIcon}
            label={confirmLabel}
            onClick={onConfirm}
            variant="primary"
          />
        </div>
      </section>
    </div>
  );
}
