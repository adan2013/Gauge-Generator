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
    expect(screen.getByRole("heading", { name: "Do you like Gauge Generator?" })).toBeTruthy();

    expect(screen.getAllByRole("link", { name: /editor/i })[0].getAttribute("href")).toBe("/app");
    expect(screen.getAllByRole("link", { name: /help center/i })[0].getAttribute("href")).toBe(
      "/docs/en",
    );
    expect(screen.getAllByRole("link", { name: /github/i })[0].getAttribute("href")).toBe(
      "https://github.com/adan2013/Gauge-Generator",
    );
    const supportLink = screen.getByRole("link", { name: /buy me a coffee/i });
    expect(supportLink.getAttribute("href")).toBe("https://buymeacoffee.com/danielalberski");
    expect(supportLink.getAttribute("target")).toBe("_blank");
    expect(supportLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByRole("img", { name: "Buy Me a Coffee" }).getAttribute("src")).toContain(
      "default-yellow.png",
    );
  });
});
