import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";

type EditingOverlayGeometryProps = {
  displayScale: number;
  primitives: readonly EditingOverlayPrimitive[];
};

export function EditingOverlayGeometry({ displayScale, primitives }: EditingOverlayGeometryProps) {
  return primitives.map((primitive) => {
    const sharedProps = {
      className: primitive.tone === "accent" ? "text-accent" : "text-muted",
      "data-testid": primitive.id,
      pointerEvents: "none" as const,
      stroke: "currentColor",
      strokeDasharray: scaleDasharray(primitive.dasharray, displayScale),
      strokeWidth: primitive.strokeWidth * displayScale,
    };

    if (primitive.kind === "path")
      return (
        <path
          {...sharedProps}
          data-overlay-segment={primitive.segment}
          d={primitive.d}
          fill="none"
          key={primitive.id}
        />
      );

    return (
      <line
        {...sharedProps}
        key={primitive.id}
        x1={primitive.start.x}
        x2={primitive.end.x}
        y1={primitive.start.y}
        y2={primitive.end.y}
      />
    );
  });
}

function scaleDasharray(dasharray: string, displayScale: number): string {
  return dasharray
    .split(/\s+/)
    .map((value) => String(Number(value) * displayScale))
    .join(" ");
}
