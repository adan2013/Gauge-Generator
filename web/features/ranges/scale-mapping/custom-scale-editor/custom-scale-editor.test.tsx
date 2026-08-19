import { useState } from "react";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import type { CustomScalePoint } from "../custom-scale-points";
import { CustomScaleEditor } from "./custom-scale-editor";

const initialPoints = [
  { value: 0, position: 0 },
  { value: 50, position: 0.5 },
  { value: 100, position: 1 },
];

function EditorHarness({
  onInteractionEnd = vi.fn(),
  onInteractionStart = vi.fn(),
  valueDirection = "ascending",
}: {
  onInteractionEnd?: () => void;
  onInteractionStart?: () => void;
  valueDirection?: "ascending" | "descending";
}) {
  const [points, setPoints] = useState<CustomScalePoint[]>(initialPoints);
  return (
    <CustomScaleEditor
      onChange={setPoints}
      onInteractionEnd={onInteractionEnd}
      onInteractionStart={onInteractionStart}
      points={points}
      snapEnabled
      snapValueStep={2}
      valueDirection={valueDirection}
    />
  );
}

describe("CustomScaleEditor", () => {
  it("adds and removes interior points while keeping endpoints locked", () => {
    renderEditor(<EditorHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Add curve point" }));
    expect(screen.getByText("4 points")).toBeTruthy();
    expect(screen.getAllByText("Locked")).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove point" })[0]);
    expect(screen.getByText("3 points")).toBeTruthy();
  });

  it("adds a snapped point with a single graph click", () => {
    renderEditor(<EditorHarness />);

    fireEvent.click(screen.getByRole("group", { name: "Custom scale curve editor" }), {
      clientX: 220,
      clientY: 60,
    });

    expect(screen.getByText("4 points")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Curve point: value 66, position 0.7" }),
    ).toBeTruthy();
  });

  it("edits exact point values and positions while keeping endpoint positions locked", () => {
    renderEditor(<EditorHarness />);

    expect(screen.getByText("0 · Locked")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Curve point: value 50, position 0.5" }));
    const valueInput = screen.getByRole("spinbutton", { name: "Value (X-axis)" });
    const positionInput = screen.getByRole("spinbutton", { name: "Position (Y-axis)" });
    fireEvent.focus(valueInput);
    fireEvent.change(valueInput, { target: { value: "40" } });
    fireEvent.blur(valueInput);
    fireEvent.focus(positionInput);
    fireEvent.change(positionInput, { target: { value: "0.43" } });
    fireEvent.blur(positionInput);

    expect(
      screen.getByRole("button", { name: "Curve point: value 40, position 0.45" }),
    ).toBeTruthy();
  });

  it("uses one interaction lifecycle while dragging an inner point", () => {
    const onInteractionStart = vi.fn();
    const onInteractionEnd = vi.fn();
    renderEditor(
      <EditorHarness onInteractionEnd={onInteractionEnd} onInteractionStart={onInteractionStart} />,
    );
    const graph = screen.getByRole("group", { name: "Custom scale curve editor" });
    const point = screen.getByRole("button", {
      name: "Curve point: value 50, position 0.5",
    });

    fireEvent.pointerDown(point, { pointerId: 1, clientX: 176, clientY: 86 });
    fireEvent.pointerMove(graph, { pointerId: 1, clientX: 220, clientY: 60 });
    fireEvent.pointerUp(graph, { pointerId: 1 });

    expect(onInteractionStart).toHaveBeenCalledOnce();
    expect(onInteractionEnd).toHaveBeenCalledOnce();
  });

  it("shows and edits effective positions in descending value direction", () => {
    renderEditor(<EditorHarness valueDirection="descending" />);

    expect(screen.getByText("1 · Locked")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Locked curve point: value 0, position 1" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Locked curve point: value 100, position 0" }),
    ).toBeTruthy();
  });
});
