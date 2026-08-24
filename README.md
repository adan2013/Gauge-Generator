<img alt="Gauge Generator" src="web/public/brand/gauge-generator-logo-readme.svg" width="520">

# Gauge Generator

Gauge Generator is an open-source tool for designing gauges, dials, instrument
faces, and other value-driven vector graphics. This repository contains two
separate editions of the application.

## Web edition

[`web/`](web/) is the current edition, rebuilt from scratch for modern browsers.
It is a local-first Next.js application: it requires no account, sends no project
data to a backend, and stores editable projects as readable JSON files.

The web editor adds a broader layer system, live editing handles, local autosaves,
example projects, and SVG, PNG, and PDF export. Its public routes are:

- `/` — English landing page;
- `/app` — the editor;
- `/docs/{lang}` — the Markdown Help Center.

See [`web/README.md`](web/README.md) for local development and deployment details.

## Original PC edition

[`pc-legacy/`](pc-legacy/) contains the original Windows/WPF application released
in 2019, together with its source code and historical documentation. It is kept
as an archive and is not a dependency of the web application.

The editions use different project formats. The web editor does not open legacy
`.ggp` files and does not copy or depend on the old implementation.

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md), including the
guide for adding application and Help Center translations.

## Licenses

Both editions are distributed under the GNU General Public License v3.0. Each
edition keeps its license in its own directory:

- [`web/LICENSE`](web/LICENSE)
- [`pc-legacy/LICENSE`](pc-legacy/LICENSE)
