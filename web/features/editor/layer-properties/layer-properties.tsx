"use client";

import { useTranslations } from "next-intl";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import {
  PropertyGroup,
  TextPropertyRow,
} from "@/features/editor/property-controls/property-controls";
import { NumericScalePropertiesEditor } from "@/features/layers/numeric-scale/numeric-scale-properties-editor/numeric-scale-properties-editor";
import { TickScalePropertiesEditor } from "@/features/layers/tick-scale/tick-scale-properties-editor/tick-scale-properties-editor";
import { LabelPropertiesEditor } from "@/features/layers/label/label-properties-editor/label-properties-editor";
import { ArcPropertiesEditor } from "@/features/layers/arc/arc-properties-editor/arc-properties-editor";
import { NeedlePropertiesEditor } from "@/features/layers/needle/needle-properties-editor/needle-properties-editor";
import { PlanarShapePropertiesEditor } from "@/features/layers/planar-shape/planar-shape-properties-editor/planar-shape-properties-editor";
import { LinePropertiesEditor } from "@/features/layers/line/line-properties-editor/line-properties-editor";
import { IconPropertiesEditor } from "@/features/layers/icon/icon-properties-editor/icon-properties-editor";
import {
  LAYER_TYPE,
  type CanvasDto,
  type LayerDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";

type LayerPropertiesProps = {
  canvas: CanvasDto;
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

export function LayerProperties(props: LayerPropertiesProps) {
  const t = useTranslations("Editor");
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
      <LayerSpecificProperties {...props} />
    </>
  );
}

function LayerSpecificProperties(props: LayerPropertiesProps) {
  switch (props.layer.type) {
    case LAYER_TYPE.tickScale:
      return <TickScalePropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.numericScale:
      return <NumericScalePropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.label:
      return <LabelPropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.arc:
      return <ArcPropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.needle:
      return <NeedlePropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.ellipse:
    case LAYER_TYPE.rectangle:
      return <PlanarShapePropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.line:
      return <LinePropertiesEditor {...props} layer={props.layer} />;
    case LAYER_TYPE.icon:
      return <IconPropertiesEditor {...props} layer={props.layer} />;
    default:
      return assertNever(props.layer);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer: ${JSON.stringify(value)}`);
}
