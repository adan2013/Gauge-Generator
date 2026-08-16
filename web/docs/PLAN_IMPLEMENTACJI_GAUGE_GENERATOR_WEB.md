# Plan implementacji — Gauge Generator Web

> Dokument wykonawczy dla docelowego repozytorium. Bazuje na
> `ANALIZA_MODERNIZACJI_WEB.md`; nie jest planem migracji kodu WPF ani
> kompatybilności z plikami `.ggp`.

> Po reorganizacji repozytorium: nowa aplikacja znajduje się w `web/`, a
> niezmieniony materiał referencyjny WPF w sąsiednim `../pc-legacy/`.

## 1. Cel, granice i zasady pracy

Budujemy niezależny, anglojęzyczny edytor webowy do komponowania tarcz i
wskaźników z warstw SVG. Aplikacja działa lokalnie w przeglądarce: nie ma kont,
backendu, telemetryki ani IndexedDB. Projekt użytkownika można pobrać jako
wersjonowany JSON, ponownie wczytać i wyeksportować do PNG, SVG lub podstawowego
PDF-a.

Każdy etap kończy się **bramką weryfikacyjną**. Nie należy przechodzić dalej,
gdy kryteria etapu nie są spełnione. Nowy typ warstwy zawsze powstaje w jednym
małym kroku: model, walidacja, formularz, renderer, uchwyty, miniatura,
przykład/workbench i testy w tym samym PR-ze.

### Ustalenia niepodlegające zmianie w MVP

- Nazwa robocza: **Gauge Generator Web**.
- Next.js App Router, TypeScript, React 19, Tailwind CSS v4 i Redux Toolkit.
- Jedynym package managerem jest pnpm. Lockfile `pnpm-lock.yaml` jest
  autorytatywny; npm, Yarn i Bun nie są używane.
- Trasy: `/` (prosty landing), `/app` (edytor), `/app/help` (mini-wiki).
- Interfejs ma architekturę i18n, ale zawiera wyłącznie locale `en`.
- Light mode; paleta szarości z czerwonym akcentem.
- Kanoniczną jednostką i jednostką JSON-a jest mm. Domyślne płótno ma 120 ×
  120 mm, lecz każdy projekt może mieć prostokątne płótno.
- Projekt startuje pusty — bez Range i innych warstw.
- Renderowanie jest SVG, a model wizualnych `layers` pozostaje płaską listą w
  kolejności oryginału: niższy indeks listy jest renderowany wyżej.
- `layers` i `ranges` są osobnymi kolekcjami obiektów w JSON-ie, domenie oraz
  store. Range nie jest wizualną warstwą i nie pojawia się w `layers`.
- Każda wizualna warstwa i każdy Range ma wymaganą, własną, edytowalną nazwę.
  Dla warstw jest to pole abstrakcyjnej klasy `Layer`, a dla niezależnego
  obiektu `Range` jego własne pole; obie nazwy są zapisywane w JSON-ie.
- Jest wiele Range. Wszystkie wizualne warstwy mają obowiązkowe `rangeId`.
- Snapping jest domyślnie włączony: 2 mm dla odległości i 10° dla kąta.
- Historia ma maksymalnie 50 operacji w `past` oraz 50 w `future`.
- Autosave co 3 minuty do `localStorage`, maksymalnie 5 snapshotów.

## 2. Docelowa architektura

```text
web/
  app/                         # routing, layouty, globalne style
    (marketing)/page.tsx
    app/page.tsx
    app/help/page.tsx
  features/
    editor/                     # use-case edytora, UI i kontroler uchwytów
    project/                    # DTO, Zod, migracje, serializacja, storage
    layers/                     # domena i implementacje warstw
      core/
      range/
      tick-scale/
      numeric-scale/
      label/
      arc/
      clock-hand/
      ellipse/
      rectangle/
    export/                     # SVG, PNG oraz podstawowy PDF
    examples/                   # statyczne przykłady JSON i workbench dev
    help/                       # treści mini-wiki
  components/
    atoms/ molecules/ organisms/ templates/
  store/                        # store, slices, middleware historii
  lib/                          # czyste funkcje: geometria, SVG, formatery
  test/                         # factory, render helper, mocki i fixtures
  docs/                         # analiza, plan i kontrakty techniczne
  ai-handoff/                   # materiały referencyjne i dowody etapów
../pc-legacy/                   # WPF wyłącznie do analizy
```

