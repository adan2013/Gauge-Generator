"use client";

import { RangePropertyRow } from "@/features/editor/property-controls/property-controls";
import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { clamp, snap } from "@/lib/geometry/geometry";

export type NumericPropertySnapping = {
  angleDegrees: number;
  distanceMm: number;
  enabled: boolean;
};

type GroupedNumericPropertyDefinition = NumericPropertyDefinition & { group: string };

type NumericPropertyFieldsProps<TDefinition extends GroupedNumericPropertyDefinition> = {
  definitions: readonly TDefinition[];
  getLabel: (definition: TDefinition) => string;
  getSuffix: (definition: TDefinition) => string;
  group: TDefinition["group"];
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onValueChange: (key: TDefinition["key"], value: number) => void;
  snapping: NumericPropertySnapping;
};

export function NumericPropertyFields<TDefinition extends GroupedNumericPropertyDefinition>({
  definitions,
  getLabel,
  getSuffix,
  group,
  onInteractionEnd,
  onInteractionStart,
  onValueChange,
  snapping,
}: NumericPropertyFieldsProps<TDefinition>) {
  return definitions
    .filter((definition) => definition.group === group)
    .map((definition) => (
      <RangePropertyRow
        key={definition.key}
        label={getLabel(definition)}
        max={definition.max}
        min={definition.min}
        onChange={(value) =>
          onValueChange(definition.key, resolveNumericPropertyValue(definition, value, snapping))
        }
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
        step={definition.step}
        suffix={getSuffix(definition)}
        value={String(definition.value)}
      />
    ));
}

export function resolveNumericPropertyValue(
  definition: NumericPropertyDefinition,
  value: string,
  snapping: NumericPropertySnapping,
): number {
  const numericValue = Number(value);
  const rawValue = definition.integerOnly ? Math.round(numericValue) : numericValue;
  const increment = definition.snap === "angle" ? snapping.angleDegrees : snapping.distanceMm;
  const snappedValue =
    snapping.enabled && definition.snap !== "none" ? snap(rawValue, increment) : rawValue;
  return clamp(snappedValue, definition.min, definition.max);
}
