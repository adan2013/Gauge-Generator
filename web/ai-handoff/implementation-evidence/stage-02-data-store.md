# Stage 02 — Data contract and base store

**Status:** completed on 2026-08-15.

## Delivered

- Strict, versioned `gauge-generator-web` v1 `ProjectDto` with separate
  `layers` and `ranges` collections, millimetre canvas data, metadata, and an
  extensibility field.
- Zod structural parsing and cross-object validation for UUID uniqueness,
  non-empty names, numeric bounds, Range references, custom-scale monotonicity,
  and Range-center/canvas bounds. A Range radius may extend beyond canvas.
- React-independent `Layer` and `Range` domain abstractions,
  plus typed render, overlay, handle, pointer, and geometry contracts.
- Typed Redux Toolkit store with `project`, `editor`, and `history` slices;
  history middleware retains at most 50 undo and redo snapshots without a
  duplicate action registry. Continuous controls use a history transaction, so
  live updates produce one undo snapshot. Project mutation candidates are
  validated before committing to the store.
- Store provider, typed hooks, reusable project/editor/store/render-context test
  helpers, JSON fixtures, and an implemented JSON-format document.
- The existing editor now reads and writes Range, visual-layer, canvas, snap,
  selection, and sidebar state through Redux rather than prototype collections.

## Deliberate limitations

- `tick-scale` is the sole currently recognized visual DTO discriminant. It
  establishes the reference and `rangeId` contract but has no renderer; the
  referenced Range owns the linear/logarithmic/custom mapping. Its complete
  vertical slice belongs to stage 4.
- Range has a domain object and persisted defaults but no SVG renderer, badge,
  editing overlay, or direct handles. Those belong to stage 3.
- Import/export, autosave, and examples are intentionally deferred.

## Verification

```text
pnpm typecheck                 ✓
pnpm lint                      ✓
pnpm test:run                  ✓  (10 files, 27 tests)
pnpm exec next build --webpack ✓
```
