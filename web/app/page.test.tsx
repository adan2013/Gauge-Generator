import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("landing page", () => {
  it("presents the product promise and primary destinations", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Design precise gauges. Keep every file yours.",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Free and open source")).toBeTruthy();
    expect(screen.getByText("No registration")).toBeTruthy();
    expect(screen.getByText("Your project stays local")).toBeTruthy();
    expect(screen.getByText("Readable JSON files")).toBeTruthy();
    expect(screen.getByText("Community translations")).toBeTruthy();

    expect(screen.getAllByRole("link", { name: /editor/i })[0].getAttribute("href")).toBe("/app");
    expect(screen.getAllByRole("link", { name: /help center/i })[0].getAttribute("href")).toBe(
      "/docs/en",
    );
    expect(screen.getAllByRole("link", { name: /github/i })[0].getAttribute("href")).toBe(
      "https://github.com/adan2013/Gauge-Generator",
    );
  });
});
