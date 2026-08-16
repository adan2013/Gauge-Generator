"use client";

import type { PointerEvent } from "react";
import type { CanvasDto } from "@/features/project/project-dto/project-dto";
import type { LayerHandle, PointerInput } from "@/features/layers/core/layer";

type LayerHandlesProps = {
  canvas: CanvasDto;
  handles: LayerHandle[];
  getLabel: (handle: LayerHandle) => string;
  onHandleChange: (handleId: string, input: PointerInput) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
};

const handleRadiusMm = 1.6;

export function LayerHandles({
  canvas,
  getLabel,
  handles,
  onHandleChange,
  onInteractionEnd,
  onInteractionStart,
}: LayerHandlesProps) {
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
    onInteractionStart();
    const input = toPointerInput(event);
    if (input) onHandleChange(handleId, input);
  }

  function handlePointerMove(event: PointerEvent<SVGCircleElement>, handleId: string) {
    if (
      event.currentTarget.hasPointerCapture &&
      !event.currentTarget.hasPointerCapture(event.pointerId)
    )
      return;
    const input = toPointerInput(event);
    if (input) onHandleChange(handleId, input);
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
        onPointerUp={onInteractionEnd}
        r={handleRadiusMm}
        stroke="currentColor"
        strokeWidth="0.4"
        className="cursor-grab text-accent active:cursor-grabbing"
      />
      <HandleLabel point={handle.point} value={getLabel(handle)} />
    </g>
  ));
}

function HandleLabel({ point, value }: { point: { x: number; y: number }; value: string }) {
  const x = point.x + 2.5;
  const y = point.y - 2.5;
  const width = value.length * 1.7 + 1.2;
  return (
    <g pointerEvents="none">
      <rect
        data-testid="layer-handle-label-background"
        fill="white"
        height="4"
        rx="0.6"
        width={width}
        x={x - 0.6}
        y={y - 3}
      />
      <text fill="currentColor" fontSize="3" x={x} y={y} className="text-muted">
        {value}
      </text>
    </g>
  );
}
