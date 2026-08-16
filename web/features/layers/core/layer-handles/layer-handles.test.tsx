import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LayerHandles } from "./layer-handles";

describe("LayerHandles", () => {
  it("renders labeled handles and delegates a pointer interaction in canvas millimetres", () => {
    const onHandleChange = vi.fn();
    const onInteractionStart = vi.fn();
    render(
      <svg>
        <LayerHandles
          canvas={{
            widthMm: 120,
            heightMm: 120,
            background: "#FFFFFF",
            transparentBackground: true,
          }}
          getLabel={() => "Radius"}
          handles={[
            { id: "radius", kind: "radius", label: "Adjust radius", point: { x: 40, y: 60 } },
          ]}
          onHandleChange={onHandleChange}
          onInteractionEnd={() => undefined}
          onInteractionStart={onInteractionStart}
        />
      </svg>,
    );
    const handle = screen.getByLabelText("Adjust radius") as unknown as SVGCircleElement;
    Object.defineProperty(handle.ownerSVGElement, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 240, height: 120 }),
    });

    fireEvent(handle, new MouseEvent("pointerdown", { bubbles: true, clientX: 120, clientY: 60 }));

    expect(onInteractionStart).toHaveBeenCalledOnce();
    expect(onHandleChange).toHaveBeenCalledWith(
      "radius",
      expect.objectContaining({ point: { x: 60, y: 60 } }),
    );
    expect(screen.getByTestId("layer-handle-label-background")).toBeTruthy();
  });
});
