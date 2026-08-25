<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gauge Generator Web — engineering contract

## Scope and quality gate

- `web/` is the current application. `../pc-legacy/` is an archive and must not
  be copied from or used as a runtime dependency.
- Use **pnpm only**. `pnpm-lock.yaml` is authoritative.
- Run `pnpm format` and `pnpm verify` before handoff. Verify covers formatting,
  ESLint, TypeScript, and Vitest.
- Keep tests colocated with the component or domain module that owns the rule.
- Use TypeScript, React 19, Next.js App Router, Tailwind CSS v4, Redux Toolkit,
  Zod, and next-intl.
- Use `cn()` for combined or conditional Tailwind classes. Use shared controls,
  modal, confirmation, status, and tooltip components instead of local copies.

## Product boundaries

- Routes are `/` for the English landing page, `/app` for the editor, and
  `/docs/{lang}` for the localized Markdown Help Center. `/docs` redirects to
  the default locale.
- The application is local-first: no backend, accounts, analytics, telemetry,
  cloud persistence, or payments belong in the core product.
- Autosaves use `localStorage` as a recovery aid. Downloaded JSON is the durable
  editable project file.
- Light mode uses the shared grey palette and red accent.
- User-facing text, ARIA labels, validation messages, and tooltips belong in the
  active locale catalogue. Domain code returns stable codes and paths, not prose.
- Help Center articles live in `content/docs/{locale}.md`. Layer headings use
  stable explicit identifiers such as `{#numeric-scale}` so icons and anchors do
  not depend on translated text.

## Project and state contracts

- The strict, versioned JSON DTO contains project data only: metadata, canvas,
  settings, Ranges, and visual layers. UI selection, hover, panels, overlays,
  isolation, and history never enter JSON.
- Physical geometry is stored in millimetres; angles are stored in degrees. The
  canvas may be rectangular and final SVG uses an mm-based viewBox.
- `projectSlice` owns the DTO. `editorSlice` owns transient editor state.
  `historySlice` owns undo and redo snapshots.
- Only successful project changes enter history. Continuous pointer or focus
  editing is one history transaction.
- Imported JSON passes strict Zod parsing and domain validation before replacing
  the current project.
- A project can contain at most five Ranges. Every visual layer has a required
  `rangeId`; a referenced Range cannot be removed.
- Range owns centre, radius, path shape, direction, value domain, and linear,
  logarithmic, or custom mapping. Linked layers derive their geometry and value
  positions from it.
- Layer index `0` is visually topmost. Final SVG therefore emits visual layers
  in reverse list order.
- Final preview, thumbnails, and export share the same deterministic layer
  `toSvg()` implementation. Editing overlays and handles never export.

## Layer architecture

- `Layer` is the React-free base for visual-layer domain models. `Range` is a
  separate domain object, not a visible layer.
- A layer owns its DTO-specific validation, final SVG, editing primitives,
  handles, drag behaviour, and numeric property definitions.
- The editor shell only selects registered adapters. It must not accumulate
  type-specific rendering, forms, constraints, or update logic.
- Use `RangeMappedLayer` for layers with a Range-mapped value interval and
  radius offset. Use `PlanarGeometryLayer` for independent rectangular geometry.
  Use `PlanarShapeLayer` only when fill and border semantics are shared.
- Shared contracts stay nested and reusable: text layers use `textStyle`, Needle
  uses `shaft` and `hub`, and planar layers share geometry rather than copying
  fields.
- Static limits belong in `*-limits.ts`. Range-dependent bounds and clamping
  belong in `*-constraints.ts`. Existing invalid data is reported by the domain
  model's `validate()`.
- Object-owned property definitions are the source of field key, group, unit,
  current value, min, max, step, integer requirement, and snapping strategy.
  React editors iterate these definitions and compose shared form controls.
- SVG renderers are deterministic, synchronous, React-free, safely escape user
  text, and return an empty string when invisible or missing required context.
- External catalogues are referenced in JSON by stable names. Resolve resources
  before rendering and pass safe definitions through typed render context.

## Composing a new visual layer

Add a layer as one complete vertical slice. A typical directory is:

