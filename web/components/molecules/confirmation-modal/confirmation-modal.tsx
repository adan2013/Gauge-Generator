"use client";

import { AlertTriangle, X, type LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Modal } from "@/components/molecules/modal/modal";

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
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <Modal.Root onClose={onCancel} role="alertdialog">
      <Modal.Header description={description} icon={AlertTriangle} title={title} tone={variant} />
      <Modal.Actions>
        <ActionButton icon={X} label={cancelLabel} onClick={onCancel} variant="quiet" />
        <ActionButton
          icon={confirmIcon}
          label={confirmLabel}
          onClick={onConfirm}
          variant="primary"
        />
      </Modal.Actions>
    </Modal.Root>
  );
}
