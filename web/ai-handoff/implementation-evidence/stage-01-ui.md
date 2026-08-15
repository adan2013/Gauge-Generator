# Stage 01 — UI shell

**Status:** initial UI slice completed on 2026-08-15.

## Delivered

- Light-only Tailwind v4 token palette and system-font baseline.
- Landing route `/`, editor route `/app`, and in-app Help route `/app/help`.
- Responsive action toolbar with icon-and-label actions and a small-screen More
  menu.
- One sliding sidebar with Layers in the middle, Properties entering from the
  right, and Project settings entering from the left. Project settings contains
  canvas dimensions and snapping controls.
- Empty 120 × 120 mm canvas state, grouped property-row preview, and temporary
  bottom-right status feedback.
- Clearly separated Layers and Ranges sections. The UI uses independent local
  prototype collections for them: a Range is created only through the Ranges
  flow, while Add layer requires a Range and creates a visual-layer record with
  a `rangeId` reference.
- Reusable `ActionButton` atom plus `StatusMessage` and `FieldRow` molecules.
  `FieldRow` is now used by the prototype text, number, and range controls.
- Unit-test foundation: Vitest, React Testing Library, test setup, and tests
  covering sidebar navigation, value controls, and Layers/Ranges separation.

## Deliberate limitations

- Toolbar actions are UI placeholders. The temporary local UI collections are
  not yet a project DTO or Redux state and do not persist.
- No project DTO, Zod validation, Redux store, real Range renderer, persistence,
  export, or examples yet. These belong to later plan stages.
- The Help page is a structural placeholder; its final content will be added
  with the Help/examples stage.

## Verification

```text
pnpm typecheck  ✓
pnpm lint       ✓
pnpm test:run   ✓  (3 files, 7 tests)
pnpm exec next build --webpack  ✓
```

Webpack was used for the production check because this environment previously
blocked a Turbopack helper process. This is an environment limitation, not an
application failure.
