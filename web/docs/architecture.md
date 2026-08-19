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
- Edited domain objects expose numeric property definitions (`min`, `max`, and
  `step`) to the UI. This keeps canvas- and layer-dependent limits out of React
  components; Range derives coordinate bounds from the active canvas and Tick
  Scale derives its minimum radius offset from its source Range.
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

## Status messages

Corner messages are owned by the root `StatusMessageProvider` and opened through
`useStatusMessage()`. A request supplies `content`, an optional `color` and icon,
and `duration` as milliseconds or `"persistent"`. Timed operation feedback may
stack alongside persistent contextual warnings. Callers retain the returned id
when they need to dismiss a persistent message.

Routine navigation does not produce messages. Use timed messages for meaningful
operation results and validation guidance; reserve persistent messages for
context that remains relevant until the user leaves that context.
