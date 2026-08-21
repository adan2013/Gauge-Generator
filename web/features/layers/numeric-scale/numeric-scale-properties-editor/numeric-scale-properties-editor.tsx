"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import { TextStylePropertiesEditor } from "@/features/layers/core/text-style/text-style-properties-editor/text-style-properties-editor";
import { getTextStyleSizePropertyDefinition } from "@/features/layers/core/text-style/text-style-properties";
import {
  getNumericScaleNumericPropertyDefinitions,
  type NumericScaleNumericPropertyDefinition,
} from "@/features/layers/numeric-scale/numeric-scale-properties";
import { getNumericScaleGeometryBounds } from "@/features/layers/numeric-scale/numeric-scale-constraints";
import type {
  LayerDto,
  NumericScaleLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

export type NumericScalePropertiesEditorProps = {
  layer: NumericScaleLayerDto;
  ranges: RangeDto[];
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function NumericScalePropertiesEditor({
  layer,
  ranges,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  snapping,
}: NumericScalePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const range = ranges.find((candidate) => candidate.id === layer.rangeId);
  const definitions = getNumericScaleNumericPropertyDefinitions(layer, range);
  const geometry = range ? getNumericScaleGeometryBounds(layer, range) : undefined;
  const fields = (group: NumericScaleNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`numericScale.${definition.labelKey}`)}
      getSuffix={(definition) =>
        definition.unit === "none" ? "" : t(`controls.${definition.unit}`)
      }
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) =>
        onLayerChange({ [key]: value } as Partial<NumericScaleLayerDto>)
      }
      snapping={snapping}
    />
  );
  return (
    <>
      <PropertyGroup title={t("numericScale.range")}>{fields("range")}</PropertyGroup>
      <PropertyGroup title={t("numericScale.geometry")}>{fields("geometry")}</PropertyGroup>
      <PropertyGroup title={t("numericScale.font")}>
        <TextStylePropertiesEditor
          definition={getTextStyleSizePropertyDefinition(
            layer.textStyle.sizeMm,
            geometry?.maxFontSizeMm,
          )}
          onChange={(textStyle) => onLayerChange({ textStyle } as Partial<NumericScaleLayerDto>)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          snapping={snapping}
          style={layer.textStyle}
        />
        <BooleanPropertyRow
          checked={layer.rotated}
          label={t("numericScale.rotated")}
          onChange={(rotated) => onLayerChange({ rotated } as Partial<NumericScaleLayerDto>)}
        />
      </PropertyGroup>
    </>
  );
}
