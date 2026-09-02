import { fireEvent, screen } from "@testing-library/react";
import { RotateCcw } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { ConfirmationModal } from "./confirmation-modal";

describe("ConfirmationModal", () => {
  it("supports confirmation and cancellation from buttons and the keyboard", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    renderEditor(
      <ConfirmationModal
        cancelLabel="Cancel"
        confirmIcon={RotateCcw}
        confirmLabel="Delete"
        description="This cannot be undone."
        isOpen
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Delete item?"
        variant="danger"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Delete" }).querySelector(".lucide-rotate-ccw"),
    ).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledOnce();
    if (!dialog.parentElement) throw new Error("Expected modal backdrop");
    fireEvent.click(dialog.parentElement);
    expect(onCancel).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
});
