"use client";

import { useTranslations } from "next-intl";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { EditingOverlayGeometry } from "@/features/layers/core/editing-overlay-geometry/editing-overlay-geometry";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { Range } from "@/features/ranges/range/range";
import type { CanvasDto, RangeDto } from "@/features/project/project-dto/project-dto";

type RangeEditingOverlayProps = {
  canvas: CanvasDto;
  displayScale: number;
  range: RangeDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onRangeChange: (nextRange: RangeDto) => void;
};

export function RangeEditingOverlay({
  canvas,
  displayScale,
  onInteractionEnd,
  onInteractionStart,
  onRangeChange,
  range,
  snapping,
}: RangeEditingOverlayProps) {
  const t = useTranslations("Editor.range");
  const rangeModel = new Range(range);
  const handles = rangeModel.getHandles();

  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="range-editing-overlay">
      <EditingOverlayGeometry
        displayScale={displayScale}
        primitives={rangeModel.getEditingOverlay()}
      />
      <LayerHandles
        canvas={canvas}
        displayScale={displayScale}
        getLabel={(handle) =>
          t(`handleValues.${handle.id}`, {
            radius: formatValue(range.radius),
            start: formatValue(range.angleStart),
            opening: formatValue(range.openingAngle),
            x: formatValue(range.centerX),
            y: formatValue(range.centerY),
          })
        }
        handles={handles.map((handle) => ({ ...handle, label: t(`handles.${handle.id}`) }))}
        onHandleChange={(handleId, input) =>
          onRangeChange(
            rangeModel.applyHandleDrag(
              handleId,
              {
                ...input,
                snapAngleDegrees: snapping.enabled
                  ? snapping.angleDegrees
                  : OVERLAY_INTEGER_INCREMENT,
                snapDistanceMm: snapping.enabled ? snapping.distanceMm : OVERLAY_INTEGER_INCREMENT,
              },
              canvas,
            ),
          )
        }
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
      />
    </g>
  );
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
