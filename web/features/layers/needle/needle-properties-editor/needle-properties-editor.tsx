"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import {
  getNeedleNumericPropertyDefinitions,
  type NeedleNumericPropertyDefinition,
} from "@/features/layers/needle/needle-properties";
import type {
  LayerDto,
  NeedleLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

type NeedlePropertiesEditorProps = {
  layer: NeedleLayerDto;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  ranges: RangeDto[];
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function NeedlePropertiesEditor({
  layer,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  ranges,
  snapping,
}: NeedlePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getNeedleNumericPropertyDefinitions(
    layer,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const fields = (group: NeedleNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`needle.${definition.labelKey}`)}
      getSuffix={(definition) =>
        definition.unit === "none" ? "" : t(`controls.${definition.unit}`)
      }
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) => {
        if (key === "value") return onLayerChange({ value } as Partial<NeedleLayerDto>);
        if (key === "hubRadiusMm")
          return onLayerChange({
            hub: { ...layer.hub, radiusMm: value },
          } as Partial<NeedleLayerDto>);
        onLayerChange({ shaft: { ...layer.shaft, [key]: value } } as Partial<NeedleLayerDto>);
      }}
      snapping={snapping}
    />
  );
  const colorProps = {
    onInteractionEnd: onHistoryTransactionEnd,
    onInteractionStart: onHistoryTransactionStart,
  };
  return (
    <>
      <PropertyGroup title={t("needle.groups.value")}>{fields("value")}</PropertyGroup>
      <PropertyGroup title={t("needle.groups.shaft")}>
        {fields("shaft")}
        <SelectPropertyRow
          label={t("needle.tipStyle")}
          onChange={(tipStyle) =>
            onLayerChange({ shaft: { ...layer.shaft, tipStyle } } as Partial<NeedleLayerDto>)
          }
          options={(["flat", "rounded", "arrowhead", "pointed", "tapered-rounded"] as const).map(
            (value) => ({
              label: t(`needle.tipStyles.${value}`),
              value,
            }),
          )}
          value={layer.shaft.tipStyle}
        />
        <ColorPropertyRow
          {...colorProps}
          label={t("needle.shaftColor")}
          onChange={(color) =>
            onLayerChange({ shaft: { ...layer.shaft, color } } as Partial<NeedleLayerDto>)
          }
          value={layer.shaft.color}
        />
        <ColorPropertyRow
          {...colorProps}
          label={t("needle.tailColor")}
          onChange={(tailColor) =>
            onLayerChange({ shaft: { ...layer.shaft, tailColor } } as Partial<NeedleLayerDto>)
          }
          value={layer.shaft.tailColor}
        />
      </PropertyGroup>
      <PropertyGroup title={t("needle.groups.hub")}>
        <BooleanPropertyRow
          checked={layer.hub.visible}
          label={t("needle.hubVisible")}
          onChange={(visible) =>
            onLayerChange({ hub: { ...layer.hub, visible } } as Partial<NeedleLayerDto>)
          }
        />
        {fields("hub")}
        <ColorPropertyRow
          {...colorProps}
          disabled={!layer.hub.visible}
          label={t("needle.hubColor")}
          onChange={(color) =>
            onLayerChange({ hub: { ...layer.hub, color } } as Partial<NeedleLayerDto>)
          }
          value={layer.hub.color}
        />
        <SelectPropertyRow
          label={t("needle.hubPlacement")}
          onChange={(placement) =>
            onLayerChange({ hub: { ...layer.hub, placement } } as Partial<NeedleLayerDto>)
          }
          options={(["front", "behind"] as const).map((value) => ({
            label: t(`needle.hubPlacements.${value}`),
            value,
          }))}
          value={layer.hub.placement}
        />
      </PropertyGroup>
    </>
  );
}