```text
features/layers/example/
├── example.ts
├── example.test.ts
├── example-limits.ts
├── example-constraints.ts
├── example-constraints.test.ts
├── example-properties.ts
├── example-properties.test.ts
├── example-properties-editor/
│   ├── example-properties-editor.tsx
│   └── example-properties-editor.test.tsx
└── example-editing-overlay/
    ├── example-editing-overlay.tsx
    └── example-editing-overlay.test.tsx
```

Not every layer needs constraints or a custom overlay adapter, but every
responsibility must remain in the lowest owning module.

### Required integration sequence

1. Add a stable JSON identifier to
   `features/project/project-dto/layer-type.ts`. Do not rename an identifier
   casually after project files use it.
2. Add a strict Zod schema to the discriminated `LayerSchema` and export the
   narrowed DTO type. Use `Mm` and `Degrees` suffixes and integer scale-domain
   values.
3. Add valid defaults and a factory in
   `features/project/factories/project-factories.ts`. Register it in
   `createLayerFromType()` so creation and reset share one source of truth.
4. Implement the domain model. It must validate, render final SVG, expose
   editing primitives and handles, and apply handle drags without React.
5. Put static limits and Range-dependent constraints in their dedicated
   modules. Register clamping in `constrainLayerToRange()` when changing a Range
   can invalidate the layer.
6. Define property metadata in `*-properties.ts`. Compose existing numeric,
   text, select, colour, and boolean controls in a thin properties editor.
7. Implement overlay geometry in the model. The React adapter only supplies
   translations, screen scale, and history transaction lifecycle. Reuse
   `RangeMappedLayerEditingOverlay`, `EditingOverlayGeometry`, and
   `LayerHandles` where appropriate.
8. Register the model in `createLayerModel()`. This registry drives preview,
   thumbnails, project validation, and export.
9. Register the properties editor and overlay adapter in their exhaustive
   switches. TypeScript must remain exhaustive.
10. Add the picker item, layer-list label, description, property labels, ARIA
    text, handle labels, and validation messages to every locale catalogue.
11. Add the user-facing layer description to every Help Center article using a
    stable explicit heading identifier and an appropriate Lucide illustration.
12. Add the layer to an example project only when it materially demonstrates
    the feature. The initial editor state remains empty.

### Required tests

- DTO accepts the valid shape and rejects missing, extra, and invalid fields.
- Factory defaults pass schema and domain validation; reset preserves identity,
  name, visibility, and source Range.
- `toSvg()` is stable, safe, and empty for invisibility or missing context.
- Validation returns the expected stable code and field path.
- Property definitions expose correct values, bounds, steps, units, and snapping.
- Constraints clamp only required fields and preserve valid data.
- Handle drags change only expected DTO fields and one drag creates one history
  transaction.
- Picker, layer list, properties registry, overlay registry, preview, thumbnail,
  and export all recognise the new type.

## Existing domain decisions

- Tick and Numeric Scale store integer visible start, end, and positive step.
  Numeric Scale creates fractional labels only through multiplier and decimal
  presentation settings.
- Label supports point and Range-path layouts through a discriminated contract.
- Arc stores a non-zero Range-mapped interval and never independent angles.
- Needle stores one mapped integer value; its pivot is always the Range centre.
- Ellipse and Rectangle share planar geometry and style. Rectangle alone adds a
  corner radius percentage.
- Line stores centre offsets, length, rotation, width, and colour relative to
  the Range centre.
- Icon stores a Lucide catalogue name plus planar geometry and stroke style; it
  does not persist library SVG nodes.
- Text styles persist only a system font family name. The local-font catalogue,
  browser permission, and font binaries are transient environment state and
  never enter project JSON; unavailable families may fall back on another
  computer.
- Range corner radius percentage `50` is circular and values down to `1` form a
  rounded square with an unambiguous normal.

## Completion checklist

- No new user text is hardcoded outside locale catalogues or Help Center content.
- No transient UI state enters the project DTO or history snapshots.
- No layer-specific branch leaks into the editor shell.
- Preview, thumbnail, download, and export use the same domain rendering path.
- Examples and Help Center content match current behaviour.
- `pnpm format`, `pnpm verify`, and the production build pass.
