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
  "canvas": {
    "widthMm": 120,
    "heightMm": 120,
    "background": "#FFFFFF",
    "transparentBackground": true
  },
  "layers": [],
  "ranges": []
}
```

`transparentBackground` defaults to `true`; while it is true, `background` is
retained in the JSON but not rendered. `layers` and `ranges` are intentionally
separate arrays. A visual layer has a
required `rangeId`, which must reference an item in `ranges`. A Range has no
final SVG representation. Every object has a stable UUID and a non-empty,
user-editable `name`.

The currently supported visual discriminant is `tick-scale`. It renders radial
marks over the referenced Range arc and has these required fields:
`valueStart`, `valueEnd`, positive `valueStep`, `tickLengthMm` (at least 0.2
mm), `tickWidthMm` (at least 0.1 mm), `radiusOffsetMm`,
`cornerRadiusPercent` (0–50), and hexadecimal `color`. Visible values must be
within the source Range and produce at most 200 marks. At 50%, Tick Scale follows
the familiar circular Range; reducing the corner radius makes it follow a
rounded square inscribed in that Range. The spatial limits are dynamic: its
effective radius is the Range radius plus offset and must stay between 0.2 mm
and twice the Range radius; tick length cannot exceed that effective radius, and
tick width cannot exceed tick length. A Range update clamps dependent Tick Scale
values. Tick positions use the linear, logarithmic, or custom mapping belonging
to the source Range. New layer types will extend the strict Zod discriminated
union in their own implementation stage.

Every physical value is a number in millimetres. Angles are degrees. Range
stores `centerX`, `centerY`, `radius`, `angleStart`, `openingAngle`, and
`scaleDefinition`; it has no pivot field. A Range centre must remain on the
canvas; radius is from 5 mm to half of the canvas's longest edge. The schema
rejects unknown fields, invalid UUIDs, blank names, invalid canvas dimensions,
invalid colors, broken scale definitions, duplicate IDs, more than five Ranges,
and missing `rangeId` references. Any semantic format change requires a new
version and migration.

Validation results are not persisted in JSON. They use stable error codes, such
as `project.validation.missingRangeReference`, plus a field path. The UI maps
those codes to localized copy.
