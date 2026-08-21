"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import {
  getArcNumericPropertyDefinitions,
  type ArcNumericPropertyDefinition,
} from "@/features/layers/arc/arc-properties";
import type { ArcLayerDto, LayerDto, RangeDto } from "@/features/project/project-dto/project-dto";

export type ArcPropertiesEditorProps = {
  layer: ArcLayerDto;
  ranges: RangeDto[];
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function ArcPropertiesEditor({
  layer,
  ranges,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  snapping,
}: ArcPropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getArcNumericPropertyDefinitions(
    layer,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const fields = (group: ArcNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`arc.${definition.labelKey}`)}
      getSuffix={(definition) =>
        definition.unit === "none" ? "" : t(`controls.${definition.unit}`)
      }
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) => onLayerChange({ [key]: value } as Partial<ArcLayerDto>)}
      snapping={snapping}
    />
  );

  return (
    <>
      <PropertyGroup title={t("arc.range")}>{fields("range")}</PropertyGroup>
      <PropertyGroup title={t("arc.appearance")}>
        {fields("geometry")}
        <BooleanPropertyRow
          checked={layer.roundedEnds}
          label={t("arc.roundedEnds")}
          onChange={(roundedEnds) => onLayerChange({ roundedEnds } as Partial<ArcLayerDto>)}
        />
        <ColorPropertyRow
          label={t("arc.color")}
          onChange={(color) => onLayerChange({ color } as Partial<ArcLayerDto>)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={layer.color}
        />
      </PropertyGroup>
    </>
  );
}
