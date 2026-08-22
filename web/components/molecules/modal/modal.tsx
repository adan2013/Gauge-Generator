"use client";

import { createContext, use, useEffect, useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalContextValue = {
  descriptionId: string;
  titleId: string;
};

const ModalContext = createContext<ModalContextValue | null>(null);
const subscribeToClientEnvironment = () => () => {};

function useModalContext() {
  const context = use(ModalContext);
  if (!context) throw new Error("Modal components must be used within Modal.Root.");
  return context;
}

function ModalRoot({
  children,
  onClose,
  role = "dialog",
}: {
  children: ReactNode;
  onClose: () => void;
  role?: "alertdialog" | "dialog";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const canRenderPortal = useSyncExternalStore(
    subscribeToClientEnvironment,
    () => true,
    () => false,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.repeat) return;
      event.preventDefault();
      onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!canRenderPortal) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" role="presentation">
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-[0_20px_65px_rgba(32,36,43,0.2)]"
        role={role}
      >
        <ModalContext value={{ descriptionId, titleId }}>{children}</ModalContext>
      </section>
    </div>,
    document.body,
  );
}

function ModalHeader({
  description,
  icon: Icon,
  title,
  tone = "default",
}: {
  description: string;
  icon: LucideIcon;
  title: string;
  tone?: "danger" | "default";
}) {
  const { descriptionId, titleId } = useModalContext();
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          tone === "danger" ? "bg-accent-subtle text-accent" : "bg-surface-subtle text-muted",
        )}
      >
        <Icon aria-hidden="true" size={18} />
      </span>
      <div>
        <h2 className="text-base font-semibold text-ink" id={titleId}>
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-muted" id={descriptionId}>
          {description}
        </p>
      </div>
    </div>
  );
}

function ModalBody({ children }: { children: ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

function ModalActions({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2">{children}</div>;
}

export const Modal = {
  Actions: ModalActions,
  Body: ModalBody,
  Header: ModalHeader,
  Root: ModalRoot,
};
