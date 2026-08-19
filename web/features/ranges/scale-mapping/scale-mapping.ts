import type { RangeDto, ScaleDefinitionDto } from "@/features/project/project-dto/project-dto";

export function getRangeScaleValueBounds(range: RangeDto): { max: number; min: number } {
  if (range.scaleDefinition.mode === "custom") {
    const values = range.scaleDefinition.points.map((point) => point.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  return {
    min: Math.min(range.scaleDefinition.start, range.scaleDefinition.end),
    max: Math.max(range.scaleDefinition.start, range.scaleDefinition.end),
  };
}

export function valueToNormalizedPosition(range: RangeDto, value: number): number {
  const position = scaleDefinitionValueToNormalizedPosition(range.scaleDefinition, value);
  return range.valueDirection === "descending" ? 1 - position : position;
}

export function scaleDefinitionValueToNormalizedPosition(
  definition: ScaleDefinitionDto,
  value: number,
): number {
  if (definition.mode === "linear")
    return (value - definition.start) / (definition.end - definition.start);
  if (definition.mode === "logarithmic") {
    const logarithmicSpan = Math.log(definition.end) - Math.log(definition.start);
    if (definition.detailEmphasis === "low-values")
      return (Math.log(value) - Math.log(definition.start)) / logarithmicSpan;
    if (value === definition.start) return 0;
    if (value === definition.end) return 1;
    const reflectedValue = definition.start + (definition.end - value);
    return (Math.log(definition.end) - Math.log(reflectedValue)) / logarithmicSpan;
  }
  const segmentIndex = definition.points.findIndex((point) => point.value >= value);
  if (segmentIndex === -1) return definition.points.at(-1)!.position;
  if (segmentIndex <= 0) return definition.points[0].position;
  const previous = definition.points[segmentIndex - 1];
  const next = definition.points[segmentIndex];
  if (!next) return definition.points.at(-1)!.position;
  const progress = (value - previous.value) / (next.value - previous.value);
  return previous.position + (next.position - previous.position) * progress;
}
