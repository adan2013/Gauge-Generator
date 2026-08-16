"use client";

import { useTranslations } from "next-intl";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import {
  PropertyGroup,
  RangePropertyRow,
} from "@/features/editor/property-controls/property-controls";
import {
  getTickScaleColorPropertyDefinition,
  getTickScaleNumericPropertyDefinitions,
  type TickScaleNumericPropertyDefinition,
} from "@/features/layers/tick-scale/tick-scale-properties";
import type {
  LayerDto,
  RangeDto,
  TickScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

export type TickScalePropertiesEditorProps = {
  layer: TickScaleLayerDto;
  ranges: RangeDto[];
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function TickScalePropertiesEditor({
  layer,
  ranges,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  snapping,
}: TickScalePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getTickScaleNumericPropertyDefinitions(
    layer,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const color = getTickScaleColorPropertyDefinition(layer);
  const update = (definition: TickScaleNumericPropertyDefinition) => (value: string) => {
    const raw = Number(value);
    const increment = definition.snap === "angle" ? snapping.angleDegrees : snapping.distanceMm;
    const next =
      snapping.enabled && definition.snap !== "none"
        ? Math.round(raw / increment) * increment
        : raw;
    onLayerChange({
      [definition.key]: Math.min(definition.max, Math.max(definition.min, next)),
    } as Partial<TickScaleLayerDto>);
  };
  const fields = (group: TickScaleNumericPropertyDefinition["group"]) =>
    definitions
      .filter((definition) => definition.group === group)
      .map((definition) => (
        <RangePropertyRow
          key={definition.key}
          label={t(`tickScale.${definition.labelKey}`)}
          max={definition.max}
          min={definition.min}
          onChange={update(definition)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          step={definition.step}
          suffix={definition.unit === "none" ? "" : t(`controls.${definition.unit}`)}
          value={String(definition.value)}
        />
      ));
  return (
    <>
      <PropertyGroup title={t("tickScale.range")}>{fields("range")}</PropertyGroup>
      <PropertyGroup title={t("tickScale.geometry")}>{fields("geometry")}</PropertyGroup>
      <PropertyGroup title={t("tickScale.ticks")}>
        {fields("ticks")}
        <ColorPropertyRow
          label={t(`tickScale.${color.labelKey}`)}
          onChange={(value) => onLayerChange({ color: value })}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={color.value}
        />
      </PropertyGroup>
    </>
  );
}
