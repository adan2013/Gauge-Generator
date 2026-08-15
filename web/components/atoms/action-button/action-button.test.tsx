import { fireEvent, render, screen } from "@testing-library/react";
import { Download } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { ActionButton } from "./action-button";

describe("ActionButton", () => {
  it("exposes its label and invokes its action", () => {
    const onClick = vi.fn();
    render(<ActionButton icon={Download} label="Download JSON" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Download JSON" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
