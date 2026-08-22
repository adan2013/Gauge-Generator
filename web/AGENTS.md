<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gauge Generator Web — Engineering Guide

## Sources of truth

`web/` is the independent web application; `../pc-legacy/` is reference-only.
Do not copy or depend on legacy code, assets, `.ggp`, or its data library.

Before a feature, read the relevant parts of:

1. `docs/ANALIZA_MODERNIZACJI_WEB.md` — product and layer catalogue;
2. `docs/PLAN_IMPLEMENTACJI_GAUGE_GENERATOR_WEB.md` — sequencing and stage gates;
3. `docs/architecture.md` and `docs/json-format.md` — implemented contracts;
4. `docs/adding-a-visual-layer.md` — required vertical-slice integration points;
5. `ai-handoff/` — decisions, legacy references, and stage evidence.

Keep those documents current. Put completed-stage evidence in
`ai-handoff/implementation-evidence/`; do not use this file as a changelog.

## Tooling and code conventions

- Use **pnpm only**. `pnpm-lock.yaml` is authoritative.
- Run `pnpm verify` before handoff. It is also the Husky pre-commit gate:
  lint, typecheck, and unit tests. Do not add E2E tests or builds to the hook.
- Read the relevant bundled Next.js docs before changing Next code.
- Use TypeScript, React 19, App Router, Tailwind v4, Redux Toolkit, Zod, and
  `next-intl`. Keep app code in `web/`.
- Use `cn()` from `lib/cn.ts` for every combined or conditional Tailwind class.
- Use the shared Radix-based `Tooltip` and root `TooltipProvider` for icon-only
  controls and contextual hints; never add native HTML `title` tooltips. The
  default delay is global, while controls requiring immediate feedback pass an
  explicit `delayDuration={0}`.
- Prettier enforces a 100-character print width (`pnpm format`). When a long
  Tailwind `className` would harm readability, split its semantic groups across
  lines with `cn("layout …", "visual …", "interaction …")`; never use string
  concatenation. Run `pnpm format` after such edits; `pnpm verify` checks it.
- Each public UI component has a kebab-case directory with its colocated unit
  test. Use Atomic Design for presentational UI; keep domain/state/serialization
  in `features/`, `store/`, and `lib/`.
- Property forms compose `FieldRow` with the shared `TextPropertyRow`,
  `RangePropertyRow`, `SelectPropertyRow`, `ColorPropertyRow`, and
  `BooleanPropertyRow`. Add a control there before introducing another field
  type; do not recreate controls or their interaction styling inside a panel.
- Keep layer-owned UI in that layer's directory: its property editor,
  property definitions, editing overlay, and tests evolve together. Editor
  shells may select a layer editor through a small registry, but must not grow
  type-specific forms, render branches, or per-layer update logic.
- Prefer composable APIs over boolean-prop proliferation.
- Destructive actions use the root-mounted `ConfirmationProvider` and its
  promise-based `useConfirmation().confirm(request)` API. Keep modal mounting,
  button labels, and cancellation behavior central; callers own only their
  translated title, description, confirmation icon, and post-confirmation
  domain action. `variant` styles the request but never selects its icon.

## Product constraints

- Routes: `/` landing, `/app` editor, `/app/help` in-app mini wiki.
- English is the only shipped locale, but every user-facing string, including
  ARIA labels and errors, belongs in `messages/en.json`. Remove unused keys.
  Domain code returns stable `{ code, path }` validation errors, never English.
- Light mode only; use the centrally defined grey palette and red accent.
- No backend, account, analytics, telemetry, cloud persistence, IndexedDB,
  SQLite, keyboard shortcuts, dark mode, payments, or E2E tests in MVP.

## Model and rendering

- Projects are versioned, strict JSON DTOs: `format`, `version`, `meta`,
  `canvas`, `layers`, `ranges`, and optional `extensions`. Persist no UI state.
  Validate through Zod, then domain rules; invalid input never replaces a project.
  Keep `project-dto` limited to the JSON contract. `validateProject` first parses
  that contract and then calls `Range.validate()` and `Layer.validate()` through
  the layer registry, prefixing their relative paths for JSON feedback.
