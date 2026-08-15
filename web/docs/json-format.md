# Gauge Generator Web JSON format (v1)

```json
{
  "format": "gauge-generator-web",
  "version": 1,
  "meta": {
    "title": "Untitled project",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "canvas": { "widthMm": 120, "heightMm": 120, "background": "#FFFFFF" },
  "layers": [],
  "ranges": []
}
```

`layers` and `ranges` are intentionally separate arrays. A visual layer has a
required `rangeId`, which must reference an item in `ranges`. A Range has no
final SVG representation. Every object has a stable UUID and a non-empty,
user-editable `name`.

The current supported visual discriminant is `tick-scale`, establishing the
reference contract for the later tick-scale vertical slice. It has no final
renderer yet. It never controls whether values are linear, logarithmic, or
custom: that mapping belongs to its referenced Range. New layer types will
extend the strict Zod discriminated union in their own implementation stage.

Every physical value is a number in millimetres. Angles are degrees. The schema
rejects unknown fields, invalid UUIDs, blank names, invalid canvas dimensions,
invalid colors, broken scale definitions, duplicate IDs, and missing `rangeId`
references. Any semantic format change requires a new version and migration.

Validation results are not persisted in JSON. They use stable error codes, such
as `project.validation.missingRangeReference`, plus a field path. The UI maps
those codes to localized copy.
