# Materiały referencyjne

Poniższe pliki są **kopiami do analizy** z
`../../pc-legacy/documentation/docs/img/`. Nie są
assetami nowej aplikacji i nie należy ich publikować ani kopiować do jej UI.

| Plik | Co pokazuje | Wniosek dla nowej wersji |
| --- | --- | --- |
| `reference-images/legacy-full-interface.png` | całą aplikację WPF | punkt odniesienia dla podziału: akcje, warstwy, preview |
| `reference-images/legacy-welcome-screen.png` | pusty/startowy widok | inspiracja dla nowego empty state |
| `reference-images/legacy-quick-preview.png` | izolację warstwy na hover | zachować jako hover miniatury |
| `reference-images/legacy-edit-overlay.png` | nakładkę pomocy edycji | odtworzyć jako nieeksportowany, interaktywny overlay SVG |
| `reference-images/legacy-layer-actions.png` | akcje listy warstw | baza dla visibility, clone, delete i reorder |
| `reference-images/legacy-project-actions.png` | akcje projektu | baza funkcjonalna, nie wizualna, dla toolbaru |
| `reference-images/legacy-range-preview.png` | właściwości Range | Range jest kontekstem, a nie finalnym elementem renderu |
| `reference-images/legacy-linear-scale-preview.png` | kreski skali | referencja funkcji Linear Scale |
| `reference-images/legacy-numeric-scale-preview.png` | liczby skali | referencja funkcji Numeric Scale |
| `reference-images/legacy-clock-hand-preview.png` | wskazówkę | referencja parametrów Clock Hand |
| `reference-images/legacy-arc-preview.png` | strefę łukową | referencja parametrów Arc |
| `reference-images/legacy-label-preview.png` | opis tekstowy | referencja parametrów Label |
| `reference-images/legacy-ellipse-preview.png` | elipsę | referencja parametrów Ellipse |
| `reference-images/legacy-rectangle-preview.png` | prostokąt | referencja parametrów Rectangle |

### Kluczowe źródła kodowe legacy

- `../../pc-legacy/Gauge Generator/Layer.cs` — wspólna baza warstw.
- `../../pc-legacy/Gauge Generator/Range_Item.cs` — Range i mapowanie skali.
- `../../pc-legacy/Gauge Generator/*_Item.cs` — osiem rodzajów warstw.
- `../../pc-legacy/Gauge Generator/Editor_Page.xaml.cs` — wcześniejszy renderer
  i overlay.
- `../../pc-legacy/Gauge Generator/Layers_Page.xaml.cs` — lista, hover preview
  i akcje.
- `../../pc-legacy/documentation/docs/layers.md` oraz `interface.md` — opis
  pierwowzoru.

## Miejsce na dowody implementacji

Utwórz po pierwszym etapie pliki w `implementation-evidence/`, np.
`stage-01-ui.md` i odpowiadający mu zrzut. Każdy wpis powinien zawierać
odwołanie do etapu, komendy weryfikacji, wynik i otwarte ryzyka.
