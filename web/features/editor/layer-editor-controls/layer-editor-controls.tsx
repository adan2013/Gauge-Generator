"use client";

import { LayersArrowUp, RotateCcw, ScanEye, Settings2, type LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { useConfirmation } from "@/components/providers/confirmation-provider/confirmation-provider";
import { Tooltip } from "@/components/atoms/tooltip/tooltip";
import { cn } from "@/lib/cn";
import type { LayerPreviewModifiers } from "@/store/editor-slice";

type LayerEditorControlsProps = {
  modifiers: LayerPreviewModifiers;
  onModifiersChange: (modifiers: LayerPreviewModifiers) => void;
  onReset: () => void;
};

export function LayerEditorControls({
  modifiers,
  onModifiersChange,
  onReset,
}: LayerEditorControlsProps) {
  const t = useTranslations("Editor.layerEditor");
  const confirmationT = useTranslations("Editor.confirmation");
  const { confirm } = useConfirmation();

  function updateModifier(key: keyof LayerPreviewModifiers) {
    onModifiersChange({ ...modifiers, [key]: !modifiers[key] });
  }

  async function requestReset() {
    if (
      await confirm({
        confirmLabel: confirmationT("confirmReset"),
        description: confirmationT("resetLayerDescription"),
        title: confirmationT("resetLayerTitle"),
        variant: "danger",
      })
    )
      onReset();
  }

  return (
    <div className="border-t border-border bg-surface p-2">
      <div className="flex items-center justify-center gap-1.5">
        <Tooltip content={t("reset")} delayDuration={0}>
          <EditorIconButton
            icon={RotateCcw}
            label={t("reset")}
            onClick={() => void requestReset()}
            tone="danger"
          />
        </Tooltip>
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
        <Tooltip content={t("showOnlySelectedLayer")} delayDuration={0}>
          <EditorIconButton
            active={modifiers.showOnlySelectedLayer}
            icon={ScanEye}
            label={t("showOnlySelectedLayer")}
            onClick={() => updateModifier("showOnlySelectedLayer")}
          />
        </Tooltip>
        <Tooltip content={t("bringSelectedLayerToFront")} delayDuration={0}>
          <EditorIconButton
            active={modifiers.bringSelectedLayerToFront}
            icon={LayersArrowUp}
            label={t("bringSelectedLayerToFront")}
            onClick={() => updateModifier("bringSelectedLayerToFront")}
          />
        </Tooltip>
        <Tooltip content={t("showEditingOverlay")} delayDuration={0}>
          <EditorIconButton
            active={modifiers.showEditingOverlay}
            icon={Settings2}
            label={t("showEditingOverlay")}
            onClick={() => updateModifier("showEditingOverlay")}
          />
        </Tooltip>
      </div>
    </div>
  );
}

type EditorIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  tone?: "danger" | "default";
};

const EditorIconButton = forwardRef<HTMLButtonElement, EditorIconButtonProps>(
  ({ active = false, icon: Icon, label, onClick, tone = "default", ...buttonProps }, ref) => (
    <button
      aria-label={label}
      aria-pressed={tone === "default" ? active : undefined}
      className={cn(
        "grid size-9 place-items-center rounded-md transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        tone === "danger"
          ? "bg-accent text-white hover:bg-accent-hover"
          : active
            ? "bg-accent-subtle text-accent"
            : "text-muted hover:bg-surface-subtle hover:text-ink",
      )}
      onClick={onClick}
      ref={ref}
      type="button"
      {...buttonProps}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
    </button>
  ),
);

EditorIconButton.displayName = "EditorIconButton";
