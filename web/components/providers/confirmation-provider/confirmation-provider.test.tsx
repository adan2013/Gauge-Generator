import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { describe, expect, it } from "vitest";
import messages from "@/messages/en.json";
import { ConfirmationProvider, useConfirmation } from "./confirmation-provider";

function ConfirmationTrigger() {
  const { confirm } = useConfirmation();
  const [result, setResult] = useState("pending");
  return (
    <>
      <button
        onClick={async () =>
          setResult(
            String(
              await confirm({
                confirmIcon: Trash2,
                description: "Remove it permanently.",
                title: "Remove item?",
                variant: "danger",
              }),
            ),
          )
        }
        type="button"
      >
        Request confirmation
      </button>
      <output>{result}</output>
    </>
  );
}
describe("ConfirmationProvider", () => {
  it("resolves a confirmation request from its single root modal", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ConfirmationProvider>
          <ConfirmationTrigger />
        </ConfirmationProvider>
      </NextIntlClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Request confirmation" }));
    expect(screen.getByRole("alertdialog", { name: "Remove item?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("true")).toBeTruthy();
  });
});
