# Gauge Generator

This repository contains two versions of Gauge Generator:

- [`pc-legacy/`](pc-legacy/) — the original WPF desktop application, retained as
  a read-only product and implementation reference.
- [`web/`](web/) — the new, independent web application built with Next.js.

The web application is not a port of the legacy project and does not aim to be
compatible with its `.ggp` files. Its implementation plan and supporting
materials are available in [`web/docs/`](web/docs/) and
[`web/ai-handoff/`](web/ai-handoff/).

## Package manager

Use **pnpm only** for the web application. Do not use npm, Yarn, or Bun; the
lockfile and the `packageManager` field in `web/package.json` are authoritative.
