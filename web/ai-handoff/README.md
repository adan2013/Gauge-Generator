# AI handoff — Gauge Generator Web

Ten katalog skraca wejście kolejnego agenta AI w projekt. Najpierw przeczytaj:

1. `../docs/ANALIZA_MODERNIZACJI_WEB.md` — pełne ustalenia produktu i analiza
   pierwowzoru;
2. `../docs/PLAN_IMPLEMENTACJI_GAUGE_GENERATOR_WEB.md` — kolejność wdrażania oraz
   bramki weryfikacyjne;
3. `DECISIONS.md` i `REFERENCE_ASSETS.md` — zwięzły kontekst pracy.

## Current status

Stage 1 UI shell and stage 2 data/store foundation are complete. The next
vertical slice is stage 3: Range SVG rendering, its badge, editing overlay, and
direct manipulation.

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
