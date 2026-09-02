import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { MAX_GENERATED_SCALE_ITEMS } from "@/features/ranges/scale-mapping/scale-constants";
import { renderEditor } from "@/test/render-editor";
import { useProjectValidation } from "./use-project-validation";

function ValidationTrigger({ candidate }: { candidate: ProjectDto }) {
  const { validateCandidateProject } = useProjectValidation();
  return <button onClick={() => validateCandidateProject(candidate)}>Validate</button>;
}

describe("useProjectValidation", () => {
  it("maps a canvas constraint to its contextual translated message", () => {
    const range = createRange({ centerX: 60 });
    const candidate = createProject({
      canvas: {
        widthMm: 50,
        heightMm: 120,
        background: "#FFFFFF",
        transparentBackground: true,
      },
      ranges: [range],
    });
    renderEditor(<ValidationTrigger candidate={candidate} />);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));

    expect(
      screen.getByText(
        `Canvas width must be at least 60 mm to keep the center of “${range.name}” inside.`,
      ),
    ).toBeTruthy();
  });

  it("interpolates the current generated-item limit", () => {
    const range = createRange({
      scaleDefinition: { mode: "linear", start: 0, end: 1_000 },
    });
    const layer = createTickScaleLayer(range.id, { valueEnd: 1_000, valueStep: 1 });
    renderEditor(
      <ValidationTrigger candidate={createProject({ ranges: [range], layers: [layer] })} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));

    expect(
      screen.getByText(
        `Increase the step so the scale generates no more than ${MAX_GENERATED_SCALE_ITEMS} items.`,
      ),
    ).toBeTruthy();
  });
});
