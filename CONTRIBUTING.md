# Contributing to Gauge Generator

Thank you for improving Gauge Generator. The current application lives in
`web/`; `pc-legacy/` is the archived 2019 Windows edition and should remain
unchanged unless a contribution explicitly targets that version.

## Development setup

Use **pnpm only** in `web/`:

```bash
cd web
pnpm install
pnpm dev
```

Keep changes focused, preserve the local-first privacy model, and add tests next
to the module that owns the changed behaviour. Before opening a pull request:

```bash
pnpm format
pnpm verify
pnpm build
```

## Adding a language

A supported language consists of two coordinated translations:

1. the application and Help Center interface catalogue in `web/messages/`;
2. the Help Center article in `web/content/docs/`.

Do not add a locale to the language selector until both files are complete.

### 1. Choose the locale identifier

Use a stable BCP 47 language tag, for example `pl`, `de`, or `pt-BR`. Add the
language to `SUPPORTED_LANGUAGES` in `web/i18n/locales.ts`:

```ts
export const SUPPORTED_LANGUAGES = [
  { locale: "en", name: "English" },
  { locale: "pl", name: "Polski" },
] as const;
```

Use the language's native name. Keep `DEFAULT_LOCALE` unchanged unless the
project deliberately changes its default language.

### 2. Translate the application catalogue

Copy `web/messages/en.json` to `web/messages/{locale}.json` and translate every
user-facing value.

- Keep the JSON key hierarchy identical to the English catalogue.
- Preserve ICU arguments such as `{name}`, `{count}`, and plural branches.
- Preserve rich-text tags such as `<github>...</github>`.
- Translate visible labels, errors, ARIA labels, tooltips, and Help Center chrome.
- Do not translate stable validation codes, DTO keys, layer type identifiers, or
  file-format values.

Update `web/i18n/request.ts` so the new catalogue can be imported for the active
locale with `DEFAULT_LOCALE` as a fallback. When adding the first non-English
application locale, the same pull request must also make
`features/editor/language-switcher/language-switcher.tsx` apply and persist the
chosen locale; the current one-language implementation only presents English.

The editor stays at `/app`. Do not introduce locale-prefixed editor routes unless
that routing decision is made for the whole project.

### 3. Translate the Help Center

Copy `web/content/docs/en.md` to `web/content/docs/{locale}.md` and translate the
complete article.

- Keep image paths unchanged and translate their alt text.
- Preserve the layer heading identifiers, for example:

  ```md
  ### Skala numeryczna {#numeric-scale}
  ```

  The visible title may be translated, but `{#numeric-scale}` is a stable key
  used for the Lucide illustration and table-of-contents anchor.

- Keep heading levels consistent so the generated table of contents retains the
  same hierarchy.
- Use normal Markdown; do not add raw scripts or unsafe HTML.

Adding the locale to `SUPPORTED_LANGUAGES` creates `/docs/{locale}`, includes it
in static generation, and exposes it in the Help Center language dropdown.

### 4. Update tests and verify both surfaces

Update language-switcher and documentation tests for the new locale. Verify:

- the editor loads the selected message catalogue and keeps the selection after
  a reload;
- Help Center navigation opens `/docs/{locale}`;
- the application Help Center button opens the matching locale in a new tab;
- headings, layer icons, screenshots, and the table of contents render correctly;
- missing or unsupported locale routes return the expected fallback or 404.

Run `pnpm verify` and a production build from `web/` before submitting the pull
request.

## Adding or changing visual layers

Visual layers are complete vertical slices rather than renderer-only additions.
Follow the contract and checklist in `web/AGENTS.md`: update the strict project
DTO, defaults, domain model, registry, constraints, property definitions, editor,
overlay, picker, translations, examples when useful, and colocated tests.

## Reporting issues

Include the browser, a minimal project JSON when safe to share, the exact steps,
and the observed result. Project files are plain text, but review them before
attaching them because user-entered labels and metadata may contain personal
information.