Warstwa domenowa jest niezależna od Reacta. `Layer` to abstrakcyjna klasa z
konkretnymi implementacjami; jedna warstwa umie wygenerować finalne SVG,
walidować swoje dane, przygotować overlay edycji oraz zinterpretować ruch
uchwytu. JSON nigdy nie zawiera instancji klas: przepływ to
**plik → Zod → DTO → instancje → renderer**, a przy zapisie odwrotnie.

### Store i historia

- `projectSlice`: bieżący `ProjectDto`, w tym niezależne kolekcje `layers` i
  `ranges`.
- `editorSlice`: wybrana warstwa, widok sidebara, hover preview, snap i status
  autosave.
- `historySlice`: ograniczone stosy `past`/`future`.
- Middleware lub jeden jawny adapter historii zapisuje tylko akcje zmieniające
  projekt. Zmiana UI (otwarcie panelu, hover, toast) nie trafia do historii.
- Drag uchwytu aktualizuje podgląd na bieżąco, lecz odkłada pojedynczy wpis
  historii dopiero na `pointerup`.

### Projekt, pliki i trwałość

`ProjectDto` ma `format`, `version`, `meta`, `canvas`, `layers`, `ranges` i
opcjonalne `extensions`. Zod waliduje strukturę, a walidacja domenowa sprawdza
UUID, duplikaty, istniejące `rangeId`, granice wartości i ograniczenia skali.
Importer wyświetla zrozumiały błąd, niczego nie zmieniając przy nieudanej
walidacji. Każda zmiana formatu wymaga migracji z wcześniejszego numeru wersji.

Snapshot autosave zawiera czas, wersję formatu i komplet projektu. Przy szóstym
zapisie kasowany jest wyłącznie najstarszy rekord aplikacji. `Restore` pokazuje
do pięciu snapshotów z czasem i tytułem; toast w prawym dolnym rogu komunikuje
powodzenie albo błąd. To zabezpieczenie pomocnicze, nie substytut pobrania JSON.

## 3. Etapy implementacji

### Etap 0 — kontrakt i repozytorium

**Cel:** stworzyć uruchamialny, czysty fundament bez implementowania funkcji
projektowych na skróty.

1. Zainicjalizować Next.js z TypeScript, ESLint i App Router przez pnpm oraz
   zachować `pnpm-lock.yaml` jako jedyny lockfile.
2. Dodać Tailwind v4; tokeny w `@theme` (a jeśli repozytorium użyje konfiguracji
   TS jako źródła prawdy, zachować ją jako jedyne źródło tokenów).
3. Dodać React Redux, Redux Toolkit, Zod, `next-intl`, Vitest, React Testing
   Library oraz bibliotekę ikon SVG. Nie dodawać narzędzia E2E.
4. Utworzyć routing `/`, `/app`, `/app/help`; dodać provider store, i18n oraz
   rootowy `ConfirmationProvider` dla destrukcyjnych operacji.
5. Zapisać `docs/architecture.md`, `docs/json-format.md` i
   `ai-handoff/DECISIONS.md`. Przenieść do nich decyzje z analizy zamiast
   kopiować kod starego programu.
6. Skonfigurować Prettier (`printWidth: 100`) i lokalny pre-commit gate
   `pnpm verify` (format check, lint, typecheck i testy jednostkowe). CI
   pozostaje poza obecnym zakresem; nie dodawać jobu E2E.

**Weryfikacja:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` są
zielone; `/`, `/app` i `/app/help` działają, a wyświetlany tekst pochodzi z
angielskich kluczy tłumaczeń.

### Etap 1 — szkielet produktu i design system

**Cel:** dać produktowi docelową ergonomię przed budową warstw.

1. Wprowadzić tokeny light theme:
   `#F6F7F9`, `#FFFFFF`, `#F0F2F5`, `#D8DCE2`, `#20242B`, `#626B77`,
   `#C62828`, `#A61F1F`, `#FCE8E8`, `#B42318`, `#E57373`.
2. Zbudować atomy i molekuły: przyciski z ikoną, tooltip, pola text/number,
   range, switch, select, color input, `FieldRow`, status/toast i dialog.
