# Architecture — Gauge Generator Web

## Boundaries

- `features/project/` owns plain Project DTOs, Zod parsing, factories, future
  migrations, import/export serialization, and persistence adapters.
- `features/layers/` owns React-independent domain abstractions. `Layer` is the
  base class for visual layers; `Range` is a separate domain object and never a
  visual layer. `core/layer-registry.ts` instantiates the appropriate visual
  layer class for preview and future export.
- `lib/geometry/` contains pure millimetre, angle, mapping, and snapping math.
- `store/` owns Redux Toolkit slices, history middleware, typed hooks, and the
  client `StoreProvider`.
- React UI reads state through typed hooks and dispatches typed actions. It does
  not serialize projects, calculate geometry, or use ad-hoc object shapes.
- Range and visual-layer domain objects expose editing overlays as typed
  `EditingOverlayPrimitive` collections. The shared `EditingOverlayGeometry`
  component is the only place that translates those React-free path and line
  descriptions into SVG elements.
- Adjacent property-definition modules expose numeric fields (`min`, `max`, and
  `step`) to the UI. This keeps canvas- and layer-dependent limits out of React
  components; Range derives coordinate bounds from the active canvas and Tick
  Scale derives its minimum radius offset from its source Range.
- Visual-layer property editors render those definitions through the shared
  `NumericPropertyFields`, which centrally applies integer rounding, snapping,
  and bounds before returning a typed field change to the owning layer editor.
- Range-mapped visual layers share effective-radius, radius-handle, drag, and
  editing-overlay mechanics. Each layer keeps only its own geometric limits,
  SVG output, validation, and translated overlay adapter.
- Editing-overlay paths remain in project millimetres, while their strokes,
  dash patterns, handles, and labels are compensated by the fitted preview's
  pixels-per-millimetre ratio. Their on-screen size therefore remains stable
  across small and large canvases without changing pointer geometry.
- Validation returns a stable `{ code, path }`, never localized text. The UI
  owns translation of an error code through `messages/en.json` when it renders
  an error.

## Store

```ts
{
  project: { current: ProjectDto },
  editor: {
    sidebarMode: "layers" | "properties" | "project-settings",
    selectedObject: { collection: "layers" | "ranges"; id: string } | null,
    hoveredLayerId: string | null,
    layerPreviewModifiers: {
      showOnlySelectedLayer: boolean,
      bringSelectedLayerToFront: boolean,
      showEditingOverlay: boolean
    },
    snapping: { enabled: boolean; distanceMm: number; angleDegrees: number },
    autosaveStatus: "idle" | "saved" | "error"
  },
  history: { past: ProjectDto[], future: ProjectDto[] }
}
```

Only successful project mutations enter history. UI state never does. Undo and
redo retain at most 50 project snapshots each.

A project-selection middleware clears a stale selected object and returns the
sidebar to Layers after a project action removes that Range or visual Layer.
This covers undo/redo, import, reset, restore, and deletion without a React
effect.

The history middleware observes successful actions in the `project/` namespace
instead of a duplicated action list. Controls that produce a stream of changes
use a begin/complete transaction: the store updates for live preview throughout
the interaction, but history records its initial project only once at the end.

## Scale definitions

A Range owns one scale definition: `linear`, `logarithmic`, or `custom`.
Switching modes is always destructive: after confirmation, the selected mode
starts from its own default definition (`0..100` for Linear and Custom, `1..100`
for Logarithmic). Bounds and custom points are never converted between modes.
The Range-owned `valueDirection` remains independent and is preserved across
mode changes. `descending` maps every effective position `p` to `1 - p` without
changing the ordered value domain or the direction of the geometric arc.

Logarithmic definitions use `detailEmphasis`: `low-values` is the conventional
logarithmic mapping with more arc space at the low end, while `high-values`
mirrors the distribution while retaining increasing values and ordered bounds.
The UI calls this **Detail emphasis**, because it describes which values receive
more space independently from their left/right placement and value direction.

