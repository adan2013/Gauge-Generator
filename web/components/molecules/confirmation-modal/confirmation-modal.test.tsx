import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { ConfirmationModal } from "./confirmation-modal";

describe("ConfirmationModal", () => {
  it("confirms only when the explicit confirmation action is chosen", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    renderEditor(
      <ConfirmationModal
        cancelLabel="Cancel"
        confirmLabel="Delete"
        description="This cannot be undone."
        isOpen
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Delete item?"
        variant="danger"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