3. Zbudować poziomy toolbar w kolejności: New project, Open, Download, Import,
   Export, Undo, Redo, Restore, Examples, Help center. Na małym ekranie mniej
   ważne akcje przechodzą do przycisku More (`…`).
4. Zbudować jeden lewy sidebar o stałej szerokości. Zawartość przesuwa się
   poziomo między `Layers`, `Properties` i `Project settings`. Layers jest
   środkowym ekranem: Properties wyjeżdża z prawej, a Project settings z lewej.
   Oba widoki mają pełnoszerokie `Back to layers`; Project settings jest
   otwierane wyłącznie z widoku Layers i zawiera rozmiar canvasu oraz snapping.
   W Project settings strzałka powrotu jest skierowana w prawo. W nagłówku
   Nagłówek Layers zawiera cichą akcję `Project` z ikoną ustawień oraz
   akcentowy przycisk `+ Layer`; oba przyciski zachowują widoczne etykiety.
   Widok Layers ma dwie niezależne, wyraźnie rozdzielone sekcje: najpierw
   wizualne Layers, potem Ranges. Ranges tworzy się i edytuje wyłącznie w
   drugiej sekcji; Add layer wymaga istniejącego Range. Sekcja Ranges jest
   przyklejona do dołu i ma wysokość wynikającą z zawartości, a lista Layers
   wykorzystuje resztę miejsca i przewija się niezależnie.
5. Po prawej umieścić responsywny kontener preview SVG. Zaimplementować pusty
   ekran dla projektu bez warstw z akcjami Create first Range i Browse examples.
   Ekrany powitalne zachowują stały kwadratowy frame; właściwy preview SVG
   odzwierciedla proporcje canvasu projektu i zawsze mieści cały canvas w
   dostępnym obszarze, bez zoomowania lub przesuwania.
6. Dodać podstawową dostępność: widoczny focus, etykiety kontrolek, tab order,
   obsługę dialogu i tekstowe etykiety ikon.

**Weryfikacja:** test ręczny w desktopie i w wąskiej szerokości: toolbar się nie
łamie, sidebar poprawnie animuje przejście, powrót zamyka properties, a pusty
stan prowadzi do Range/Examples. Zrzut porównawczy należy dodać do
`ai-handoff/implementation-evidence/`.

### Etap 2 — kontrakt danych, domena i podstawowy store

**Cel:** stabilny model, zanim powstanie dużo UI.

1. Zdefiniować Zod `ProjectSchema` z niezależnymi kolekcjami `layers` i
   `ranges`, versioned discriminated union dla wizualnych warstw i serializację
   bez właściwości UI. Walidować wymagane, niepuste po trimie nazwy obu typów
   obiektów oraz wszystkie granice liczbowe. Kontrolki UI ograniczają już
   wpisywane wartości do własnych `min`/`max`, lecz Zod pozostaje
   autorytatywną walidacją importu i stanu projektu.
2. Utworzyć klasy `Layer` i `Range` oraz kontrakty
   `RenderContext`, `EditingOverlayContext`, `LayerHandle` i `PointerInput`.
3. Dodać geometrię w mm: transformacje, kąty, value↔angle, ograniczanie,
   snapping odległości i kąta oraz SVG `viewBox` w mm.
4. Dodać `projectSlice`, `editorSlice`, `historySlice` i adapter historii z
   limitem 50; stworzyć niezależne akcje create/update/remove dla `layers` i
   `ranges`, zaś reorder wyłącznie dla wizualnych `layers`.
5. Zbudować factories: `createProject`, `createRange`, `createTestStore`,
   `renderEditor` oraz fixture poprawnego i błędnego JSON-a.
6. Utworzyć model pustego projektu: 120 × 120 mm, metadane oraz puste kolekcje
   `layers` i `ranges`.

**Weryfikacja:** testy obejmują serializacja→parse→instancje→serializacja,
odrzucenie złego `rangeId`, limit historii, undo/redo, przeliczenia mm i snap
2 mm/10°. Zmiana wyłącznie UI nie zmienia historii.

### Etap 3 — Range i pełny przepływ edycji

**Cel:** pierwsza pionowa funkcja działająca od dodania do SVG i historii.

