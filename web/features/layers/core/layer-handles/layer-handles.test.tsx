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
          displayScale={1}
          getLabel={() => "0 mm"}
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
    expect(Number(screen.getByTestId("layer-handle-label-background").getAttribute("width"))).toBe(
      8.4,
    );
    expect(screen.getByText("0 mm").getAttribute("font-family")).toBe("Courier New, monospace");
  });

  it("places a label to the left of its handle when it would cross the right canvas edge", () => {
    render(
      <svg>
        <LayerHandles
          canvas={{
            widthMm: 120,
            heightMm: 120,
            background: "#FFFFFF",
            transparentBackground: true,
          }}
          displayScale={1}
          getLabel={() => "opening: 260°"}
          handles={[
            {
              id: "angle-end",
              kind: "angle-end",
              label: "Adjust end angle",
              point: { x: 115, y: 60 },
            },
          ]}
          onHandleChange={() => undefined}
          onInteractionEnd={() => undefined}
          onInteractionStart={() => undefined}
        />
      </svg>,
    );

    const label = screen.getByText("opening: 260°");
    const background = screen.getByTestId("layer-handle-label-background");
    const backgroundRightEdge =
      Number(background.getAttribute("x")) + Number(background.getAttribute("width"));

    expect(Number(label.getAttribute("x"))).toBeLessThan(115);
    expect(Number(background.getAttribute("width"))).toBeCloseTo(24.6);
    expect(backgroundRightEdge).toBeLessThanOrEqual(120);
  });

  it("ends a pointer interaction once when capture is cancelled or lost", () => {
    const onInteractionEnd = vi.fn();
    render(
      <svg>
        <LayerHandles
          canvas={{
            widthMm: 120,
            heightMm: 120,
            background: "#FFFFFF",
            transparentBackground: true,
          }}
          displayScale={1}
          getLabel={() => "0 mm"}
          handles={[
            { id: "radius", kind: "radius", label: "Adjust radius", point: { x: 40, y: 60 } },
          ]}
          onHandleChange={() => undefined}
          onInteractionEnd={onInteractionEnd}
          onInteractionStart={() => undefined}
        />
      </svg>,
    );
    const handle = screen.getByLabelText("Adjust radius");

    fireEvent.pointerDown(handle, { pointerId: 7 });
    fireEvent.pointerCancel(handle, { pointerId: 7 });
    fireEvent.lostPointerCapture(handle, { pointerId: 7 });

    expect(onInteractionEnd).toHaveBeenCalledOnce();
  });

  it("compensates handle and label dimensions for a large preview zoom", () => {
    render(
      <svg>
        <LayerHandles
          canvas={{
            widthMm: 30,
            heightMm: 30,
            background: "#FFFFFF",
            transparentBackground: true,
          }}
          displayScale={0.25}
          getLabel={() => "0 mm"}
          handles={[
            { id: "radius", kind: "radius", label: "Adjust radius", point: { x: 15, y: 15 } },
          ]}
          onHandleChange={() => undefined}
          onInteractionEnd={() => undefined}
          onInteractionStart={() => undefined}
        />
      </svg>,
    );

    expect(screen.getByLabelText("Adjust radius").getAttribute("r")).toBe("0.4");
    expect(screen.getByText("0 mm").getAttribute("font-size")).toBe("0.75");
    expect(Number(screen.getByTestId("layer-handle-label-background").getAttribute("width"))).toBe(
      2.1,
    );
  });
});