- The project format is still development-only and intentionally unstable.
  Until an explicit stabilization milestone, schema changes do not require
  backward compatibility, migrations, or a version bump; update current
  factories, fixtures, tests, and documentation instead.
- Physical project data uses millimetres; the default canvas is 120 × 120 mm
  and may be rectangular. Final SVG uses an mm `viewBox`.
- `ranges` and visual `layers` are separate collections. Both have required,
  user-editable names. A project may contain at most five Ranges. Each visual
  layer has a required `rangeId`; a Range cannot be removed while referenced.
- Creating a visual layer is a two-step flow: first choose its type in the
  right-side picker, then create it and open its Properties. Do not create a
  placeholder layer before that choice.
- A Range owns geometry, including `cornerRadiusPercent`, `valueDirection`
  (`ascending` or `descending`), and `scaleDefinition` (`linear`, `logarithmic`,
  or `custom`). Visual layers such as Tick Scale and Numeric Scale render using
  that shared path and mapping; they never choose their own shape, mode, or
  direction. Logarithmic definitions use `detailEmphasis` to give more arc space
  to either low or high values. Custom has no curve-mirroring option; direction
  is applied after its canonical increasing point mapping.
- Scale-domain bounds, Custom point values, and Tick/Numeric visible start, end,
  and step values are integers. Fractional labels come only from Numeric Scale's
  `scaleMultiplier` and `decimalPlaces` presentation settings.
- Numeric Scale and Label share a nested `textStyle` contract with a structured
  font reference. Label has a discriminated point layout with millimetre offsets
  and a text-arc layout mapped by Range values onto shared path geometry.
- Arc stores only a non-zero Range-mapped value interval, radius offset, stroke
  width, color, and rounded-end preference. It never stores independent angles.
- Needle stores one Range-mapped integer value plus nested `shaft` and `hub`
  presentation. Its pivot is always the source Range center; it never stores an
  independent angle or position.
- Ellipse and Rectangle share nested millimetre `geometry`, fill/border `style`,
  and the same center, rotation, and orientation-aware resize handles. Rectangle
  alone adds `cornerRadiusPercent` from zero through 50.
- Line stores its center as millimetre offsets from the source Range plus length
  and rotation. Its overlay exposes the center and both endpoints; endpoint
  dragging derives the stored center, length, and rotation.
- `Layer` is the visual-layer base abstraction; `Range` is separate. Layer
  implementations own final SVG, validation, editing overlay, handles, drag
  behavior, and numeric field definitions. Keep rendering/domain code React-free.
- SVG editing overlays use shared `LayerHandles` for interactive handle circles,
  white-backed labels, pointer conversion, and drag lifecycle. Individual layers
  own only overlay geometry, handles, and label content.
- Object-owned field definitions provide `min`, `max`, and `step`; UI renders
  them rather than hardcoding limits. Definitions also own the stable field key,
  displayed unit, grouping, current value, and snapping strategy; forms iterate
  them rather than enumerating object fields inline. Each Range or visual layer
  owns these declarations in a dedicated adjacent `*-properties.ts` module.
  Zod remains authoritative.
- Empty projects prompt for a Range; projects with Range but no visual layer
  prompt for a layer; otherwise show SVG preview. Welcome states use a stable
  square frame; the SVG preview frame reflects the project canvas ratio. Canvas
  clicks do not select layers. Overlays and handles exist only in Properties mode.
- Until zooming and panning are deliberately introduced, preview uses fit-to-space:
  the whole canvas must remain visible inside its available panel area.
- The preview panel shows canvas dimensions at bottom-left and adds fitted zoom
  only when rendering the actual SVG preview; transient status messages appear
  independently at bottom-right.
