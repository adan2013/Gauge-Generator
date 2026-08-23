# Ustalone decyzje

| Obszar          | Decyzja                                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Struktura       | `web/` jest aplikacją Next.js; `pc-legacy/` jest wyłącznie referencją WPF                                                                          |
| Package manager | Tylko pnpm; `pnpm-lock.yaml` jest jedynym obowiązującym lockfile                                                                                   |
| Produkt         | Gauge Generator Web, niezależny od legacy                                                                                                          |
| Technologia     | Next.js App Router, TypeScript, React 19, Tailwind v4, Redux Toolkit, Zod                                                                          |
| Dane            | Development-only strict JSON v1 (`gauge-generator-web`) i Zod; bez kompatybilności/migracji do jawnej stabilizacji; mm; osobne `layers` i `ranges` |
| Render          | Finalne SVG; overlay edycji osobno i nigdy w eksporcie                                                                                             |
| UI              | toolbar + jeden sliderowy sidebar Layers/Properties + preview po prawej                                                                            |
| Wybór           | z panelu warstw lub przez kliknięcie geometrii na canvasie; hover miniatury daje szybki preview                                                    |
| Range           | wiele Range; Range nie jest wizualną warstwą i jest zarządzany wyłącznie w sekcji Ranges; każda visual layer wymaga `rangeId`                      |
| Arc             | tylko `valueStart`/`valueEnd` mapowane przez Range; bez ręcznych kątów; grubość w mm i płaskie albo zaokrąglone końce SVG                          |
| Needle          | jedna wartość mapowana przez Range; pivot w środku Range; zagnieżdżone `shaft`/`hub`; bez ręcznego kąta i własnej pozycji                          |
| Planar shapes   | Ellipse i Rectangle współdzielą geometrię w mm, styl fill/border oraz uchwyty środka, obrotu i rozmiaru; Rectangle dodaje corner radius 0–50%      |
| Icon            | zapisuje nazwę Lucide zamiast SVG; ma wspólną planar geometry z Ellipse/Rectangle (`widthMm`/`heightMm`), a resolver ładuje i cache'uje węzły      |
| Nazewnictwo     | każda visual layer i każdy Range mają wymaganą, edytowalną nazwę; nazwa warstwy pochodzi z bazowego modelu `Layer`, a Range ma własne pole `name`  |
| Walidacja       | domena i Zod zwracają stabilne kody oraz ścieżki błędów, bez angielskich komunikatów; interfejs tłumaczy kod przez `en.json`                       |
| Historia        | Redux, maks. 50 undo i 50 redo; drag = jedna operacja                                                                                              |
| Storage         | localStorage, autosave 3 min., maks. 5 snapshotów; projekt pobierany jako wersjonowany JSON, bez baz danych                                        |
| Open            | jedyna akcja wczytania JSON; atomowo zastępuje cały projekt; bez osobnego Import, scalania projektów i importu pojedynczych warstw w MVP           |
| Eksport         | JSON, PNG, SVG, podstawowy PDF A4 fit/1:1                                                                                                          |
| Tests           | wyłącznie testy jednostkowe: Vitest + React Testing Library; bez E2E                                                                               |
| MVP             | light mode i locale `en`; web-safe fonty; bez skrótów i kont                                                                                       |
| Development     | każda warstwa pionowo: DTO/Zod → UI → SVG → overlay → miniatura → testy; obecny workbench pozostaje tymczasowy i nie jest dalej rozwijany          |

Szczegóły i uzasadnienia znajdują się w dokumentach nadrzędnych.
