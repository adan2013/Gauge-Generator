<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gauge Generator Web — Engineering Guide

## Read first

This directory (`web/`) is the new, independent Gauge Generator Web app.
`../pc-legacy/` is a WPF reference project only. Do not port, copy, or depend on
its C# code, `.ggp` binary format, `DataManagementSystem.dll`, or visual assets.

Before starting a feature, read:

1. `docs/ANALIZA_MODERNIZACJI_WEB.md` for the complete product and domain
   decisions, including the full layer-property catalogue;
2. `docs/PLAN_IMPLEMENTACJI_GAUGE_GENERATOR_WEB.md` for the implementation
   sequence and stage gates;
3. `ai-handoff/README.md`, `ai-handoff/DECISIONS.md`, and relevant reference
   material for current status and legacy behaviour.

Keep these documents current when a decision, format, implementation stage, or
meaningful limitation changes. Add concise evidence for completed plan stages to
`ai-handoff/implementation-evidence/`.

## Tooling and repository rules

- Use **pnpm only**. `pnpm-lock.yaml` and `packageManager` in `package.json` are
  authoritative. Never run npm, Yarn, or Bun; never create their lockfiles.
- Use the current Next.js App Router starter and TypeScript. The starter uses
  Next.js 16, React 19, Tailwind CSS 4, ESLint, and Turbopack.
- Before changing Next.js code, read the relevant bundled documentation under
  `node_modules/next/dist/docs/`, as required by the generated Next.js block
  above.
- Keep application code inside `web/`; retain `../pc-legacy/` unchanged unless
  the user explicitly requests legacy work.
- Use `cn()` from `lib/cn.ts` for every conditional or combined Tailwind class
  list. It is the only approved class-merging helper and is backed by `clsx`
  and `tailwind-merge`; do not concatenate Tailwind class strings manually.
- Give every public UI component its own kebab-case directory, with the
  component source and its unit test colocated there, for example
  `components/atoms/icon-button/icon-button.tsx` and
  `components/atoms/icon-button/icon-button.test.tsx`. Keep feature entry
  components in the same per-component-directory layout.
- Prefer small vertical slices. A layer is not complete until its model,
  validation, form, SVG, edit overlay, thumbnail, example/workbench, and tests
  arrive together.
- Do not add a backend, authentication, analytics, telemetry, cloud persistence,
  tracking, keyboard shortcuts, dark mode, or paid flows in MVP.

## Product scope

Gauge Generator Web is an English-only, local browser editor for layered SVG
gauge faces and indicators. It has:

- `/` — a lightweight landing placeholder;
- `/app` — the editor;
- `/app/help` — an in-app, user-facing mini wiki.

Build i18n-ready UI with `next-intl` and translation keys for every visible
string, but ship only the `en` locale initially. The Help center is in-app
content, not a developer command or external documentation.

### Translations are mandatory

- `messages/en.json` is the single source of truth for every user-facing string
  in the current release. This includes headings, labels, buttons, tooltips,
  `aria-label`s, toasts, empty states, dialog text, errors, Help content, and
  metadata. Do not hardcode user-facing English in JSX/TSX.
- Add a semantic, component-oriented key in `messages/en.json` before using new
  copy. Keep namespaces aligned with the owning UI/domain area, for example
  `Editor.toolbar.export` or `ProjectSettings.canvas.width`; do not use opaque
  keys such as `label1` or duplicate the English sentence as a key.
- Server Components use `getTranslations`; Client Components use
  `useTranslations`. Keep formatting and interpolation data in code, but the
  surrounding copy in message files.
- When renaming or removing a UI feature, update every reference and then remove
  its unused message key in the same change. Do not retain speculative,
  deprecated, or orphaned translations. Before handoff, search the relevant
  namespace and remove keys with no call site.
- When a new locale is introduced, it must mirror the same key structure as
  `en.json`; do not add locale-specific hardcoded fallbacks in components.

There are no user accounts or server data. Users manually download/upload JSON,
and can export PNG, SVG, or a basic PDF.

## UI and design system

- Light mode only. Use Tailwind v4 design tokens defined centrally in `@theme`.
  Palette: app `#F6F7F9`, surface `#FFFFFF`, subtle surface `#F0F2F5`, border
  `#D8DCE2`, text `#20242B`, muted `#626B77`, accent `#C62828`, accent hover
  `#A61F1F`, accent subtle `#FCE8E8`, danger `#B42318`, focus `#E57373`.
- Use Atomic Design for presentational UI:
  `components/atoms`, `molecules`, `organisms`, and `templates`. Keep domain,
  renderer, serialization, and state code in `features/`, `store/`, or `lib/`.
