"use client";

import { BookOpen, FolderOpen, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Modal } from "@/components/molecules/modal/modal";
import { ProjectOptionCard } from "@/features/editor/project-option-card/project-option-card";
import { ExampleProjectPreview } from "@/features/examples/example-project-preview";
import { EXAMPLE_PROJECTS } from "@/features/examples/example-projects";

export function ExamplesModal({
  onCancel,
  onSelect,
}: {
  onCancel: () => void;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Editor");

  return (
    <Modal.Root onClose={onCancel} size="wide">
      <Modal.Header
        description={t("examples.description")}
        icon={BookOpen}
        title={t("examples.title")}
      />
      <Modal.Body>
        <ul
          className="grid max-h-[min(68vh,45rem)] grid-cols-1 gap-4 overflow-y-auto p-2 sm:grid-cols-2"
          role="list"
        >
          {EXAMPLE_PROJECTS.map((example) => (
            <li key={example.id}>
              <ProjectOptionCard
                accessibleLabel={`${t("examples.open")}: ${example.title}`}
                onClick={() => onSelect(example.id)}
              >
                <ExampleProjectPreview
                  className="border-b border-border"
                  project={example.project}
                  title={example.title}
                />
                <div className="min-w-0 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{example.title}</p>
                    <FolderOpen
                      aria-hidden="true"
                      className="shrink-0 text-muted transition-colors group-hover:text-accent"
                      size={18}
                    />
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted">{example.description}</p>
                </div>
              </ProjectOptionCard>
            </li>
          ))}
        </ul>
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
