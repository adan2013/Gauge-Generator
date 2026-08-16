"use client";

import { useTranslations } from "next-intl";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { Range } from "@/features/layers/range/range";
import type { CanvasDto, RangeDto } from "@/features/project/project-dto/project-dto";

type RangeEditingOverlayProps = {
  canvas: CanvasDto;
  range: RangeDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onRangeChange: (nextRange: RangeDto) => void;
};

export function RangeEditingOverlay({
  canvas,
  onInteractionEnd,
  onInteractionStart,
  onRangeChange,
  range,
  snapping,
}: RangeEditingOverlayProps) {
  const t = useTranslations("Editor.range");
  const rangeModel = new Range(range);
  const handles = rangeModel.getHandles();
  const start = handles.find((handle) => handle.id === "angle-start")!.point;
  const end = handles.find((handle) => handle.id === "angle-end")!.point;
  const radius = handles.find((handle) => handle.id === "radius")!.point;
  const largeArc = Math.abs(range.openingAngle) > 180 ? 1 : 0;
  const sweep = range.openingAngle >= 0 ? 1 : 0;
  const arcPath = `M ${start.x} ${start.y} A ${range.radius} ${range.radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;

  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="range-editing-overlay">
      <path
        d={arcPath}
        fill="none"
        pointerEvents="none"
        stroke="currentColor"
        strokeDasharray="2 2"
        strokeWidth="0.6"
        className="text-accent"
      />
      <line
        data-testid="range-start-angle-guide"
        pointerEvents="none"
        stroke="currentColor"
        strokeDasharray="1.5 1.5"
        strokeWidth="0.4"
        x1={range.centerX}
        x2={start.x}
        y1={range.centerY}
        y2={start.y}
        className="text-muted"
      />
      <line
        data-testid="range-opening-angle-guide"
        pointerEvents="none"
        stroke="currentColor"
        strokeDasharray="1.5 1.5"
        strokeWidth="0.4"
        x1={range.centerX}
        x2={end.x}
        y1={range.centerY}
        y2={end.y}
        className="text-muted"
      />
      <line
        data-testid="range-radius-guide"
        pointerEvents="none"
        stroke="currentColor"
        strokeDasharray="0.6 1.2"
        strokeWidth="0.5"
        x1={range.centerX}
        x2={radius.x}
        y1={range.centerY}
        y2={radius.y}
        className="text-accent"
      />
      <LayerHandles
        canvas={canvas}
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
                snapAngleDegrees: snapping.enabled ? snapping.angleDegrees : 1,
                snapDistanceMm: snapping.enabled ? snapping.distanceMm : 1,
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