- Prefer composable React APIs: compound components and context with explicit
  `state`, `actions`, and `meta` when needed. Avoid boolean-prop proliferation;
  prefer variants and composition. Use React 19 conventions; do not add
  unnecessary `forwardRef` wrappers.
- Layout: horizontal action toolbar at the top, one fixed-width sidebar on the
  left, and SVG preview on the right. The sidebar is a horizontal slider with
  three mutually exclusive modes: Layers, Properties, and Project settings.
  Layers is the middle screen: selecting a layer slides Properties in from the
  right, while Project settings opens from the left. Both secondary views use a
  full-width Back to layers button. It is not a two-column sidebar and not a
  modal.
- Toolbar order: New project, Open, Download, Import, Export, Undo, Redo,
  Restore, Examples, Help center. Buttons show icon and label in one line. On
  narrow screens lower-priority actions collapse into More (`…`); keep the core
  project and history actions accessible.
- Use grouped vertical property rows: a label on the left and the appropriate
  text, number, range, boolean, select, color, or curve-editor control on the
  right. Provide visible focus states, semantic labels, tooltips for icon-only
  UI, accessible dialogs, and a sensible tab order.
- Use web-safe/system font choices in MVP. Loading fonts from a local computer
  is a future enhancement and must use the File API with appropriate licensing
  and error handling; do not add it prematurely.

## Project model and JSON

- A new project is empty (no layers, including no Range) and uses a 120 × 120 mm
  square canvas. The preview must show a friendly empty state with Create first
  Range and Browse examples actions.
- Canvas may later be any rectangle. All stored coordinates, dimensions,
  radii, offsets, and thicknesses are numbers in **millimetres**. Percentages are
  an input-only convenience that is immediately converted to millimetres.
- Final SVG uses an mm `viewBox`; SVG and PDF must preserve physical size.
- Use a versioned, open `ProjectDto`: `format`, `version`, `meta`, `canvas`,
  `layers`, `ranges`, and optional `extensions`. Metadata includes at least title,
  `createdAt`, and `updatedAt`. Do not change field meaning without a format
  version and migration.
- Validate imports with Zod discriminated unions first, then domain validation
  (unique IDs, valid references, range limits, and scale constraints). Invalid
  imports must not replace the active project and must show a clear error.
- DTOs are plain data. Convert JSON through `Zod -> DTO -> domain instances`
  and serialize in the reverse direction. Never serialize class instances or UI
  state.

## Domain, layers, ranges, and rendering

Implement an abstract `Layer` base for visual layers and a separate `Range`
domain abstraction. The `Layer` base contract should cover, at minimum:

- final SVG rendering (`toSvg`);
- validation (`validate`);
- editing overlay rendering (`toEditingOverlay`);
- interactive handle definitions (`getHandles`);
- drag application (`applyHandleDrag`).

`RenderContext`, `EditingOverlayContext`, `LayerHandle`, and pointer input are
shared typed contracts, not ad-hoc props. Rendering/domain code must remain
independent of React.

The MVP layer types are: Range, Linear Scale, Numeric Scale, Label, Arc, Clock
Hand, Ellipse, and Rectangle. Refer to the analysis document for every property
and its intended behaviour. Core rules:

- `layers` and `ranges` are two separate object collections throughout the DTO,
  domain model, Redux store, selectors, and UI. Do not model Range as a visual
  `Layer` or mix Range records into the `layers` array.
- Every visual `Layer` and every `Range` has a required, user-editable `name`.
  For visual layers it belongs to the abstract `Layer` base data; because Range
  is a separate abstraction, it owns the same required field directly. Persist
  both names in JSON and validate them as non-empty trimmed strings.
- The Layers panel has two clearly separated sections: visual **Layers** first,
  then **Ranges** below it. Only the Ranges section creates, lists, selects, and
  edits Ranges; Add layer creates a visual layer and requires an existing Range.
- Keep the Ranges section pinned to the bottom of the Layers panel and size it
  to its content. The visual Layers list consumes the remaining space and
  scrolls independently; if Ranges grows large, cap its height and scroll that
  section independently rather than pushing it off-screen.
- Range provides center, radius, direction, value-to-angle mapping, scale
  definition, and hand pivot. It does not have a final visual representation.
- A project may have many independent Range layers and therefore multiple dials
  on one rectangular canvas.
- Every non-Range layer has a required `rangeId`; including Label, Ellipse, and
  Rectangle. It derives its positioning context from that Range.
- Do not allow deleting a Range while dependent layers exist. The UI must make
  the selected source Range clear by name and type colour.
