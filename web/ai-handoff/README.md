# AI handoff — Gauge Generator Web

Ten katalog skraca wejście kolejnego agenta AI w projekt. Najpierw przeczytaj:

1. `../docs/ANALIZA_MODERNIZACJI_WEB.md` — pełne ustalenia produktu i analiza
   pierwowzoru;
2. `../docs/PLAN_IMPLEMENTACJI_GAUGE_GENERATOR_WEB.md` — kolejność wdrażania oraz
   bramki weryfikacyjne;
3. `DECISIONS.md` i `REFERENCE_ASSETS.md` — zwięzły kontekst pracy.

## Current status

Stages 1–6 are complete: the UI/store foundation, full Range editing flow, Tick
Scale, Numeric Scale, the Linear/Logarithmic/Custom Curve mappings, and all
remaining visual layers are in place. Custom Curve has an interactive two-axis
editor with locked endpoints, monotonic point constraints, integer value
snapping, `0.05` position steps, and transactional dragging. All scale-domain
values are integers; fractional Numeric Scale labels are presentation produced
by its multiplier and decimal-place settings. Curve mapping, visible-sequence
generation, Range-bound constraints, and ready-to-render angular distribution
are shared outside visual layers. Stage 5 delivered Label, Arc, Needle, Ellipse,
Rectangle, Line, and Icon. Label includes shared
typography with Numeric Scale, millimetre point offsets, and Range-mapped text
paths. Arc is defined only by a Range-mapped value interval, radius offset,
stroke thickness, color, and flat or rounded end caps; it has no manual angle
mode. Needle maps one integer value through Range, uses its center as a fixed
pivot, and stores nested shaft and hub presentation. Ellipse and Rectangle share
millimetre geometry, styling, and orientation-aware editing handles. Line stores
center offsets, length, and rotation while offering center and endpoint handles.
Icon stores a Lucide name and resolves normalized catalogue SVG nodes on demand
for the shared domain renderer. It uses the same planar width/height geometry and
editing overlay as Ellipse and Rectangle. Stage 6 adds atomic Open, JSON
Download, canonical dirty tracking, `beforeunload` protection, guarded New/Open,
five local autosave snapshots with Restore, project-local snapping settings, and
four validated bundled examples. Autosave and examples intentionally remain
dirty until the user downloads the project. Stage 7 is complete: preview and
examples share the deterministic final renderer; export supports SVG, five PNG
DPI presets, and vector A4/A3 PDF. SVG/PNG can export visible layers in ZIP;
layered PDF uses one aligned page per visible layer. The development workbench
is removed and every environment starts empty. The release audit is recorded in
`implementation-evidence/stage-07-export-release.md`. Help content is deferred,
and Buy Me a Coffee remains an intentionally inactive placeholder.

## Initial repository context

Nowa aplikacja jest zainicjalizowanym starterem Next.js w katalogu `web/` (ten
katalog). Katalog rodzeństwa `../pc-legacy/` zawiera legacy WPF wyłącznie jako
materiał referencyjny. Nie należy przenosić kodu C#, formatu `.ggp`,
`DataManagementSystem.dll` ani dawnych assetów do nowej aplikacji.

## Package manager

Wszystkie komendy zależności, skrypty i aktualizacje należy wykonywać wyłącznie
przez pnpm. Nie wolno tworzyć `package-lock.json`, `yarn.lock` ani `bun.lock`.

## Zasady aktualizacji handoffu

- po każdym etapie planu dodaj do `implementation-evidence/` krótki Markdown z
  datą, wynikiem komend, znanymi ograniczeniami i ewentualnym screenshotem;
- aktualizuj `DECISIONS.md`, gdy decyzja ma wpływ na kontrakt danych lub dalsze
  etapy;
- przechowuj tu wyłącznie małe, celowe materiały referencyjne — nie buildy,
  `node_modules`, eksporty użytkowników ani poufne dane;
- screenshoty są inspiracją dla zachowania produktu, a nie specyfikacją stylu.
