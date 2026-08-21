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

The currently supported visual discriminants are `tick-scale`, `numeric-scale`,
and `label`. Tick Scale renders radial marks over the referenced Range arc
and has these required fields:
`valueStart`, `valueEnd`, positive `valueStep`, `tickLengthMm` (at least 0.2
mm), `tickWidthMm` (at least 0.1 mm), `radiusOffsetMm`, and hexadecimal `color`.
Visible values must be integers within the source Range and produce at most 200
marks. Tick Scale follows the shared path owned by its source Range. The spatial
limits are dynamic: its
effective radius is the Range radius plus offset and must stay between 0.2 mm
and twice the Range radius; tick length cannot exceed that effective radius, and
tick width cannot exceed tick length. A Range update clamps dependent Tick Scale
values. Tick positions use the linear, logarithmic, or custom mapping belonging
to the source Range. Numeric Scale uses the same mapped positions for text and
stores its integer visible range and positive integer step, radius offset,
multiplier, decimal places, a nested `textStyle`, and its rotation behavior.
Its labels follow the same Range-owned circular-to-rounded-square path geometry
as Tick Scale.
Fractional Numeric Scale labels are produced only by `scaleMultiplier` (from
`0.01` to `100`) and `decimalPlaces`; canonical mapped values remain integers
from `-1,000,000` to `1,000,000`. New layer types
extend the strict Zod discriminated union in their own implementation stage.

Label renders user text of up to 40 characters. Its point layout is stored as
`layout: { mode: "point", offsetXMm, offsetYMm, rotationDegrees }`. Offsets are
physical distances from the source Range center and remain stable when its
radius changes. Point rotation is an integer from `0` to `359` degrees. Label
also supports a Range-mapped text path:
`layout: { mode: "text-arc", radiusOffsetMm, valueStart, valueEnd, alignment,
direction }`. It uses the same linear, logarithmic, or custom value mapping and
rounded-square geometry as scale layers. `alignment` is `start`, `center`, or
`end`; `direction` is `forward` or `reverse`.

Numeric Scale and Label share the same nested typography contract:
`textStyle: { font, sizeMm, color, bold, italic, underline }`. `font` is a
reference object rather than a bare family field; MVP supports
`{ source: "system", family: "Arial" | "Georgia" | "Courier New" }`. This keeps
future web or user-loaded font sources extensible without adding font fields to
every text layer.

Every physical value is a number in millimetres. Angles are degrees. Range
stores `centerX`, `centerY`, `radius`, `cornerRadiusPercent` (1–50), `angleStart`,
`openingAngle`, and `valueDirection` (`ascending` or `descending`) plus
`scaleDefinition`; it has no pivot field. At 50% the shared path is circular;
lower values form an inscribed rounded square used by every visual layer. A Range centre must remain on the
canvas; radius is from 5 mm to half of the canvas's longest edge. The schema
rejects unknown fields, invalid UUIDs, blank names, invalid canvas dimensions,
invalid colors, broken scale definitions, duplicate IDs, more than five Ranges,
and missing `rangeId` references. The format is development-only and unstable;
until its explicit stabilization, schema changes update the current contract
without backward compatibility, migrations, or version bumps.

`scaleDefinition` is a strict discriminated union:

- `linear`: finite, strictly increasing integer `start` and `end` values;
- `logarithmic`: positive, strictly increasing integer `start` and `end` values plus
  `detailEmphasis` (`low-values` or `high-values`), which selects the side of the
  domain receiving more arc space;
- `custom`: at least two `{ value, position }` points. Values are integers;
  values and normalized positions are strictly increasing, positions stay
  between zero and one in increments of `0.05`, and the first and last positions
  must equal zero and one respectively.

`valueDirection` is independent from the scale mode and the sign of
`openingAngle`. Descending direction applies `1 - position` to the final mapping;
it does not reverse stored bounds or Custom points.

Validation results are not persisted in JSON. They use stable error codes, such
as `project.validation.missingRangeReference`, plus a field path. The UI maps
those codes to localized copy.