All scale-domain bounds, Custom point values, and Tick/Numeric visible sequence
values are integers. Numeric Scale may present fractional labels by multiplying
those canonical values with `scaleMultiplier` and formatting the result with
`decimalPlaces`; the presentation does not alter mapping positions.

Text-rendering layers share one nested `textStyle` value. It owns a structured
font reference, physical size, color, weight, italic, and underline flags.
Numeric Scale adds only scale-specific placement behavior; Label provides a
discriminated point or Range-path layout. Point offsets use millimetres. Text
paths use Range values, shared scale mapping, and shared rounded-square geometry
rather than storing independent angles. Shared property UI and SVG attribute
generation consume the same contract, so future font sources do not require
parallel fields in each layer.

Scale calculations are split by responsibility under `features/ranges/scale-mapping`:
`scale-mapping.ts` maps a domain value through the selected curve and value
direction, while `scale-sequence.ts` generates a bounded visible sequence and
returns ready-to-render `{ value, position, angle }` distribution items. The
same sequence module constrains linked layer bounds to the Range domain. Visual
layers consume that distribution and own only their shape-specific geometry and
SVG. Shared generation limits live in `scale-constants.ts`; validation and
rendering import the same constant.

Arc is a Range-mapped interval layer rather than an independently angled shape.
It stores only integer `valueStart` and `valueEnd`; shared mapping derives its
temporary path angles from the source Range. Its radius offset uses the common
Range-mapped overlay and handle, while stroke thickness, color, and rounded or
flat SVG end caps remain Arc-owned presentation.

Needle is a Range-mapped point layer. Its integer `value` is converted to a
normalized position with the same linear, logarithmic, or custom mapping as the
scales; handle dragging uses the shared inverse mapping to recover a value from
the pointer position. The Range center is its fixed pivot. Shaft and hub remain
nested, Needle-owned presentation objects, and no independent angle or pivot is
stored.

Ellipse and Rectangle use the shared planar-shape model. Their center is stored
as millimetre offsets from the source Range center, while width and height are
physical millimetres and rotation is an integer from zero through 359 degrees.
Resize dragging projects the pointer into the shape's rotated local axes before
updating both dimensions. Both share nested `geometry` and `style`; only
Rectangle owns corner rounding.

Line follows the same center-relative positioning convention without pretending
to have two planar dimensions. Its persisted geometry contains millimetre center
offsets, length, and rotation. The editing overlay derives two endpoints; moving
one endpoint recalculates the stored geometry, while a center handle translates
the complete line.

Custom points map an ascending value axis to an ascending normalized-position
axis. The first and last positions are locked to zero and one at the domain
boundaries, while their values remain editable. The graph editor constrains
every inner point strictly between its neighbours on both axes. Point values are
integers and use the project distance increment while snapping is enabled;
normalized positions always use a 0.05 increment.
Zod and domain validation remain authoritative for imported data.
For descending direction the editor displays and edits effective `1 - p`
positions, but persists the same canonical increasing points. Custom deliberately
has no separate curve-mirroring option.
Adding or removing a point is one project mutation; a pointer drag uses one
history transaction regardless of the number of live preview updates.

## Status messages

Corner messages are owned by the root `StatusMessageProvider` and opened through
`useStatusMessage()`. A request supplies `content`, an optional `color` and icon,
and `duration` as milliseconds or `"persistent"`. Timed operation feedback may
stack alongside persistent contextual warnings. Callers retain the returned id
when they need to dismiss a persistent message.

Routine navigation does not produce messages. Use timed messages for meaningful
operation results and validation guidance; reserve persistent messages for
context that remains relevant until the user leaves that context.

Editor-originated project changes are validated before dispatch. Rejected
Canvas, Range, and visual-layer values produce one translated, timed danger
message explaining the relevant domain rule; a later attempt replaces the
previous validation message. Shared numeric controls report empty or non-finite
drafts through the same status-message channel. `useProjectValidation` owns
validation-code translation, contextual Canvas messages, and the lifecycle of
the current project-validation message; `EditorShell` only asks it to validate
a candidate before dispatch.
