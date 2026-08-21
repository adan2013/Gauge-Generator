"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStatusMessage } from "@/components/providers/status-message-provider/status-message-provider";
import { constrainProjectLayersToRanges } from "@/features/layers/core/layer-registry";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import {
  validateProject,
  type ProjectValidationIssue,
} from "@/features/project/project-dto/project-validation";
import { MAX_GENERATED_SCALE_ITEMS } from "@/features/ranges/scale-mapping/scale-constants";

const VALIDATION_MESSAGE_KEY_BY_CODE = {
  [PROJECT_VALIDATION_CODES.duplicateObjectId]: "duplicateObjectId",
  [PROJECT_VALIDATION_CODES.missingRangeReference]: "missingRangeReference",
  [PROJECT_VALIDATION_CODES.valueMustBePositive]: "valueMustBePositive",
  [PROJECT_VALIDATION_CODES.valueOutsideAllowedRange]: "valueOutsideAllowedRange",
  [PROJECT_VALIDATION_CODES.valueStartAfterEnd]: "valueStartAfterEnd",
  [PROJECT_VALIDATION_CODES.valueRangeMustHaveSpan]: "valueRangeMustHaveSpan",
  [PROJECT_VALIDATION_CODES.scaleBoundsNotAscending]: "scaleBoundsNotAscending",
  [PROJECT_VALIDATION_CODES.customScaleEndpointsInvalid]: "customScaleEndpointsInvalid",
  [PROJECT_VALIDATION_CODES.customScaleNotMonotonic]: "customScaleNotMonotonic",
} as const;

export function useProjectValidation() {
  const t = useTranslations("Editor");
  const { dismissMessage, showMessage } = useStatusMessage();
  const validationMessageIdRef = useRef<number | null>(null);

  function dismissValidationMessage() {
    if (validationMessageIdRef.current === null) return;
    dismissMessage(validationMessageIdRef.current);
    validationMessageIdRef.current = null;
  }

  function getValidationMessage(issue: ProjectValidationIssue | undefined, field: string) {
    if (!issue) return t("status.validation.invalidProject");
    if (issue.code === PROJECT_VALIDATION_CODES.invalidSchema)
      return field === "name"
        ? t("status.validation.invalidName")
        : t("status.validation.invalidSchema");
    if (issue.code === PROJECT_VALIDATION_CODES.tooManyGeneratedItems)
      return t("status.validation.tooManyGeneratedItems", {
        max: MAX_GENERATED_SCALE_ITEMS,
      });
    if (issue.code in VALIDATION_MESSAGE_KEY_BY_CODE)
      return t(
        `status.validation.${VALIDATION_MESSAGE_KEY_BY_CODE[issue.code as keyof typeof VALIDATION_MESSAGE_KEY_BY_CODE]}`,
      );
    return t("status.validation.invalidProject");
  }

  function showValidationMessage(issues: ProjectValidationIssue[], candidateProject: ProjectDto) {
    dismissValidationMessage();
    const issue =
      issues.find(
        (candidate) =>
          candidate.code === PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas ||
          candidate.code === PROJECT_VALIDATION_CODES.rangeRadiusOutsideCanvasLimit,
      ) ?? issues[0];
    const [, rangeId, field] = issue?.path.split(".") ?? [];
    const range = candidateProject.ranges.find((candidate) => candidate.id === rangeId);
    let content = getValidationMessage(issue, field);
    if (issue?.code === PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas && range) {
      content =
        field === "centerX"
          ? t("status.canvasWidthTooSmall", { minimum: range.centerX, name: range.name })
          : t("status.canvasHeightTooSmall", { minimum: range.centerY, name: range.name });
    }
    if (issue?.code === PROJECT_VALIDATION_CODES.rangeRadiusOutsideCanvasLimit && range)
      content = t("status.canvasRadiusTooLarge", {
        minimum: range.radius * 2,
        name: range.name,
      });
    validationMessageIdRef.current = showMessage({
      color: "danger",
      content,
      duration: 5_000,
      icon: TriangleAlert,
    });
  }

  function validateCandidateProject(candidate: ProjectDto): boolean {
    const constrainedCandidate = constrainProjectLayersToRanges(candidate);
    const validation = validateProject(constrainedCandidate);
    if (!validation.data) {
      showValidationMessage(validation.issues, constrainedCandidate);
      return false;
    }
    dismissValidationMessage();
    return true;
  }

  useEffect(
    () => () => {
      if (validationMessageIdRef.current !== null) dismissMessage(validationMessageIdRef.current);
    },
    [dismissMessage],
  );

  return { validateCandidateProject };
}
