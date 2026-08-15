import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppSelector } from "@/store/hooks";
import { StoreProvider } from "./store-provider";

function ProjectTitle() {
  return <p>{useAppSelector((state) => state.project.current.meta.title)}</p>;
}

describe("StoreProvider", () => {
  it("provides a fresh empty project to client components", () => {
    render(<StoreProvider><ProjectTitle /></StoreProvider>);
    expect(screen.getByText("Untitled project")).toBeTruthy();
  });
});
