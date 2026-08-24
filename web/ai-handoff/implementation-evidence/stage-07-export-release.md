# Stage 07 — export and release quality

Date: 2026-08-23

## Delivered

- Added one deterministic, React-free final SVG boundary shared by the canvas,
  example thumbnails, and all artwork exports. Editing overlays and preview-only
  modifiers never enter exported files.
- Added the wide Export modal. All format and arrangement controls live in the
  left column; the right column is an intentionally inactive Buy Me a Coffee
  placeholder with no payment, tracking, or external action.
- SVG exports the physical millimetre document. Combined export respects the
  project background. Layer export keeps the full coordinate system, uses a
  transparent background, and downloads visible layers in one ZIP.
- PNG uses fixed 72, 96, 150, 300, and 600 DPI presets, with 300 DPI selected by
  default. The modal reports output pixels and rejects unsafe raster dimensions.
- Vector PDF supports A4 and A3, automatic orientation, a 10 mm printable margin,
  Fit to page, and Actual size 1:1. Actual-size export is blocked when the project
  exceeds the selected printable area, with a message containing both sizes.
  Combined PDF uses one page; layered PDF creates one document with one aligned
  page per visible layer.
- Removed `createDevelopmentProject`, its dedicated regression test, the
  environment-dependent initial store branch, and active documentation that
  instructed contributors to maintain the workbench. Every environment starts
  with the same empty project; complete demonstrations live only in Examples.

## Release audit and fixes

- Desktop and 390 × 844 responsive QA confirmed the empty editor state, toolbar
  overflow, access to every project action, Export layout, and preset controls.
- Modal keyboard behavior retains Escape close and the existing overlay-click
  close. Confirmation dialogs retain their global Enter handler.
- Layer sorting now registers both Pointer and Keyboard dnd-kit sensors, and the
  drag handle has a visible keyboard focus outline.
- Text contrast ratios are at least 5.04:1 for normal foreground combinations.
  The focus token was darkened from `#e57373` (2.99:1 on white) to `#df6b6b`
  (3.25:1) to clear non-text focus contrast.
- Browser console QA produced no application errors or warnings. Static source
  inspection found no TODO/FIXME/debug statements and no required runtime
  network requests. Production routes use local chunks, CSS, favicon, system
  fonts, and bundled icons; the optional Lucide attribution link does not block
  offline editing.
- The production `/app` HTML references about 354.8 KB gzip of initial JavaScript;
  its route-owned chunk is 29.7 KB gzip. No bundle budget exists, and the audit
  found no release-blocking payload regression.

## Verification

- `pnpm verify`
  - Prettier: passed.
  - ESLint: passed.
  - TypeScript: passed.
  - Vitest: 92 files passed, 294 tests passed.
- `pnpm exec next build --webpack`
  - production compilation and TypeScript passed;
  - `/`, `/app`, `/app/help`, and the not-found route were statically
    prerendered.
- The default Turbopack build was also attempted, but this execution environment
  denied Turbopack's PostCSS helper from binding a local port (`os error 1`). The
  supported Webpack production build completed successfully, confirming the app
  build independently of that environment restriction.

## Deferred by product decision

- Final Help Center content belongs to a separate later product plan.
- Buy Me a Coffee remains a visual placeholder until a separate support/payment
  decision authorizes an active integration.
