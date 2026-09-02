import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { getRangeMappedIntervalValidationIssues } from "./range-layer-validation";

describe("Range-mapped interval validation", () => {
  it("centrally enforces a value span only for layers that require one", () => {
    const range = createRange();
    const interval = { radiusOffsetMm: 0, valueStart: 50, valueEnd: 50 };

    expect(getRangeMappedIntervalValidationIssues(interval, range)).toEqual([]);
    expect(getRangeMappedIntervalValidationIssues(interval, range, true)).toEqual([
      { path: "valueStart", code: PROJECT_VALIDATION_CODES.valueRangeMustHaveSpan },
    ]);
  });
});
