type EditingOverlayPrimitiveBase = {
  dasharray: string;
  id: string;
  segment?: "active" | "inactive";
  strokeWidth: number;
  tone: "accent" | "muted";
};

export type EditingOverlayPrimitive =
  | (EditingOverlayPrimitiveBase & {
      d: string;
      kind: "path";
    })
  | (EditingOverlayPrimitiveBase & {
      end: CanvasPointMm;
      kind: "line";
      start: CanvasPointMm;
    });

type CanvasPointMm = { x: number; y: number };
