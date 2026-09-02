"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Copy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import { Modal } from "@/components/molecules/modal/modal";
import type { LayerDto } from "@/features/project/project-dto/project-dto";

export function DuplicateLayerModal({
  layer,
  onCancel,
  onDuplicate,
}: {
  layer: LayerDto;
  onCancel: () => void;
  onDuplicate: (name: string) => void;
}) {
  const t = useTranslations("Editor.layers.duplicateDialog");
  const [name, setName] = useState(layer.name);
  const normalizedName = name.trim();
  const selectNameInput = useCallback((input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (normalizedName) onDuplicate(normalizedName);
  }

  return (
    <Modal.Root onClose={onCancel}>
      <form onSubmit={submit}>
        <Modal.Header description={t("description")} icon={Copy} title={t("title")} />
        <Modal.Body>
          <FieldRow className="grid-cols-1" htmlFor="duplicate-layer-name" label={t("nameLabel")}>
            <input
              aria-label={t("nameLabel")}
              className="h-9 w-full rounded-md border border-border bg-app px-2 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
              id="duplicate-layer-name"
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              ref={selectNameInput}
              required
              type="text"
              value={name}
            />
          </FieldRow>
        </Modal.Body>
        <Modal.Actions>
          <ActionButton icon={X} label={t("cancel")} onClick={onCancel} variant="quiet" />
          <ActionButton
            disabled={!normalizedName}
            icon={Copy}
            label={t("confirm")}
            type="submit"
            variant="primary"
          />
        </Modal.Actions>
      </form>
    </Modal.Root>
  );
}
