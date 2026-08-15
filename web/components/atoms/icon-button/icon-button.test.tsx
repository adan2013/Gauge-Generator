import { fireEvent, render, screen } from "@testing-library/react";
import { Plus } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("keeps an accessible label while rendering icon-only UI", () => {
    const onClick = vi.fn();
    render(<IconButton icon={Plus} label="Add layer" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Add layer" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