1. Dodać Range jako pierwszy typ niezależnej kolekcji `ranges`: tworzenie,
   edytowalna nazwa, środek, promień, początek i rozwarcie kąta oraz
   `scaleDefinition`. Range mapuje wartości, ale nie zawiera pivotu ani
   parametrów wizualnej wskazówki.
   Definicje parametrów numerycznych (min/max/krok) należą do edytowanego
   obiektu domenowego; UI jedynie je renderuje, bez stałych zależnych od
   prototypowego canvasu.
2. Stworzyć jego właściwości w grupach. Range nie udaje finalnie rysowanej
   warstwy ani nie potrzebuje osobnej miniatury/badge w odrębnej sekcji Ranges.
3. Dodać overlay Range: środek, promień oraz start i rozwarcie łuku; uchwyty
   mają minimalny rozmiar ekranowy i etykietę aktualnej wartości. Range nie ma
   uchwytu pivotu.
4. Wspólny controller obsługuje pointer capture, screen→mm, snapping i commit
   historii po zakończeniu drag.
5. Panel Layers ma osobne sekcje visual Layers i Ranges. Nazwa wiersza otwiera
   Properties (dwuklik także jest wspierany), bez osobnego przycisku ołówka.
   Wiersz pozwala przełączyć widoczność, usunąć warstwę po potwierdzeniu i
   zmienić jej kolejność przez uchwyt drag-and-drop. Hover nad miniaturą visual
   layer tymczasowo pokazuje w preview tylko daną warstwę, bez zmiany selekcji
   lub historii.
   Kliknięcie canvasu nie wybiera warstwy.
6. Po powrocie do Layers overlay znika, a miniatura jest regenerowana.

**Weryfikacja:** użytkownik może stworzyć Range z pustego ekranu, przesunąć i
zmienić promień uchwytem, co aktualizuje formularz i cofa się jednym Undo.
Nie można usunąć Range po dodaniu zależności; niezależne Range i warstwy są
usuwane dopiero po potwierdzeniu w rootowym dialogu. Miniatura odświeża się
dopiero po Back to layers.

### Etap 4 — Tick Scale i Numeric Scale

**Cel:** uruchomić właściwy dial i wspólną definicję skali.

1. Dodać `TickScaleLayer`, następnie `NumericScaleLayer`, oba z obowiązkowym
   wyborem Range po nazwie. Oba pierwsze slice'y są zaimplementowane: mają
   DTO/Zod/factory, własne definicje pól, renderer SVG, uchwyt promienia,
   formularz, walidację oraz testy. Numeric Scale obsługuje mnożnik, liczbę
   miejsc dziesiętnych i podstawowe style fontu web-safe.
2. Implementować kreski Tick Scale oraz formatowanie etykiet Numeric Scale,
   oba korzystające z definicji mapowania należącej do Range; dodać łuk
   krawędziowy, mnożnik i style web-safe fontów.
3. Dodać przełączniki Linear / Logarithmic / Custom Curve. Dla logarytmu
   walidować dodatni zakres i podstawę; dla zmiany trybu wymagającej resetu
   danych pokazywać potwierdzenie.
4. W Custom Curve zrobić dwuosiowy wykres: dodawanie, drag, usuwanie punktów,
   zablokowane końce min/max oraz monotoniczność X i Y bez przecinania punktów.
5. Dodać overlay granic/radiusu tam, gdzie ma sens; nie mnożyć uchwytów, jeśli
   parametr wygodniej i jednoznaczniej edytuje się w formularzu.

**Weryfikacja:** przykład z Range, kreskami i liczbami renderuje jednakowe
pozycje dla linear/log/custom. Testy pokrywają obliczenia, render każdego typu,
wybór `rangeId`, krzywą i minimum jeden drag uchwytu na warstwę.

### Etap 5 — pozostałe warstwy, pojedynczo

**Cel:** zwiększać zakres bez utraty spójności modelu.

Kolejność: **Label → Arc → Clock Hand → Ellipse → Rectangle**. Dla każdej
warstwy wykonać ten sam checklist:

