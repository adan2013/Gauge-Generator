"use client";

import { useRef, type PointerEvent } from "react";
import type { CanvasDto } from "@/features/project/project-dto/project-dto";
import type { LayerHandle, PointerInput } from "@/features/layers/core/layer";

type LayerHandlesProps = {
  canvas: CanvasDto;
  displayScale: number;
  handles: LayerHandle[];
  getLabel: (handle: LayerHandle) => string;
  onHandleChange: (handleId: string, input: PointerInput) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
};

const handleRadiusMm = 1.6;
const labelGapMm = 2.5;
const labelHorizontalPaddingMm = 0.6;
const labelCharacterWidthMm = 1.8;

export function LayerHandles({
  canvas,
  displayScale,
  getLabel,
  handles,
  onHandleChange,
  onInteractionEnd,
  onInteractionStart,
}: LayerHandlesProps) {
  const activePointerIds = useRef(new Set<number>());

  function toPointerInput(event: PointerEvent<SVGCircleElement>): PointerInput | null {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return null;
    return {
      point: {
        x: ((event.clientX - bounds.left) / bounds.width) * canvas.widthMm,
        y: ((event.clientY - bounds.top) / bounds.height) * canvas.heightMm,
      },
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    };
  }

  function handlePointerDown(event: PointerEvent<SVGCircleElement>, handleId: string) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    activePointerIds.current.add(event.pointerId);
    onInteractionStart();
    const input = toPointerInput(event);
    if (input) onHandleChange(handleId, input);
  }

  function handlePointerMove(event: PointerEvent<SVGCircleElement>, handleId: string) {
    if (!activePointerIds.current.has(event.pointerId)) return;
    const input = toPointerInput(event);
    if (input) onHandleChange(handleId, input);
  }

  function handlePointerEnd(event: PointerEvent<SVGCircleElement>) {
    if (!activePointerIds.current.delete(event.pointerId)) return;
    onInteractionEnd();
  }

  return handles.map((handle) => (
    <g key={handle.id}>
      <circle
        aria-label={handle.label}
        cx={handle.point.x}
        cy={handle.point.y}
        fill="white"
        onPointerDown={(event) => handlePointerDown(event, handle.id)}
        onPointerMove={(event) => handlePointerMove(event, handle.id)}
        onLostPointerCapture={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerUp={handlePointerEnd}
        r={handleRadiusMm * displayScale}
        stroke="currentColor"
        strokeWidth={0.4 * displayScale}
        className="cursor-grab text-accent active:cursor-grabbing"
      />
      <HandleLabel
        canvasWidth={canvas.widthMm}
        displayScale={displayScale}
        point={handle.point}
        value={getLabel(handle)}
      />
    </g>
  ));
}

function HandleLabel({
  canvasWidth,
  displayScale,
  point,
  value,
}: {
  canvasWidth: number;
  displayScale: number;
  point: { x: number; y: number };
  value: string;
}) {
  const textWidth = value.length * labelCharacterWidthMm * displayScale;
  const horizontalPadding = labelHorizontalPaddingMm * displayScale;
  const width = textWidth + horizontalPadding * 2;
  const labelGap = labelGapMm * displayScale;
  const rightSideX = point.x + labelGap - horizontalPadding;
  const backgroundX = rightSideX + width <= canvasWidth ? rightSideX : point.x - labelGap - width;
  const textX = backgroundX + horizontalPadding;
  const textY = point.y - labelGap;
  return (
    <g pointerEvents="none">
      <rect
        data-testid="layer-handle-label-background"
        fill="white"
        height={4 * displayScale}
        rx={0.6 * displayScale}
        width={width}
        x={backgroundX}
        y={textY - 3 * displayScale}
      />
      <text
        fill="currentColor"
        fontFamily="Courier New, monospace"
        fontSize={3 * displayScale}
        x={textX}
        y={textY}
        className="text-muted"
      >
        {value}
      </text>
    </g>
  );
}
