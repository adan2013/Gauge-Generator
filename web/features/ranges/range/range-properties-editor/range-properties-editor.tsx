"use client";

import { useTranslations } from "next-intl";
import {
  PropertyGroup,
  RangePropertyRow,
  TextPropertyRow,
} from "@/features/editor/property-controls/property-controls";
import {
  getLinearScalePropertyDefinitions,
  getRangeNumericPropertyDefinitions,
  type LinearScalePropertyDefinition,
  type RangeNumericPropertyDefinition,
} from "@/features/ranges/range/range-properties";
import type { CanvasDto, RangeDto } from "@/features/project/project-dto/project-dto";

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
  const numericDefinitions = getRangeNumericPropertyDefinitions(range, canvas);
  const linearDefinitions = getLinearScalePropertyDefinitions(range);
  const updateNumber = (definition: RangeNumericPropertyDefinition) => (value: string) => {
    const increment = definition.snap === "angle" ? snapping.angleDegrees : snapping.distanceMm;
    const raw = Number(value);
    const next = snapping.enabled ? Math.round(raw / increment) * increment : raw;
    onRangeChange({
      [definition.key]: Math.min(definition.max, Math.max(definition.min, next)),
    } as Partial<RangeDto>);
  };
  const updateLinear = (definition: LinearScalePropertyDefinition) => (value: string) => {
    if (range.scaleDefinition.mode === "linear")
      onRangeChange({
        scaleDefinition: { ...range.scaleDefinition, [definition.key]: Number(value) },
      });
  };
  const fields = (group: RangeNumericPropertyDefinition["group"]) =>
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
      <PropertyGroup title={t("range.position")}>{fields("position")}</PropertyGroup>
      <PropertyGroup title={t("range.geometry")}>{fields("geometry")}</PropertyGroup>
      <PropertyGroup title={t("range.values")}>
        {range.scaleDefinition.mode === "linear" ? (
          linearDefinitions.map((definition) => (
            <RangePropertyRow
              key={definition.key}
              label={t(`range.${definition.labelKey}`)}
              max={definition.max}
              min={definition.min}
              onChange={updateLinear(definition)}
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