1. DTO/Zod/default factory i walidacja domenowa.
2. Klasa z `toSvg`, `toEditingOverlay`, `getHandles` i `applyHandleDrag`.
3. Formularz z pogrupowanymi parametrami i właściwymi kontrolkami.
4. Render, kolorowa etykieta typu, generowana miniatura oraz hover preview.
5. Przypięcie do Range, ograniczenia wartości i blokada usunięcia Range.
6. Przykład workbench w development i testy: factory, walidacja, SVG oraz co
   najmniej jeden uchwyt/interakcja.

**Weryfikacja:** po każdym podpunkcie gatunku istnieje jeden działający przykład
i pełen test checklisty. Dopiero wtedy rozpoczyna się następna warstwa.

### Etap 6 — pliki użytkownika, autosave i przykłady

**Cel:** projekt jest praktycznie używalny i bezpieczny lokalnie.

1. Zaimplementować Download (JSON), Import JSON (file picker, Zod, migracje,
   raport błędu), New project z ochroną przed utratą zmian oraz Restore.
2. Dodać autosave co 3 minuty, localStorage, maks. pięć snapshotów, toast i
   testy fake timer/storage. Preferencje snappingu przechowywać lokalnie, ale
   poza JSON-em projektu.
3. Dodać katalog Examples jako statyczne, walidowane JSON-y. Wybranie przykładu
   ładuje jego kopię do bieżącego store, nie zmienia pliku źródłowego.
4. Tylko w `NODE_ENV=development` uruchamiać fabrykę projektu roboczego: jeden
   Range, dwie warstwy Tick Scale i Numeric Scale. Następnie rozwinąć ją do `Layer workbench`,
   zasilanego przez `ACTIVE_WORKBENCH_LAYER`. Dane muszą przechodzić Zod i nie
   mogą wejść do produkcji.
5. Dodać mini-wiki wewnątrz `/app/help`: Getting started, interface, layers,
   project JSON i examples.

**Weryfikacja:** odświeżenie przeglądarki pozwala przywrócić jeden z pięciu
snapshotów; zły JSON nie nadpisuje obecnego projektu; examples i workbench
zachowują się zgodnie z environmentem; wszystkie teksty Help są po angielsku.

### Etap 7 — eksport i jakość wydania

**Cel:** dostarczyć rezultat poza edytorem i zamknąć MVP.

1. Przygotować jeden deterministyczny generator finalnego SVG, wspólny dla
   preview i eksportów; overlay nigdy nie jest eksportowany.
2. Dodać Export dialog z sekcjami PNG, SVG i PDF oraz wydzielonym, nieaktywnym
   miejscem na przyszłe Buy me a coffee.
3. Eksport SVG zapisuje źródłowy dokument w mm. PNG rasteruje finalny SVG w
   wybranej rozdzielczości. PDF w MVP: jedna strona, automatyczna orientacja A4,
   Fit to page albo Actual size 1:1; bez wielostronicowości i zaawansowanych
   ustawień druku.
4. Dodać testy jednostkowe generatora SVG oraz testy komponentów z React
   Testing Library dla kluczowych akcji: create Range, add scale, undo/redo,
   Download i otwarcie Export dialog.
5. Przejść audit: responsywność toolbaru, dostępność klawiatury i kontrastu,
   komunikaty błędów, build produkcyjny oraz kontrola rozmiaru bundle.

**Weryfikacja końcowa:** przykładowy projekt daje spójny preview, SVG, PNG i
PDF; JSON można pobrać i ponownie zaimportować; brak połączenia z siecią nie
blokuje pracy; CI jest zielone.

## 4. Definition of done dla MVP

MVP jest gotowe, gdy realizuje osiem typów warstw, wiele Range, płaską kolejność
renderowania, scalę linear/log/custom curve, bezpośrednią edycję podstawowych
parametrów uchwytami, snapping, JSON, autosave/restore, historię 50 operacji,
angielskie UI, mini-wiki, przykłady i eksport PNG/SVG/podstawowy PDF. Tekst po
łuku, lokalne fonty, skróty klawiszowe, konta, chmura, współpraca i płatności
pozostają poza MVP.

## 5. Materiały dla kontynuującego pracę

Katalog `../ai-handoff/` zawiera indeks decyzji, referencje do kodu starego
projektu i wybrane zrzuty ekranów. To materiał badawczy — nowy projekt nie
powinien kopiować kodu, binarnego formatu `.ggp` ani assetów legacy.
