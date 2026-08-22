"use client";

import { useTranslations } from "next-intl";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import { IconBrowser } from "@/features/layers/icon/icon-browser/icon-browser";
import {
  getIconNumericPropertyDefinitions,
  type IconNumericPropertyDefinition,
} from "@/features/layers/icon/icon-properties";
import type {
  CanvasDto,
  IconLayerDto,
  LayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

type IconPropertiesEditorProps = {
  canvas: CanvasDto;
  layer: IconLayerDto;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  ranges: RangeDto[];
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function IconPropertiesEditor({
  canvas,
  layer,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  ranges,
  snapping,
}: IconPropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getIconNumericPropertyDefinitions(
    layer,
    canvas,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const fields = (group: IconNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`icon.${definition.labelKey}`)}
      getSuffix={(definition) => t(`controls.${definition.unit}`)}
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) => {
        if (key === "strokeWidthMm")
          return onLayerChange({
            style: { ...layer.style, strokeWidthMm: value },
          } as Partial<IconLayerDto>);
        onLayerChange({
          geometry: { ...layer.geometry, [key]: value },
        } as Partial<IconLayerDto>);
      }}
      snapping={snapping}
    />
  );
  return (
    <>
      <PropertyGroup title={t("icon.groups.icon")}>
        <IconBrowser
          emptyHint={t("icon.browser.emptyHint")}
          noResultsLabel={t("icon.browser.noResults")}
          onChange={(name) => onLayerChange({ icon: { library: "lucide", name } })}
          poweredByLabel={t("icon.browser.poweredBy")}
          searchAriaLabel={t("icon.browser.searchAriaLabel")}
          searchPlaceholder={t("icon.browser.searchPlaceholder")}
          selectedName={layer.icon.name}
        />
      </PropertyGroup>
      <PropertyGroup title={t("icon.groups.position")}>{fields("position")}</PropertyGroup>
      <PropertyGroup title={t("icon.groups.geometry")}>{fields("size")}</PropertyGroup>
      <PropertyGroup title={t("icon.groups.appearance")}>
        {fields("appearance")}
        <ColorPropertyRow
          label={t("icon.color")}
          onChange={(color) =>
            onLayerChange({ style: { ...layer.style, color } } as Partial<IconLayerDto>)
          }
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={layer.style.color}
        />
      </PropertyGroup>
    </>
  );
}
