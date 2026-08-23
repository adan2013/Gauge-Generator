# Stage 06 — project files, autosave, and examples

**Status:** completed and closed on 2026-08-23.

## Delivered

- SHA-256 fingerprint of the canonical, key-sorted project JSON stored as the
  last computer-saved baseline, with memoized derived dirty state and exact
  Undo-to-clean behavior.
- JSON Download that validates the project, starts a browser download, and only
  then updates the saved baseline.
- A single Open action for validated JSON. Successful Open atomically replaces
  the project and clears history and stale editor selection; invalid JSON leaves
  the current project unchanged. There is no separate Import action or layer
  merging flow.
- Dirty-change confirmation for New, Open, Restore, and Examples, plus native
  `beforeunload` protection while dirty.
- Browser tab title synchronized with the project name and prefixed with `*`
  while the project differs from its saved fingerprint.
- Project Title field backed by `ProjectDto.meta.title`; the same value drives
  the tab and Download filename instead of deriving identity from an opened
  file's name.
- Local autosave every three minutes after project changes, retaining at most
  five strict, validated snapshots. Restore shows snapshot project titles and
  timestamps.
- Explicit autosave messaging that distinguishes browser-local recovery from a
  downloaded project file. Autosave never clears dirty state.
- Project-local snapping stored in `ProjectDto.settings.snapping`, included in
  JSON, dirty tracking, history, autosave, Open, Download, and Restore.
- Four bundled, static, domain-validated JSON examples covering a clock,
  tachometer, dual-scale speedometer, and rounded electric dashboard. The wide
  two-column gallery renders each JSON through the production layer models, so
  its preview is the exact editable project that opens and remains dirty until
  Download.
- Updated Help project guidance and project lifecycle documentation.
- The existing deterministic development workbench remains development-only and
  was not expanded into the Examples registry.

## Verification

```text
pnpm verify ✓ (87 files, 285 tests)
pnpm exec next build --webpack ✓ (3 application routes plus static not-found)
```

Automated coverage includes fingerprint stability, dirty/Undo behavior, JSON
round-tripping and invalid input, guarded New, atomic Open, Download-to-clean,
autosave retention, Restore, Examples, `beforeunload`, and project-local
snapping persistence.

## Known follow-up

- Browsers do not expose confirmation that a user kept the downloaded file;
  the baseline is updated after the Blob download is successfully initiated.
- Export PNG/SVG/PDF and the final release-quality audit belong to Stage 07.
- The development workbench must be removed before final MVP closure.