- Layer index `0` is the topmost visual layer; higher indexes are progressively
  lower. SVG rendering must therefore emit visual layers in reverse list order.
- Hovering a visual-layer thumbnail temporarily isolates that layer in the
  preview. It must not alter selection, sidebar mode, project data, or history.
- Layer Properties exposes editor-wide preview modifiers: isolate the edited
  layer, temporarily bring it to the front, and show or hide its editing overlay.
  live in `editorSlice`, persist while changing layers during the session, and
  never enter project JSON or history. Reset restores only the selected layer's
  visual defaults while preserving its identity, name, visibility, and source Range.
- A Range center must stay on the canvas. Its radius may extend beyond a nearby
  edge, but must be from 5 mm to half the canvas's longest edge.
- Tick Scale spatial limits derive from its source Range: offset keeps its
  effective radius between 0.2 mm and twice the Range radius, tick length does
  not exceed that effective radius, and tick width does not exceed tick length.
  Reducing a Range clamps dependent Tick Scale geometry in the same project
  mutation.
- Range owns the shared `cornerRadiusPercent` path parameter: `50` is a circle;
  values down to `1` form an inscribed rounded square without an ambiguous sharp-corner normal. All visual layers use the
  centralized Range path geometry at their own effective radius.
- Tick Scale defines its own visible `valueStart`, `valueEnd`, and positive
  `valueStep`, constrained to its source Range's mapping domain. It renders at
  most 200 marks and derives each position through that Range's mapping.
- An edge line must be a future independent visual layer, not a Tick Scale
  option; that keeps it compatible with adjustable path rounding.
- Canvas background is project data. `transparentBackground` defaults to `true`;
  while enabled, the saved background color is retained but not rendered.

## Editor state and interaction

- `projectSlice` owns `ProjectDto`; `editorSlice` owns sidebar, selection,
  hover, snap preference, and autosave status; `historySlice` owns snapshots.
- Only successful project changes enter history. Keep 50 undo and 50 redo
  states. Continuous edits use one history transaction from pointer/focus start
  to pointer/blur end.
- Undo/Redo are toolbar actions and are disabled for empty stacks. Middleware
  clears a stale selection and returns to Layers after project replacement,
  deletion, import, restore, or history operations.
- Do not use `useEffect` for derived state or Redux-slice synchronization;
  prefer selectors, reducers, thunks, or middleware. Reserve it for external
  systems such as browser APIs, subscriptions, timers, and `localStorage`.
- Snapping is enabled by default at 2 mm and 10°. It is a local preference,
  while canvas dimensions are project data.
- Use `dnd-kit` for visual-layer ordering; rely on its sortable motion rather
  than adding a separate drop-target indicator.
- The Layers browser duplicates a visual layer immediately above its source
  (the preceding, visually higher index), with a fresh ID and a `_Copy` name
  suffix. It is a project mutation and therefore participates in Undo/Redo.
- The initial store state in `NODE_ENV=development` uses a deterministic
  logarithmic pressure-gauge workbench (`1..10 bar`) with high-value detail and
  representative Arc, Needle, Label, Ellipse, Rectangle, Tick Scale, and Numeric
  Scale layers. Production
  and explicit New project flows remain empty.

## Quality and future slices

- Unit-test each component/module’s critical behaviour with Vitest and React
  Testing Library. Reuse factories, store/render helpers, fixtures, and browser
  mocks rather than recreating them per test. Test positive user-visible and
  domain behaviours, not the absence of controls that should never exist.
- Do not add regression tests solely to preserve fixes made during active
  development. Update existing expectations to the current contract and add new
  coverage only for stable, user-visible or domain-critical behaviour.
- Add each layer as a vertical slice: DTO/Zod, factory, domain class, form,
  SVG, overlay/handles, thumbnail, example/workbench, and tests.
- Autosave is `localStorage` only: every three minutes, retain five snapshots.
  Export is deterministic SVG plus PNG and a basic PDF; overlays never export.
