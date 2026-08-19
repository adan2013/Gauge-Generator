# Stage 04 — Tick Scale, Numeric Scale, and scale modes

**Status:** completed on 2026-08-19.

## Delivered

- Complete Tick Scale and Numeric Scale vertical slices: strict DTOs, factories,
  validation, property definitions and editors, SVG output, overlays, radius
  handles, generated thumbnails, and development workbench data.
- Shared linear, logarithmic, and piecewise custom value-to-position mappings.
- Shared visible-sequence generation, Range-bound constraints, generation
  limit, and ready-to-render `{ value, position, angle }` distribution consumed
  by both Tick Scale and Numeric Scale.
- Independent ascending/descending value direction for every scale mode, without
  changing the Range arc direction or canonical Custom points.
- Logarithmic Detail emphasis for assigning more arc space to low or high values.
- Destructive Range scale-mode selector with confirmation before every mode
  change and a clean default definition for the selected mode.
- Logarithmic start and end controls with positive domain limits.
- Integer scale-domain bounds, Custom values, and Tick/Numeric visible sequences;
  fractional labels remain a Numeric Scale multiplier/formatting concern.
- Accessible Custom Curve graph with editable endpoint values, positions locked
  to zero and one, single-click add, value snapping from the project distance
  increment, normalized positions quantized to `0.05`, integer numeric display,
  drag and keyboard/delete controls, monotonic two-axis constraints,
  descending-direction WYSIWYG, and one history transaction per drag. Custom
  has no separate curve-mirroring option.
- Tests for equivalent configured positions across all three mappings, mode
  transitions, point constraints, confirmation, graph interactions, and drag
  lifecycle.

## Verification

```text
pnpm verify ✓ (40 files, 128 tests)
pnpm exec next build --webpack ✓ (4 static routes)
```

Manual localhost QA confirmed that the pressure workbench uses an integer
`10..100` domain while Numeric Scale multiplier `0.1` presents labels `1..10`.
Project Distance snap `2` stores an entered Custom value of `51.3` as `52`,
Custom position inputs expose the `0.05` step, and the point fields are labelled
`Value (X-axis)` and `Position (Y-axis)`. With snapping disabled, Custom values
still round to integers.

Automated interaction coverage includes destructive mode-change confirmation,
single-click point add, exact endpoint editing with locked normalized position,
and Undo. The development workbench still emits the pre-existing hydration
warning caused by nondeterministic UUIDs between server and client rendering;
it is outside this stage's scale flow.
The default Turbopack build cannot bind its internal CSS worker port in this
environment, so the production gate used the repository's established webpack
fallback.
