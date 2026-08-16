"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import {
  PropertyGroup,
  TextPropertyRow,
} from "@/features/editor/property-controls/property-controls";
import { NumericScalePropertiesEditor } from "@/features/layers/numeric-scale/numeric-scale-properties-editor/numeric-scale-properties-editor";
import { TickScalePropertiesEditor } from "@/features/layers/tick-scale/tick-scale-properties-editor/tick-scale-properties-editor";
import {
  LAYER_TYPE,
  type LayerDto,
  type LayerType,
  type NumericScaleLayerDto,
  type RangeDto,
  type TickScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

type LayerPropertiesProps = {
  layer: LayerDto;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onLayerRangeChange: (rangeId: string) => void;
  onNameChange: (value: string) => void;
  ranges: RangeDto[];
  selectedName: string;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

const LAYER_PROPERTY_EDITORS = {
  [LAYER_TYPE.tickScale]: (props) => (
    <TickScalePropertiesEditor {...props} layer={props.layer as TickScaleLayerDto} />
  ),
  [LAYER_TYPE.numericScale]: (props) => (
    <NumericScalePropertiesEditor {...props} layer={props.layer as NumericScaleLayerDto} />
  ),
} satisfies Record<LayerType, (props: LayerPropertiesProps) => ReactNode>;

export function LayerProperties(props: LayerPropertiesProps) {
  const t = useTranslations("Editor");
  const Editor = LAYER_PROPERTY_EDITORS[props.layer.type];
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
          onChange={props.onNameChange}
          onInteractionEnd={props.onHistoryTransactionEnd}
          onInteractionStart={props.onHistoryTransactionStart}
          value={props.selectedName}
        />
        <SelectPropertyRow
          label={t("layers.rangeSource")}
          onChange={props.onLayerRangeChange}
          options={props.ranges.map((range) => ({ label: range.name, value: range.id }))}
          value={props.layer.rangeId}
        />
      </PropertyGroup>
      <Editor {...props} />
    </>
  );
}
