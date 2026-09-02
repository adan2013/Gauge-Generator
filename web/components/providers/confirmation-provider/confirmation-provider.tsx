"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfirmationModal } from "@/components/molecules/confirmation-modal/confirmation-modal";

export type ConfirmationRequest = {
  confirmIcon: LucideIcon;
  confirmLabel?: string;
  description: string;
  title: string;
  variant?: "danger" | "default";
};

type ConfirmationContextValue = { confirm: (request: ConfirmationRequest) => Promise<boolean> };
const ConfirmationContext = createContext<ConfirmationContextValue | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Editor.confirmation");
  const [request, setRequest] = useState<ConfirmationRequest | undefined>();
  const resolveRef = useRef<((confirmed: boolean) => void) | undefined>(undefined);
  function close(confirmed: boolean) {
    resolveRef.current?.(confirmed);
    resolveRef.current = undefined;
    setRequest(undefined);
  }
  function confirm(nextRequest: ConfirmationRequest): Promise<boolean> {
    if (resolveRef.current) close(false);
    setRequest(nextRequest);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }
  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {request ? (
        <ConfirmationModal
          cancelLabel={t("cancel")}
          confirmIcon={request.confirmIcon}
          confirmLabel={request.confirmLabel ?? t("confirmDelete")}
          description={request.description}
          isOpen
          onCancel={() => close(false)}
          onConfirm={() => close(true)}
          title={request.title}
          variant={request.variant}
        />
      ) : null}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation(): ConfirmationContextValue {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("useConfirmation must be used within ConfirmationProvider.");
  return context;
}
