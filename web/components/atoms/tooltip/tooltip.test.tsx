import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("shows the shared tooltip after hovering its trigger", async () => {
    renderEditor(
      <Tooltip content="Show settings" delayDuration={0}>
        <button type="button">Settings</button>
      </Tooltip>,
    );

    fireEvent.pointerMove(screen.getByRole("button", { name: "Settings" }));

    expect((await screen.findByRole("tooltip")).textContent).toBe("Show settings");
  });
});
