"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { LayerEditorControls } from "@/features/editor/layer-editor-controls/layer-editor-controls";
import { LayerProperties } from "@/features/editor/layer-properties/layer-properties";
import { LayerTypePicker } from "@/features/editor/layer-type-picker/layer-type-picker";
import { RangePropertiesEditor } from "@/features/layers/range/range-properties-editor/range-properties-editor";
import type {
  CanvasDto,
  LayerDto,
  LayerType,
  RangeDto,
} from "@/features/project/project-dto/project-dto";
import type { EditorSelection, LayerPreviewModifiers } from "@/store/editor-slice";

export type PropertiesPanelProps = {
  canvas: CanvasDto;
  layerPreviewModifiers: LayerPreviewModifiers;
  onBack: () => void;
  onCreateLayer: (type: LayerType) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onLayerPreviewModifiersChange: (modifiers: LayerPreviewModifiers) => void;
  onLayerRangeChange: (rangeId: string) => void;
  onNameChange: (value: string) => void;
  onRangeChange: (change: Partial<RangeDto>) => void;
  onResetLayer: () => void;
  ranges: RangeDto[];
  selectedLayer: LayerDto | undefined;
  selectedName: string;
  selectedObject: EditorSelection;
  selectedRange: RangeDto | undefined;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function PropertiesPanel({
  canvas,
  layerPreviewModifiers,
  onBack,
  onCreateLayer,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  onLayerChange,
  onLayerPreviewModifiersChange,
  onLayerRangeChange,
  onNameChange,
  onRangeChange,
  onResetLayer,
  ranges,
  selectedLayer,
  selectedName,
  selectedObject,
  selectedRange,
  snapping,
}: PropertiesPanelProps) {
  const t = useTranslations("Editor");
  const isRange = selectedObject?.collection !== "layers";
  return (
    <section
      aria-label={isRange ? t("range.ariaLabel") : t("layers.propertiesAriaLabel")}
      className="flex h-full w-1/3 flex-col"
    >
      <div className="border-b border-border p-2">
        <ActionButton
          className="w-full justify-start"
          icon={ChevronLeft}
          label={t("controls.backToLayers")}
          onClick={onBack}
          variant="quiet"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {!selectedObject ? (
          <LayerTypePicker onCreateLayer={onCreateLayer} />
        ) : isRange && selectedRange ? (
          <RangePropertiesEditor
            canvas={canvas}
            onHistoryTransactionEnd={onHistoryTransactionEnd}
            onHistoryTransactionStart={onHistoryTransactionStart}
            onNameChange={onNameChange}
            onRangeChange={onRangeChange}
            range={selectedRange}
            selectedName={selectedName}
            snapping={snapping}
          />
        ) : selectedLayer ? (
          <LayerProperties
            layer={selectedLayer}
            onHistoryTransactionEnd={onHistoryTransactionEnd}
            onHistoryTransactionStart={onHistoryTransactionStart}
            onLayerChange={onLayerChange}
            onLayerRangeChange={onLayerRangeChange}
            onNameChange={onNameChange}
            ranges={ranges}
            selectedName={selectedName}
            snapping={snapping}
          />
        ) : null}
      </div>
      {selectedLayer ? (
        <LayerEditorControls
          modifiers={layerPreviewModifiers}
          onModifiersChange={onLayerPreviewModifiersChange}
          onReset={onResetLayer}
        />
      ) : null}
    </section>
  );
}
