"use client";

import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import { useConfirmation } from "@/components/providers/confirmation-provider/confirmation-provider";
import {
  PropertyGroup,
  RangePropertyRow,
  TextPropertyRow,
} from "@/features/editor/property-controls/property-controls";
import {
  getScalePropertyDefinitions,
  getRangeNumericPropertyDefinitions,
  type ScalePropertyDefinition,
  type RangeNumericPropertyDefinition,
} from "@/features/ranges/range/range-properties";
import { CustomScaleEditor } from "@/features/ranges/scale-mapping/custom-scale-editor/custom-scale-editor";
import {
  createScaleDefinitionForMode,
  type ScaleMode,
} from "@/features/ranges/scale-mapping/scale-definition";
import type {
  CanvasDto,
  RangeDto,
  ScaleDefinitionDto,
} from "@/features/project/project-dto/project-dto";

type ValueDirection = RangeDto["valueDirection"];
type LogarithmicDetailEmphasis = Extract<
  ScaleDefinitionDto,
  { mode: "logarithmic" }
>["detailEmphasis"];

type RangePropertiesEditorProps = {
  canvas: CanvasDto;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onNameChange: (value: string) => void;
  onRangeChange: (change: Partial<RangeDto>) => void;
  range: RangeDto;
  selectedName: string;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function RangePropertiesEditor({
  canvas,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  onNameChange,
  onRangeChange,
  range,
  selectedName,
  snapping,
}: RangePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const { confirm } = useConfirmation();
  const numericDefinitions = getRangeNumericPropertyDefinitions(range, canvas);
  const scaleDefinitions = getScalePropertyDefinitions(range);
  const customScaleDefinition =
    range.scaleDefinition.mode === "custom" ? range.scaleDefinition : undefined;
  const updateNumber = (definition: RangeNumericPropertyDefinition) => (value: string) => {
    const increment = definition.snap === "angle" ? snapping.angleDegrees : snapping.distanceMm;
    const raw = Number(value);
    const next = snapping.enabled ? Math.round(raw / increment) * increment : raw;
    onRangeChange({
      [definition.key]: Math.min(definition.max, Math.max(definition.min, next)),
    } as Partial<RangeDto>);
  };
  const updateScale = (definition: ScalePropertyDefinition) => (value: string) => {
    const current = range.scaleDefinition;
    if (current.mode === "custom") return;
    const next = Math.round(Number(value));
    onRangeChange({ scaleDefinition: { ...current, [definition.key]: next } });
  };
  async function changeScaleMode(mode: string) {
    if (!isScaleMode(mode)) return;
    const transition = createScaleDefinitionForMode(range.scaleDefinition, mode);
    if (
      transition.requiresConfirmation &&
      !(await confirm({
        confirmIcon: RefreshCw,
        confirmLabel: t("range.scaleModeConfirm"),
        description: t("range.scaleModeChangeDescription"),
        title: t("range.scaleModeChangeTitle"),
      }))
    )
      return;
    onRangeChange({ scaleDefinition: transition.definition });
  }
  function changeValueDirection(direction: string) {
    if (isValueDirection(direction)) onRangeChange({ valueDirection: direction });
  }
  function changeLogarithmicDetailEmphasis(detailEmphasis: string) {
    const current = range.scaleDefinition;
    if (current.mode !== "logarithmic" || !isLogarithmicDetailEmphasis(detailEmphasis)) return;
    onRangeChange({ scaleDefinition: { ...current, detailEmphasis } });
  }
  const renderNumericFieldsByGroup = (group: RangeNumericPropertyDefinition["group"]) =>
    numericDefinitions
      .filter((definition) => definition.group === group)
      .map((definition) => (
        <RangePropertyRow
          key={definition.key}
          label={t(`range.${definition.labelKey}`)}
          max={definition.max}
          min={definition.min}
          onChange={updateNumber(definition)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          step={definition.step}
          suffix={t(`controls.${definition.unit}`)}
          value={String(definition.value)}
        />
      ));
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
        {renderNumericFieldsByGroup("position")}
      </PropertyGroup>
      <PropertyGroup title={t("range.geometry")}>
        {renderNumericFieldsByGroup("geometry")}
      </PropertyGroup>
      <PropertyGroup title={t("range.values")}>
        <SelectPropertyRow
          label={t("range.scaleMode")}
          onChange={(mode) => void changeScaleMode(mode)}
          options={SCALE_MODES.map((mode) => ({
            label: t(`range.scaleModes.${mode}`),
            value: mode,
          }))}
          value={range.scaleDefinition.mode}
        />
        <SelectPropertyRow
          label={t("range.valueDirection")}
          onChange={changeValueDirection}
          options={VALUE_DIRECTIONS.map((direction) => ({
            label: t(`range.valueDirections.${direction}`),
            value: direction,
          }))}
          value={range.valueDirection}
        />
        {range.scaleDefinition.mode === "logarithmic" ? (
          <SelectPropertyRow
            label={t("range.logarithmicDetailEmphasis")}
            onChange={changeLogarithmicDetailEmphasis}
            options={LOGARITHMIC_DETAIL_EMPHASES.map((detailEmphasis) => ({
              label: t(`range.logarithmicDetailEmphases.${detailEmphasis}`),
              value: detailEmphasis,
            }))}
            value={range.scaleDefinition.detailEmphasis}
          />
        ) : null}
        {customScaleDefinition ? (
          <CustomScaleEditor
            onChange={(points) =>
              onRangeChange({ scaleDefinition: { ...customScaleDefinition, points } })
            }
            onInteractionEnd={onHistoryTransactionEnd}
            onInteractionStart={onHistoryTransactionStart}
            points={customScaleDefinition.points}
            snapEnabled={snapping.enabled}
            snapValueStep={snapping.distanceMm}
            valueDirection={range.valueDirection}
          />
        ) : (
          scaleDefinitions.map((definition) => (
            <RangePropertyRow
              key={definition.key}
              label={t(`range.${definition.labelKey}`)}
              max={definition.max}
              min={definition.min}
              onChange={updateScale(definition)}
              onInteractionEnd={onHistoryTransactionEnd}
              onInteractionStart={onHistoryTransactionStart}
              step={definition.step}
              suffix=""
              value={String(definition.value)}
            />
          ))
        )}
      </PropertyGroup>
    </>
  );
}

const SCALE_MODES = ["linear", "logarithmic", "custom"] as const satisfies readonly ScaleMode[];
const VALUE_DIRECTIONS = ["ascending", "descending"] as const satisfies readonly ValueDirection[];
const LOGARITHMIC_DETAIL_EMPHASES = [
  "low-values",
  "high-values",
] as const satisfies readonly LogarithmicDetailEmphasis[];

function isScaleMode(value: string): value is ScaleMode {
  return SCALE_MODES.some((mode) => mode === value);
}

function isValueDirection(value: string): value is ValueDirection {
  return VALUE_DIRECTIONS.some((direction) => direction === value);
}

function isLogarithmicDetailEmphasis(value: string): value is LogarithmicDetailEmphasis {
  return LOGARITHMIC_DETAIL_EMPHASES.some((detailEmphasis) => detailEmphasis === value);
}
