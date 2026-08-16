export const PROJECT_VALIDATION_CODES = {
  invalidSchema: "project.validation.invalidSchema",
  duplicateObjectId: "project.validation.duplicateObjectId",
  missingRangeReference: "project.validation.missingRangeReference",
  rangeCenterOutsideCanvas: "project.validation.rangeCenterOutsideCanvas",
  rangeRadiusOutsideCanvasLimit: "project.validation.rangeRadiusOutsideCanvasLimit",
  tickScaleRadiusNonPositive: "project.validation.tickScaleRadiusNonPositive",
  tickScaleRadiusOffsetOutsideRange: "project.validation.tickScaleRadiusOffsetOutsideRange",
  tickScaleLengthOutsideRadius: "project.validation.tickScaleLengthOutsideRadius",
  tickScaleWidthExceedsLength: "project.validation.tickScaleWidthExceedsLength",
  tickScaleValueOutsideRange: "project.validation.tickScaleValueOutsideRange",
  tickScaleValueStartAfterEnd: "project.validation.tickScaleValueStartAfterEnd",
  tickScaleTooManyMarks: "project.validation.tickScaleTooManyMarks",
  scaleStartEqualsEnd: "project.validation.scaleStartEqualsEnd",
  customScaleNotMonotonic: "project.validation.customScaleNotMonotonic",
} as const;

export type ProjectValidationCode =
  (typeof PROJECT_VALIDATION_CODES)[keyof typeof PROJECT_VALIDATION_CODES];
