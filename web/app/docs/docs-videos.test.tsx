import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocsMarkdown } from "@/app/docs/docs-markdown";

describe("documentation videos", () => {
  it.each(["pl", "en"])("embeds all four videos in order in the %s article", (locale) => {
    const markdown = readFileSync(`content/docs/${locale}.md`, "utf8");
    const { container } = render(<DocsMarkdown markdown={markdown} />);
    const frames = Array.from(container.querySelectorAll("iframe"));

    expect(frames.map((frame) => frame.getAttribute("src"))).toEqual(
      ["OYj0auyJ2pw", "4VuLSKFEPO8", "Oj78NdAmlEw", "gXwXKAwQVG4"].map(
        (id) => `https://www.youtube-nocookie.com/embed/${id}`,
      ),
    );
    for (const frame of frames) {
      expect(frame.title).not.toBe("");
      expect(frame.getAttribute("loading")).toBe("lazy");
      expect(frame.hasAttribute("allowfullscreen")).toBe(true);
      expect(frame.closest("p")).toBeNull();
      expect(frame.parentElement?.querySelector("figcaption a")?.getAttribute("href")).toBe(
        `https://www.youtube.com/watch?v=${frame.src.split("/").at(-1)}`,
      );
    }
  });

  it("keeps inline, malformed and other-host links as ordinary links", () => {
    const markdown = [
      "Watch [this video](https://www.youtube.com/watch?v=OYj0auyJ2pw) for details.",
      "[Invalid video](https://www.youtube.com/watch?v=invalid)",
      "[Other host](https://example.com/watch?v=OYj0auyJ2pw)",
    ].join("\n\n");
    const { container } = render(<DocsMarkdown markdown={markdown} />);

    expect(container.querySelectorAll("iframe")).toHaveLength(0);
    expect(container.querySelectorAll("p a")).toHaveLength(3);
  });
});
