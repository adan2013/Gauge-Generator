"use client";

import { useTranslations } from "next-intl";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import {
  PropertyGroup,
  TextPropertyRow,
} from "@/features/editor/property-controls/property-controls";
import { TextStylePropertiesEditor } from "@/features/layers/core/text-style/text-style-properties-editor/text-style-properties-editor";
import { getTextStyleSizePropertyDefinition } from "@/features/layers/core/text-style/text-style-properties";
import { LABEL_LIMITS } from "@/features/layers/label/label-limits";
import {
  createPointLabelLayout,
  createTextArcLabelLayout,
} from "@/features/layers/label/label-layout-factories";
import {
  getLabelPointPropertyDefinitions,
  getLabelTextArcPropertyDefinitions,
} from "@/features/layers/label/label-properties";
import type {
  CanvasDto,
  LabelLayerDto,
  LayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

type LabelPropertiesEditorProps = {
  canvas: CanvasDto;
  layer: LabelLayerDto;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  ranges: RangeDto[];
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function LabelPropertiesEditor({
  canvas,
  layer,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  ranges,
  snapping,
}: LabelPropertiesEditorProps) {
  const t = useTranslations("Editor");
  const range = ranges.find((candidate) => candidate.id === layer.rangeId);
  function changeLayoutMode(mode: string) {
    if (mode === layer.layout.mode) return;
    if (mode === "point") {
      onLayerChange({ layout: createPointLabelLayout() } as Partial<LabelLayerDto>);
      return;
    }
    onLayerChange({ layout: createTextArcLabelLayout(range) } as Partial<LabelLayerDto>);
  }
  return (
    <>
      <PropertyGroup title={t("label.content")}>
        <TextPropertyRow
          label={t("label.text")}
          maxLength={LABEL_LIMITS.textLength.max}
          onChange={(text) => onLayerChange({ text } as Partial<LabelLayerDto>)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={layer.text}
        />
      </PropertyGroup>
      <PropertyGroup title={t("label.layout")}>
        <SelectPropertyRow
          label={t("label.layoutMode")}
          onChange={changeLayoutMode}
          options={[
            { label: t("label.layoutModes.point"), value: "point" },
            { label: t("label.layoutModes.textArc"), value: "text-arc" },
          ]}
          value={layer.layout.mode}
        />
        {layer.layout.mode === "point" ? (
          <NumericPropertyFields
            definitions={getLabelPointPropertyDefinitions(layer.layout, canvas, range)}
            getLabel={(definition) => t(`label.${definition.labelKey}`)}
            getSuffix={(definition) => t(`controls.${definition.unit}`)}
            group="point"
            onInteractionEnd={onHistoryTransactionEnd}
            onInteractionStart={onHistoryTransactionStart}
            onValueChange={(key, value) =>
              onLayerChange({
                layout: { ...layer.layout, [key]: value },
              } as Partial<LabelLayerDto>)
            }
            snapping={snapping}
          />
        ) : (
          <>
            <NumericPropertyFields
              definitions={getLabelTextArcPropertyDefinitions(layer.layout, range)}
              getLabel={(definition) => t(`label.${definition.labelKey}`)}
              getSuffix={(definition) =>
                definition.unit === "none" ? "" : t(`controls.${definition.unit}`)
              }
              group="textArc"
              onInteractionEnd={onHistoryTransactionEnd}
              onInteractionStart={onHistoryTransactionStart}
              onValueChange={(key, value) =>
                onLayerChange({
                  layout: { ...layer.layout, [key]: value },
                } as Partial<LabelLayerDto>)
              }
              snapping={snapping}
            />
            <SelectPropertyRow
              label={t("label.alignment")}
              onChange={(alignment) =>
                onLayerChange({
                  layout: { ...layer.layout, alignment },
                } as Partial<LabelLayerDto>)
              }
              options={(["start", "center", "end"] as const).map((value) => ({
                label: t(`label.alignments.${value}`),
                value,
              }))}
              value={layer.layout.alignment}
            />
            <SelectPropertyRow
              label={t("label.direction")}
              onChange={(direction) =>
                onLayerChange({
                  layout: { ...layer.layout, direction },
                } as Partial<LabelLayerDto>)
              }
              options={(["forward", "reverse"] as const).map((value) => ({
                label: t(`label.directions.${value}`),
                value,
              }))}
              value={layer.layout.direction}
            />
          </>
        )}
      </PropertyGroup>
      <PropertyGroup title={t("textStyle.title")}>
        <TextStylePropertiesEditor
          definition={getTextStyleSizePropertyDefinition(layer.textStyle.sizeMm)}
          onChange={(textStyle) => onLayerChange({ textStyle } as Partial<LabelLayerDto>)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          snapping={snapping}
          style={layer.textStyle}
        />
      </PropertyGroup>
    </>
  );
}