- Keep the visual `layers` collection flat and its current render order: lower
  list index renders visually above higher list index. Use Move up/Move down;
  no groups in MVP. The independent `ranges` collection has no final-render
  order and is addressed through layer `rangeId` references.
- Layer rows show a generated SVG thumbnail, name, coloured type label,
  visibility, selection, and layer actions. Range uses a range badge/diagram
  with its arc and metadata instead of a fake final-render thumbnail.
- Thumbnail hover isolates the layer plus required Range context in preview.
  Click selection occurs only from the layer list, never by clicking the canvas.
  Hide thumbnails in Properties mode and refresh them only on returning to
  Layers. Hide overlays and handles outside Properties mode.
- In the Layers header, show the quiet `Projects` action with its settings icon
  and a primary-accent `+ Layer` action. Do not reduce these controls to
  icon-only buttons; their labels communicate the distinct actions.

## Scales, geometry, and direct manipulation

- Range mapping supports linear, logarithmic, and custom nonlinear curves.
  Linear Scale, Numeric Scale, and Clock Hand use the same scale definition.
- Custom curves use a clickable two-axis editor, not CSV. X is range value; Y
  is normalized position 0..1. Users can add, drag, select, and remove points;
  endpoints stay fixed and X/Y must remain monotonic. Switching a mode that
  resets data requires confirmation. Logarithmic mode requires positive values
  and base.
- Snapping is on by default: 2 mm for distance and 10 degrees for angles. The
  toggle and increments appear in Project settings and are local preferences,
  stored separately from project JSON. Canvas width and height also appear in
  Project settings and are project data.
- The selected editing layer may expose non-exported SVG overlay handles for
  basic visual adjustments: position, radius, angle, start/end range, pivot,
  and suitable layer-specific bounds. Handles have a minimum screen size
  regardless of zoom and a label with the current value.
- A shared controller owns pointer capture, screen-to-mm conversion, snapping,
  and dispatching drag changes to the layer. Update preview during drag but
  commit one history operation on `pointerup`, not on every pointer move.
- Text on an arc is deliberately deferred; build Label APIs so it can be added
  later without breaking the model.

## State, history, and local persistence

Use Redux Toolkit with React Redux:

- `projectSlice` owns the current `ProjectDto`;
- `editorSlice` owns selected layer, sidebar mode, hover preview, snapping, and
  autosave status;
- `historySlice` owns `past` and `future` stacks.

Only project-mutating actions enter history. Hover, panel state, and toasts do
not. Retain at most 50 undo and 50 redo operations. Reset redo after a new
project mutation.

Autosave is a local safety net: every three minutes, persist the whole project
with timestamp and format version to `localStorage`; retain five snapshots and
drop the oldest when writing the sixth. Restore lets the user choose a snapshot.
Show success/error status briefly in the bottom-right. It never replaces manual
Download JSON.

Keep project persistence simple: project files are versioned JSON validated by
Zod; autosave uses localStorage only. Do not introduce SQLite, IndexedDB, or
another database. Images and user-provided fonts are outside the current scope;
evaluate their portable JSON representation only when that feature is planned.

## Export, examples, and help

- Use one deterministic final-SVG generator for preview and exports. Editing
  overlays, handles, selection state, and helper labels are never exported.
- Export opens a large dialog with clear PNG, SVG, and PDF sections plus a
  reserved inactive spot for a future Buy me a coffee action. Do not implement
  payment or tracking.
- SVG exports source SVG in mm. PNG rasterizes that final SVG at the chosen
  resolution. PDF is intentionally basic in MVP: one SVG canvas, one A4 page,
  automatic orientation, and Fit to page or Actual size 1:1 only.
- Keep built-in examples as static, Zod-validated JSON. Loading an example makes
  a copy in current local state.
- In development only, show a Layer workbench entry driven by
  `ACTIVE_WORKBENCH_LAYER`. It must be Zod-valid and must never appear in a
  production build. Add/update it whenever a new layer is developed.

## Testing and verification

Test each new component/module for its critical behaviour; do not chase 100%
coverage at the expense of useful tests. Use Vitest for domain/components and
React Testing Library for interactions. Do not add E2E tooling or E2E tests in
this project at this stage.

Maintain reusable test tools rather than hand-building mocks:

- `createProject`, `createRange`, and per-layer factories;
- `createEditorState` and `createTestStore`;
- `renderEditor` with Redux, i18n, and required contexts;
- render/overlay context helpers;
- File API, localStorage, and fake-time mocks; valid and invalid JSON fixtures.

Every layer needs tests for factory/defaults, validation, final SVG, and at
least one overlay-handle interaction. Before closing a stage, run the relevant
pnpm checks and record the result in the handoff evidence directory.
