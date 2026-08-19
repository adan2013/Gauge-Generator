export const PROJECT_VALIDATION_CODES = {
  invalidSchema: "project.validation.invalidSchema",
  duplicateObjectId: "project.validation.duplicateObjectId",
  missingRangeReference: "project.validation.missingRangeReference",
  rangeCenterOutsideCanvas: "project.validation.rangeCenterOutsideCanvas",
  rangeRadiusOutsideCanvasLimit: "project.validation.rangeRadiusOutsideCanvasLimit",
  valueMustBePositive: "project.validation.valueMustBePositive",
  valueOutsideAllowedRange: "project.validation.valueOutsideAllowedRange",
  valueStartAfterEnd: "project.validation.valueStartAfterEnd",
  tooManyGeneratedItems: "project.validation.tooManyGeneratedItems",
  scaleBoundsNotAscending: "project.validation.scaleBoundsNotAscending",
  customScaleEndpointsInvalid: "project.validation.customScaleEndpointsInvalid",
  customScaleNotMonotonic: "project.validation.customScaleNotMonotonic",
} as const;

export type ProjectValidationCode =
  (typeof PROJECT_VALIDATION_CODES)[keyof typeof PROJECT_VALIDATION_CODES];
