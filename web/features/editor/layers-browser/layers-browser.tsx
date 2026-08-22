"use client";

import type { DragEvent as ReactDragEvent } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Layers3, Plus, Settings2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Tooltip } from "@/components/atoms/tooltip/tooltip";
import { useConfirmation } from "@/components/providers/confirmation-provider/confirmation-provider";
import { LayerThumbnail } from "@/features/layers/core/layer-thumbnail/layer-thumbnail";
import {
  LAYER_TYPE,
  MAX_RANGES,
  type LayerDto,
  type ProjectDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";

export type LayersBrowserProps = {
  layers: LayerDto[];
  project: ProjectDto;
  ranges: RangeDto[];
  onCreateLayer: () => void;
  onCreateRange: () => void;
  onDuplicateLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onDeleteRange: (rangeId: string) => void;
  onHoverLayer: (layerId: string | null) => void;
  onOpenLayerProperties: (layerId: string) => void;
  onOpenProjectSettings: () => void;
  onOpenRangeProperties: (rangeId: string) => void;
  onReorderLayer: (layerId: string, targetIndex: number) => void;
  onToggleLayerVisibility: (layerId: string) => void;
};

export function LayersBrowser({
  layers,
  onCreateLayer,
  onCreateRange,
  onDuplicateLayer,
  onDeleteLayer,
  onDeleteRange,
  onHoverLayer,
  onOpenLayerProperties,
  onOpenProjectSettings,
  onOpenRangeProperties,
  onReorderLayer,
  onToggleLayerVisibility,
  project,
  ranges,
}: LayersBrowserProps) {
  const t = useTranslations("Editor.layers");
  const rangesT = useTranslations("Editor.ranges");
  const confirmationT = useTranslations("Editor.confirmation");
  const { confirm } = useConfirmation();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  function handleLayerDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const targetIndex = layers.findIndex((layer) => layer.id === over.id);
    if (targetIndex >= 0) onReorderLayer(String(active.id), targetIndex);
  }
  function handleNativeLayerDrop(event: ReactDragEvent<HTMLLIElement>, targetLayerId: string) {
    event.preventDefault();
    const sourceLayerId =
      event.dataTransfer.getData("application/x-gauge-layer") ||
      event.dataTransfer.getData("text/plain");
    const targetIndex = layers.findIndex((layer) => layer.id === targetLayerId);
    if (sourceLayerId && sourceLayerId !== targetLayerId && targetIndex >= 0)
      onReorderLayer(sourceLayerId, targetIndex);
  }
  async function requestLayerDeletion(layer: LayerDto) {
    if (
      await confirm({
        confirmIcon: Trash2,
        description: confirmationT("deleteLayerDescription", { name: layer.name }),
        title: confirmationT("deleteLayerTitle"),
        variant: "danger",
      })
    )
      onDeleteLayer(layer.id);
  }
  async function requestRangeDeletion(range: RangeDto) {
    if (
      await confirm({
        confirmIcon: Trash2,
        description: confirmationT("deleteRangeDescription", { name: range.name }),
        title: confirmationT("deleteRangeTitle"),
        variant: "danger",
      })
    )
      onDeleteRange(range.id);
  }
  return (
    <section aria-label={t("title")} className="flex h-full w-1/3 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Layers3 aria-hidden="true" className="shrink-0 text-accent" size={18} />
          <h1 className="truncate font-semibold">{t("title")}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActionButton
            icon={Settings2}
            label={t("projectSettings")}
            onClick={onOpenProjectSettings}
            variant="quiet"
          />
          <ActionButton
            disabled={ranges.length === 0}
            icon={Plus}
            label={t("addLayer")}
            onClick={onCreateLayer}
            variant="primary"
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <section
          aria-labelledby="layers-list-heading"
          className="min-h-0 flex-1 overflow-y-auto p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted"
              id="layers-list-heading"
            >
              {t("visualLayers")}
            </h2>
            <span className="text-xs text-muted">{layers.length}</span>
          </div>
          {layers.length === 0 ? (
            <div className="mt-3">
              <p className="text-sm leading-6 text-muted">{t("emptyDescription")}</p>
              {ranges.length > 0 ? (
                <ActionButton
                  className="mt-4"
                  icon={Plus}
                  label={t("createFirstLayer")}
                  onClick={onCreateLayer}
                  variant="primary"
                />
              ) : null}
            </div>
          ) : (
            <DndContext onDragEnd={handleLayerDragEnd} sensors={sensors}>
              <SortableContext
                items={layers.map((layer) => layer.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="mt-3 space-y-2">
                  {layers.map((layer) => (
                    <SortableLayerRow
                      key={layer.id}
                      layer={layer}
                      onDelete={() => void requestLayerDeletion(layer)}
                      onDuplicate={() => onDuplicateLayer(layer.id)}
                      onEdit={() => onOpenLayerProperties(layer.id)}
                      onHoverChange={onHoverLayer}
                      onNativeDrop={handleNativeLayerDrop}
                      onToggleVisibility={() => onToggleLayerVisibility(layer.id)}
                      project={project}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>
        <section
          aria-labelledby="ranges-list-heading"
          className="max-h-[45%] shrink-0 overflow-y-auto border-t border-border p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted"
              id="ranges-list-heading"
            >
              {rangesT("title")}
            </h2>
            <span className="text-xs font-medium text-muted">
              {rangesT("count", { current: ranges.length, maximum: MAX_RANGES })}
            </span>
          </div>
          {ranges.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted">{rangesT("emptyDescription")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {ranges.map((range) => {
                const dependentLayerCount = layers.filter(
                  (layer) => layer.rangeId === range.id,
                ).length;
                const canDelete = dependentLayerCount === 0;
                const deleteLabel = canDelete
                  ? rangesT("delete", { name: range.name })
                  : rangesT("deleteDisabled", { count: dependentLayerCount });
                return (
                  <li
                    className="rounded-lg border border-border bg-app"
                    key={range.id}
                    onDoubleClick={() => onOpenRangeProperties(range.id)}
                  >
                    <div className="flex items-center gap-1 px-1 py-1">
                      <button
                        aria-label={rangesT("edit", { name: range.name })}
                        className="min-w-0 flex-1 rounded-md px-1 py-1 text-left hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        onClick={() => onOpenRangeProperties(range.id)}
                        type="button"
                      >
                        <span className="block truncate text-sm font-medium text-ink">
                          {range.name}
                        </span>
                      </button>
                      <Tooltip content={deleteLabel}>
                        <span className="inline-flex">
                          <button
                            aria-label={deleteLabel}
                            className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-accent-subtle hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={!canDelete}
                            onClick={() => void requestRangeDeletion(range)}
                            type="button"
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                        </span>
                      </Tooltip>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <ActionButton
            className="mt-4 w-full justify-center"
            disabled={ranges.length >= MAX_RANGES}
            icon={Plus}
            label={ranges.length === 0 ? t("createFirstRange") : rangesT("add")}
            onClick={onCreateRange}
            variant={ranges.length === 0 ? "primary" : "quiet"}
          />
        </section>
      </div>
    </section>
  );
}

function SortableLayerRow({
  layer,
  onDelete,
  onDuplicate,
  onEdit,
  onNativeDrop,
  onToggleVisibility,
  onHoverChange,
  project,
}: {
  layer: LayerDto;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onHoverChange: (layerId: string | null) => void;
  onNativeDrop: (event: ReactDragEvent<HTMLLIElement>, targetLayerId: string) => void;
  onToggleVisibility: () => void;
  project: ProjectDto;
}) {
  const t = useTranslations("Editor.layers");
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: layer.id,
  });
  const reorderLabel = t("reorderLayer", { name: layer.name });
  const visibilityLabel = layer.visible
    ? t("hideLayer", { name: layer.name })
    : t("showLayer", { name: layer.name });
  const duplicateLabel = t("duplicateLayer", { name: layer.name });
  const deleteLabel = t("deleteLayer", { name: layer.name });
  const layerTypeLabelKey = {
    [LAYER_TYPE.tickScale]: "types.tickScale",
    [LAYER_TYPE.numericScale]: "types.numericScale",
    [LAYER_TYPE.label]: "types.label",
    [LAYER_TYPE.arc]: "types.arc",
    [LAYER_TYPE.needle]: "types.needle",
    [LAYER_TYPE.ellipse]: "types.ellipse",
    [LAYER_TYPE.rectangle]: "types.rectangle",
  } as const;
  return (
    <li
      className={cn("rounded-lg border border-border bg-app", isDragging && "opacity-50")}
      onDoubleClick={onEdit}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onNativeDrop(event, layer.id)}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex items-center gap-1 px-1 py-1">
        <Tooltip content={reorderLabel}>
          <span className="inline-flex">
            <button
              aria-label={reorderLabel}
              className="grid size-8 shrink-0 touch-none cursor-grab place-items-center rounded-md text-muted hover:bg-surface-subtle hover:text-ink active:cursor-grabbing"
              onDragStart={(event) => {
                event.dataTransfer.setData("application/x-gauge-layer", layer.id);
                event.dataTransfer.setData("text/plain", layer.id);
              }}
              type="button"
              {...attributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" size={16} />
            </button>
          </span>
        </Tooltip>
        <span
          onPointerEnter={() => onHoverChange(layer.id)}
          onPointerLeave={() => onHoverChange(null)}
        >
          <LayerThumbnail layer={layer} project={project} />
        </span>
        <button
          aria-label={t("editLayer", { name: layer.name })}
          className="min-w-0 flex-1 rounded-md px-2 py-1 text-left hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          onClick={onEdit}
          type="button"
        >
          <span
            className={cn(
              "block truncate text-sm font-medium",
              !layer.visible && "text-muted line-through",
            )}
          >
            {layer.name}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            {t(layerTypeLabelKey[layer.type])}
          </span>
        </button>
        <Tooltip content={visibilityLabel}>
          <button
            aria-label={visibilityLabel}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={onToggleVisibility}
            type="button"
          >
            {layer.visible ? (
              <Eye aria-hidden="true" size={16} />
            ) : (
              <EyeOff aria-hidden="true" size={16} />
            )}
          </button>
        </Tooltip>
        <Tooltip content={duplicateLabel}>
          <button
            aria-label={duplicateLabel}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={onDuplicate}
            type="button"
          >
            <Copy aria-hidden="true" size={16} />
          </button>
        </Tooltip>
        <Tooltip content={deleteLabel}>
          <button
            aria-label={deleteLabel}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-accent-subtle hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={onDelete}
            type="button"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}
