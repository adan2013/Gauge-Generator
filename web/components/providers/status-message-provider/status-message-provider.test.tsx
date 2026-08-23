import { act, fireEvent, render, screen } from "@testing-library/react";
import { TriangleAlert } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { STATUS_MESSAGE_DURATION_MS } from "./status-message-duration";
import { StatusMessageProvider, useStatusMessage } from "./status-message-provider";

function MessageControls() {
  const persistentIdRef = useRef<number | null>(null);
  const { dismissMessage, showMessage } = useStatusMessage();
  return (
    <>
      <button
        onClick={() => showMessage({ content: "Saved", color: "neutral", duration: "short" })}
        type="button"
      >
        Timed
      </button>
      <button
        onClick={() => {
          persistentIdRef.current = showMessage({
            color: "accent",
            content: "Check linked layers",
            duration: "persistent",
            icon: TriangleAlert,
          });
        }}
        type="button"
      >
        Persistent
      </button>
      <button
        onClick={() => {
          if (persistentIdRef.current !== null) dismissMessage(persistentIdRef.current);
        }}
        type="button"
      >
        Dismiss
      </button>
    </>
  );
}

describe("StatusMessageProvider", () => {
  afterEach(() => vi.useRealTimers());

  it("expires timed messages while retaining persistent messages until dismissed", () => {
    vi.useFakeTimers();
    render(
      <StatusMessageProvider>
        <MessageControls />
      </StatusMessageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Timed" }));
    fireEvent.click(screen.getByRole("button", { name: "Persistent" }));

    const persistentMessage = screen.getByText("Check linked layers").closest('[role="status"]');
    if (!persistentMessage) throw new Error("Persistent message was not rendered");
    expect(persistentMessage.querySelector("svg")).not.toBeNull();

    act(() => vi.advanceTimersByTime(STATUS_MESSAGE_DURATION_MS.short));
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.getByText("Check linked layers")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Check linked layers")).toBeNull();
  });

  it("keeps persistent messages at the bottom when timed messages are added later", () => {
    vi.useFakeTimers();
    render(
      <StatusMessageProvider>
        <MessageControls />
      </StatusMessageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Persistent" }));
    fireEvent.click(screen.getByRole("button", { name: "Timed" }));
    fireEvent.click(screen.getByRole("button", { name: "Timed" }));

    expect(screen.getAllByRole("status").map((message) => message.textContent)).toEqual([
      "Saved",
      "Saved",
      "Check linked layers",
    ]);
  });
});
