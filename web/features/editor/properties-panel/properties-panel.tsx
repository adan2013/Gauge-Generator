"use client";

import { ChevronLeft, Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import {
  getLinearScalePropertyDefinitions,
  getRangeNumericPropertyDefinitions,
  type LinearScalePropertyDefinition,
  type RangeNumericPropertyDefinition,
} from "@/features/layers/range/range-properties";
import {
  PropertyGroup,
  RangePropertyRow,
  TextPropertyRow,
} from "@/features/editor/property-controls/property-controls";
import type { CanvasDto, LayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";
import type { EditorSelection } from "@/store/editor-slice";

export type PropertiesPanelProps = {
  canvas: CanvasDto;
  ranges: RangeDto[];
  selectedLayer: LayerDto | undefined;
  selectedName: string;
  selectedObject: EditorSelection;
  selectedRange: RangeDto | undefined;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  onBack: () => void;
  onCreateLayer: (type: "tick-scale") => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onLayerRangeChange: (rangeId: string) => void;
  onNameChange: (value: string) => void;
  onRangeChange: (change: Partial<RangeDto>) => void;
};

export function PropertiesPanel({
  canvas,
  onBack,
  onCreateLayer,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  onLayerRangeChange,
  onNameChange,
  onRangeChange,
  ranges,
  selectedLayer,
  selectedName,
  selectedObject,
  selectedRange,
  snapping,
}: PropertiesPanelProps) {
  const t = useTranslations("Editor");
  const isRange = selectedObject?.collection !== "layers";
  const rangeDefinitions = selectedRange
    ? getRangeNumericPropertyDefinitions(selectedRange, canvas)
    : undefined;
  const linearScaleDefinitions = selectedRange
    ? getLinearScalePropertyDefinitions(selectedRange)
    : undefined;
  const updateRangeNumber = (definition: RangeNumericPropertyDefinition) => (value: string) => {
    const rawValue = Number(value);
    const increment = definition.snap === "angle" ? snapping.angleDegrees : snapping.distanceMm;
    const snappedValue = snapping.enabled ? Math.round(rawValue / increment) * increment : rawValue;
    onRangeChange({
      [definition.key]: Math.min(definition.max, Math.max(definition.min, snappedValue)),
    } as Partial<RangeDto>);
  };
  const updateLinearScale = (definition: LinearScalePropertyDefinition) => (value: string) => {
    if (selectedRange?.scaleDefinition.mode === "linear")
      onRangeChange({
        scaleDefinition: { ...selectedRange.scaleDefinition, [definition.key]: Number(value) },
      });
  };

  return (
    <section
      aria-label={isRange ? t("range.ariaLabel") : t("layers.propertiesAriaLabel")}
      className="flex h-full w-1/3 flex-col"
    >
      <div className="border-b border-border p-2">
        <ActionButton
          className="w-full justify-start"
          icon={ChevronLeft}
          label={t("controls.backToLayers")}
          onClick={onBack}
          variant="quiet"
        />
      </div>
      <div className="overflow-y-auto p-3">
        {!selectedObject ? (
          <LayerTypePicker onCreateLayer={onCreateLayer} />
        ) : isRange && rangeDefinitions && selectedRange ? (
          <RangeProperties
            linearScaleDefinitions={linearScaleDefinitions ?? []}
            numericDefinitions={rangeDefinitions}
            onHistoryTransactionEnd={onHistoryTransactionEnd}
            onHistoryTransactionStart={onHistoryTransactionStart}
            onNameChange={onNameChange}
            range={selectedRange}
            selectedName={selectedName}
            t={t}
            updateLinearScale={updateLinearScale}
            updateRangeNumber={updateRangeNumber}
          />
        ) : (
          <LayerProperties
            onHistoryTransactionEnd={onHistoryTransactionEnd}
            onHistoryTransactionStart={onHistoryTransactionStart}
            onLayerRangeChange={onLayerRangeChange}
            onNameChange={onNameChange}
            ranges={ranges}
            selectedLayer={selectedLayer}
            selectedName={selectedName}
            t={t}
          />
        )}
      </div>
    </section>
  );
}

function RangeProperties({
  linearScaleDefinitions,
  numericDefinitions,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  onNameChange,
  range,
  selectedName,
  t,
  updateLinearScale,
  updateRangeNumber,
}: {
  linearScaleDefinitions: readonly LinearScalePropertyDefinition[];
  numericDefinitions: readonly RangeNumericPropertyDefinition[];
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onNameChange: (value: string) => void;
  range: RangeDto;
  selectedName: string;
  t: ReturnType<typeof useTranslations>;
  updateLinearScale: (definition: LinearScalePropertyDefinition) => (value: string) => void;
  updateRangeNumber: (definition: RangeNumericPropertyDefinition) => (value: string) => void;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        {t("range.eyebrow")}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{t("range.title")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t("range.description")}</p>
      <PropertyGroup title={t("controls.identity")}>
        <TextPropertyRow
          label={t("controls.name")}
          onChange={onNameChange}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={selectedName}
        />
      </PropertyGroup>
      <PropertyGroup title={t("range.position")}>
        <RangeNumericFields
          definitions={numericDefinitions}
          group="position"
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          onUpdate={updateRangeNumber}
          t={t}
        />
      </PropertyGroup>
      <PropertyGroup title={t("range.geometry")}>
        <RangeNumericFields
          definitions={numericDefinitions}
          group="geometry"
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          onUpdate={updateRangeNumber}
          t={t}
        />
      </PropertyGroup>
      <PropertyGroup title={t("range.values")}>
        {range.scaleDefinition.mode === "linear" ? (
          linearScaleDefinitions.map((definition) => (
            <RangePropertyRow
              key={definition.key}
              label={t(`range.${definition.labelKey}`)}
              max={definition.max}
              min={definition.min}
              onChange={updateLinearScale(definition)}
              onInteractionEnd={onHistoryTransactionEnd}
              onInteractionStart={onHistoryTransactionStart}
              step={definition.step}
              suffix=""
              value={String(definition.value)}
            />
          ))
        ) : (
          <p className="py-3 text-sm leading-6 text-muted">{t("range.scaleModeDescription")}</p>
        )}
      </PropertyGroup>
    </>
  );
}

function RangeNumericFields({
  definitions,
  group,
  onInteractionEnd,
  onInteractionStart,
  onUpdate,
  t,
}: {
  definitions: readonly RangeNumericPropertyDefinition[];
  group: RangeNumericPropertyDefinition["group"];
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onUpdate: (definition: RangeNumericPropertyDefinition) => (value: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return definitions
    .filter((definition) => definition.group === group)
    .map((definition) => (
      <RangePropertyRow
        key={definition.key}
        label={t(`range.${definition.labelKey}`)}
        max={definition.max}
        min={definition.min}
        onChange={onUpdate(definition)}
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
        step={definition.step}
        suffix={t(`controls.${definition.unit}`)}
        value={String(definition.value)}
      />
    ));
}

function LayerProperties({
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  onLayerRangeChange,
  onNameChange,
  ranges,
  selectedLayer,
  selectedName,
  t,
}: {
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onLayerRangeChange: (rangeId: string) => void;
  onNameChange: (value: string) => void;
  ranges: RangeDto[];
  selectedLayer: LayerDto | undefined;
  selectedName: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        {t("layers.eyebrow")}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{t("layers.propertiesTitle")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t("layers.propertiesDescription")}</p>
      <PropertyGroup title={t("controls.identity")}>
        <TextPropertyRow
          label={t("controls.name")}
          onChange={onNameChange}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={selectedName}
        />
        {selectedLayer ? (
          <FieldRow htmlFor="layer-range" label={t("layers.rangeSource")}>
            <select
              aria-label={t("layers.rangeSource")}
              className="w-full rounded-md border border-border bg-app px-2 py-1.5 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
              id="layer-range"
              onChange={(event) => onLayerRangeChange(event.target.value)}
              value={selectedLayer.rangeId}
            >
              {ranges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </FieldRow>
        ) : null}
      </PropertyGroup>
    </>
  );
}
function LayerTypePicker({ onCreateLayer }: { onCreateLayer: (type: "tick-scale") => void }) {
  const t = useTranslations("Editor.layers");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        {t("picker.eyebrow")}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{t("picker.title")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t("picker.description")}</p>
      <div className="mt-5 space-y-2">
        <button
          className={cn(
            "flex w-full items-start gap-2.5 rounded-lg border border-border bg-app p-3 text-left",
            "transition-colors hover:border-focus hover:bg-surface-subtle",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          )}
          onClick={() => onCreateLayer("tick-scale")}
          type="button"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-subtle text-accent">
            <Layers3 aria-hidden="true" size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">{t("types.tickScale")}</span>
            <span className="mt-0.5 block text-sm leading-5 text-muted">
              {t("picker.tickScaleDescription")}
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
