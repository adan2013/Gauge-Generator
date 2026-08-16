import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { LayerThumbnail } from "./layer-thumbnail";

describe("LayerThumbnail", () => {
  it("renders the layer's final SVG at thumbnail scale", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { valueEnd: 20, valueStep: 10 });
    const project = createProject({ layers: [layer], ranges: [range] });
    const { container } = render(<LayerThumbnail layer={layer} project={project} />);

    expect(screen.getByTestId(`layer-thumbnail-${layer.id}`)).toBeTruthy();
    expect(container.querySelectorAll("line")).toHaveLength(3);
  });
});
