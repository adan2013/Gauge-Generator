"use client";

import { FolderOpen, HardDrive, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Modal } from "@/components/molecules/modal/modal";
import { ProjectOptionCard } from "@/features/editor/project-option-card/project-option-card";
import type { AutosaveSnapshot } from "@/features/project/persistence/project-autosave";

export function RestoreModal({
  onCancel,
  onSelect,
  snapshots,
}: {
  onCancel: () => void;
  onSelect: (id: string) => void;
  snapshots: AutosaveSnapshot[];
}) {
  const t = useTranslations("Editor");

  return (
    <Modal.Root onClose={onCancel}>
      <Modal.Header
        description={t("restore.description")}
        icon={HardDrive}
        title={t("restore.title")}
      />
      <Modal.Body>
        {snapshots.length === 0 ? (
          <p className="text-sm text-muted">{t("restore.empty")}</p>
        ) : (
          <ul className="grid max-h-72 gap-2 overflow-y-auto p-2" role="list">
            {snapshots.map((snapshot) => (
              <li key={snapshot.savedAt}>
                <ProjectOptionCard
                  accessibleLabel={`${t("restore.open")}: ${snapshot.project.meta.title}`}
                  className="flex items-center gap-3 p-3"
                  onClick={() => onSelect(snapshot.savedAt)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ink">{snapshot.project.meta.title}</p>
                      <FolderOpen
                        aria-hidden="true"
                        className="shrink-0 text-muted transition-colors group-hover:text-accent"
                        size={18}
                      />
                    </div>
                    <p className="mt-1 text-sm leading-5 text-muted">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(snapshot.savedAt))}
                    </p>
                  </div>
                </ProjectOptionCard>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Actions>
        <ActionButton
          icon={X}
          label={t("confirmation.cancel")}
          onClick={onCancel}
          variant="quiet"
        />
      </Modal.Actions>
    </Modal.Root>
  );
}
