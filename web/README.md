<img alt="Gauge Generator" src="public/brand/gauge-generator-logo-readme.svg" width="520">

# Gauge Generator Web

Gauge Generator Web is the current, browser-based edition of Gauge Generator: a
free and open-source vector editor for gauges, dials, and instrument faces.

The project is local-first. It has no accounts, backend, analytics, or cloud
workspace. Project data stays in the browser, local recovery snapshots use
`localStorage`, and durable editable files are downloaded as readable JSON.

## What it can do

- define circular and rounded-square Ranges with linear, logarithmic, or custom
  value mapping;
- compose Tick Scale, Numeric Scale, Label, Arc, Needle, Ellipse, Rectangle,
  Line, and Lucide Icon layers;
- edit geometry through property controls and on-canvas handles;
- reorder, duplicate, hide, isolate, and reset visual layers;
- open editable examples and restore recent local autosaves;
- download the JSON project or export SVG, PNG, and PDF artwork.

## Routes

- `/` — English landing page;
- `/app` — local-first editor;
- `/docs` — redirect to the default Help Center language;
- `/docs/{lang}` — localized Help Center rendered from `content/docs/{lang}.md`.

## Development

The application requires a current Node.js release and uses **pnpm only**.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Before submitting a change, run:

```bash
pnpm format
pnpm verify
pnpm build
```

`pnpm verify` checks formatting, ESLint, TypeScript, and the Vitest suite.

## Project structure

```text
app/                 Next.js routes, landing page, Help Center, and providers
components/          shared presentational components
content/docs/        one Help Center Markdown file per supported locale
features/editor/     editor composition and interaction flows
features/layers/     layer domain models, properties, overlays, and tests
features/project/    JSON DTO, validation, persistence, rendering, and export
features/ranges/     Range geometry and value mapping
i18n/                supported locales and next-intl request configuration
messages/            application and Help Center interface catalogues
store/               project, editor, history, and session state
```

Engineering contracts and the required composition of a new visual layer are in
[`AGENTS.md`](AGENTS.md). Translation contributions are documented in
[`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## Deployment

The web edition is designed for Vercel. Set `NEXT_PUBLIC_SITE_URL` to the final
custom origin when one is used. Otherwise the metadata configuration uses
Vercel's `VERCEL_PROJECT_PRODUCTION_URL` automatically.

No server-side persistence or external service is required.

## License

Gauge Generator Web is distributed under the
[GNU General Public License v3.0](LICENSE).
