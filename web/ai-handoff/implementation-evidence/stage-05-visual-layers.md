# Stage 05 — remaining visual layers

**Status:** completed and closed on 2026-08-23.

## Delivered

- Complete Label, Arc, Needle, Ellipse, Rectangle, Line, and Icon vertical
  slices: strict DTO/Zod contracts, factories, domain validation, property
  editors, SVG renderers, editing overlays and handles, generated thumbnails,
  and unit tests.
- Shared text-style contract and controls used by Label and Numeric Scale.
- Label point layout and Range-mapped text paths.
- Range-mapped Arc value interval and Needle value, with no duplicated manual
  angle model.
- Shared planar geometry for Ellipse, Rectangle, and Icon; shared planar shape
  presentation for Ellipse and Rectangle.
- Lucide icon-name persistence with normalized, cached SVG-node resolution.
- Canvas geometry selection: clicking a rendered visual layer selects it and
  opens its Properties panel.
- Layer duplication through a root-portal modal, explicit naming, and placement
  immediately above the source in project hierarchy.
- Consistent Escape navigation from Range, visual-layer, and project-settings
  editors back to Layers, while open dialogs retain keyboard priority.
- `EditorShell` composition boundary split into a provider/controller and
  independent header, sidebar, and canvas sections so further project toolbar
  flows do not enlarge the shell component.

## Verification

```text
pnpm verify ✓ (82 files, 269 tests)
pnpm exec next build --webpack ✓ (3 application routes plus static not-found)
```

The verification covers factories and strict parsing, domain validation, SVG
output, editing interactions, thumbnails, selection, duplication, history, and
the shared editor navigation behavior. The production build compiles and
prerenders `/`, `/app`, and `/app/help` successfully.

## Known follow-up

- The deterministic development workbench remains temporarily as the
  development initial state. It must not be expanded into an examples registry
  and should be removed before final MVP closure.
- Project file operations, autosave/restore, the examples catalogue, and the
  remaining toolbar actions belong to Stage 06.
- The JSON contract remains development-only and intentionally has no backward
  compatibility or migrations until explicit format stabilization.
