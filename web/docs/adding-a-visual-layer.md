# Dodawanie nowej warstwy wizualnej

Ten przewodnik opisuje aktualny kontrakt warstw w Gauge Generator Web. Prowadzi
od formatu projektu, przez model domenowy i renderowanie SVG, aż do formularza,
overlayu oraz testów. Jest przeznaczony zarówno dla człowieka, jak i agenta AI.

Warstwę dodajemy jako kompletny **vertical slice**. Nie umieszczamy jej logiki w
`EditorShell`, a kodu domenowego nie wiążemy z Reactem.

## 1. Najpierw wybierz rodzaj warstwy

Każda warstwa wizualna:

- ma własny rekord w `project.layers`;
- wskazuje źródłowy Range przez `rangeId`;
- przechowuje w JSON wyłącznie dane projektu, bez stanu UI;
- renderuje końcowy SVG przez klasę dziedziczącą po `Layer`;
- sama odpowiada za walidację, pola edytora i zachowanie overlayu.

Przed rozpoczęciem zdecyduj, który wariant pasuje do warstwy.

### Warstwa mapowana po Range

Wybierz `RangeMappedLayer`, jeśli DTO ma:

```ts
{
  radiusOffsetMm: number;
  valueStart: number;
  valueEnd: number;
}
```

Klasa bazowa zapewnia wtedy standardową ścieżkę overlayu, uchwyt promienia i
obsługę jego przeciągania. Tick Scale i Numeric Scale korzystają z tego wariantu.

### Warstwa z własnym układem

Dziedzicz bezpośrednio po `Layer`, jeśli warstwa ma inne uchwyty, kilka trybów
layoutu albo nie zachowuje się jak skala. Label jest przykładem: tryb punktowy ma
uchwyty pozycji i obrotu, a tryb tekstu po ścieżce ma uchwyt promienia.

Wspólna baza nie ogranicza warstwy do standardowego overlayu. Każda implementacja
może zwrócić własną geometrię i własne uchwyty.

## 2. Domyślna struktura plików

Dla warstwy o nazwie `Example` utwórz następujący slice:

```text
features/layers/example/
├── example.ts
├── example.test.ts
├── example-limits.ts
├── example-constraints.ts                  # jeśli limity zależą od Range
├── example-constraints.test.ts             # jeśli istnieją constraints
├── example-properties.ts
├── example-properties.test.ts
├── example-properties-editor/
│   ├── example-properties-editor.tsx
│   └── example-properties-editor.test.tsx
└── example-editing-overlay/
    ├── example-editing-overlay.tsx
    └── example-editing-overlay.test.tsx
```

Nie każdy plik jest obowiązkowy:

- `*-limits.ts` grupuje statyczne granice używane przez Zod, formularz i domenę;
- `*-constraints.ts` jest potrzebny, gdy zmiana Range może unieważnić warstwę;
- prosty overlay mapowany po Range może być tylko małym adapterem wspólnego
  `RangeMappedLayerEditingOverlay`;
- fabrykę prostego DTO dodajemy w `features/project/factories/project-factories.ts`;
- lokalny `*-factories.ts` ma sens dla zagnieżdżonych wariantów, np. layoutów.

## 3. Dodaj identyfikator typu

W `features/project/project-dto/layer-type.ts` dodaj stabilną wartość JSON:

```ts
export const LAYER_TYPE = {
  // istniejące typy
  example: "example",
} as const;
```

Klucz TypeScript jest używany w kodzie, a wartość trafia do zapisanego projektu.
Nie zmieniaj jej później bez świadomej zmiany kontraktu danych.

## 4. Zdefiniuj DTO i schemat Zod

W `features/project/project-dto/project-dto.ts` rozszerz `LayerBaseSchema`:

```ts
const ExampleLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.example),
  valueStart: ScaleValueSchema,
  valueEnd: ScaleValueSchema,
  radiusOffsetMm: z.number().min(-500).max(500),
  color: HexColorSchema,
}).strict();
```

Następnie dopisz schemat do unii dyskryminowanej:

```ts
export const LayerSchema = z.discriminatedUnion("type", [
  // istniejące schematy
  ExampleLayerSchema,
]);
```

I wyeksportuj zawężony typ:

```ts
export type ExampleLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.example }>;
```

Zasady DTO:

- schemat ma być `.strict()`;
- wymiary fizyczne zapisujemy w milimetrach i nazywamy z końcówką `Mm`;
- kąty zapisujemy w stopniach i nazywamy z końcówką `Degrees`, chyba że obecny
  kontrakt domenowy definiuje bardziej precyzyjną nazwę;
- wartości domeny skali są liczbami całkowitymi;
- warianty zapisujemy jako zagnieżdżoną unię z polem `mode`;
- współdzielone dane mają wspólny zagnieżdżony kontrakt, np. `textStyle`, a nie
  kopie pól na najwyższym poziomie każdej warstwy;
- do JSON nie trafiają zaznaczenie, hover, otwarcie panelu ani overlay.

Zod jest pierwszą, autorytatywną granicą importowanego JSON. Reguły zależne od
innych obiektów projektu należą do modelu domenowego.

## 5. Dodaj wartości domyślne i fabrykę

W `features/project/factories/project-factories.ts` dodaj fabrykę pełnego DTO:

```ts
export function createExampleLayer(
  rangeId: string,
  overrides: Partial<ExampleLayerDto> = {},
): ExampleLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Example",
    visible: true,
    rangeId,
    type: LAYER_TYPE.example,
    valueStart: 0,
    valueEnd: 100,
    radiusOffsetMm: 0,
    color: "#20242B",
    ...overrides,
  };
}
```

Dopisz ją również do `createLayerFromType()`. Ta funkcja zasila tworzenie warstwy
z pickera i reset ustawień do wartości domyślnych.

Wartości domyślne muszą od razu przechodzić Zod i walidację domenową dla
standardowego Range. Jeśli domyślny layout zależy od Range, fabryka powinna go
przyjąć albo użyć osobnej fabryki z jednoznacznym fallbackiem.

## 6. Zaimplementuj model domenowy i SVG

Minimalny kontrakt klasy znajduje się w `features/layers/core/layer.ts`:

```ts
export class ExampleLayer extends Layer<ExampleLayerDto> {
  constructor(dto: ExampleLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    // stabilne kody i ścieżki pól, bez tekstu dla użytkownika
    return [];
  }

  toSvg(context: RenderContext): string {
    // pusty string, gdy brak Range albo layer.visible === false
    return "";
  }

  getEditingOverlay(context: EditingOverlayContext): readonly EditingOverlayPrimitive[] {
    return [];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    return [];
  }

  applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): ExampleLayerDto {
    return this.dto;
  }
}
```

`toSvg()` zwraca wyłącznie fragment wnętrza końcowego SVG. Musi:

- być deterministyczny;
- pracować w milimetrach projektu;
- uciekać tekst użytkownika przez `escapeXml()`;
- formatować liczby w stabilny sposób;
- nie renderować overlayu i uchwytów;
- nie korzystać z Reacta ani stanu edytora;
- bezpiecznie zwracać `""`, gdy warstwy nie można wyrenderować.

Thumbnail nie wymaga osobnego renderera. `LayerThumbnail` wywołuje tę samą metodę
`toSvg()`, więc podgląd i miniatura używają jednego źródła prawdy.

Jeśli SVG zależy od zewnętrznego katalogu zasobów, w JSON zapisz stabilną
referencję, a nie skopiowaną geometrię biblioteki. Zasób rozwiąż przed wywołaniem
`toSvg()` i przekaż przez typowany `RenderContext`. Sam model warstwy pozostaje
synchroniczny i niezależny od Reacta. Warstwa Icon pokazuje ten wariant dla
katalogu Lucide.

### Wariant `RangeMappedLayer`

Jeśli warstwa spełnia wspólny kontrakt Range, implementacja może być krótsza:

```ts
export class ExampleLayer extends RangeMappedLayer<ExampleLayerDto> {
  validate(context: RenderContext): ValidationIssue[] {
    // użyj getRangeMappedLayerValidationIssues() i dodaj własne reguły
    return [];
  }

  toSvg(context: RenderContext): string {
    return "";
  }

  protected getRadiusOffsetBounds(range: RangeDto) {
    return getExampleGeometryBounds(this.dto, range);
  }
}
```

Nie nadpisuj wspólnych metod overlayu tylko po to, by powtórzyć ich implementację.
Nadal możesz je nadpisać, jeśli zachowanie warstwy faktycznie jest inne.

## 7. Zdefiniuj limity, constraints i walidację

Rozdziel trzy odpowiedzialności:

1. `*-limits.ts` — statyczne granice kontraktu;
2. `*-constraints.ts` — granice zależne od Range oraz funkcja przywracająca
   poprawny stan po zmianie Range;
3. `validate()` — raportowanie problemów istniejącego DTO.

Przykładowy moduł constraints:

```ts
export function getExampleGeometryBounds(layer: ExampleLayerDto, range: RangeDto) {
  return {
    minRadiusOffsetMm: -range.radius + 0.5,
    maxRadiusOffsetMm: range.radius,
  };
}

export function constrainExampleToRange(layer: ExampleLayerDto, range: RangeDto): ExampleLayerDto {
  const bounds = getExampleGeometryBounds(layer, range);
  return {
    ...layer,
    radiusOffsetMm: clamp(layer.radiusOffsetMm, bounds.minRadiusOffsetMm, bounds.maxRadiusOffsetMm),
  };
}
```

Jeśli funkcja constraints istnieje, dopisz ją do `constrainLayerToRange()` w
`features/layers/core/layer-registry.ts`. Dzięki temu zmiana Range nie pozostawi
powiązanej warstwy w niepoprawnym stanie.

Walidacja zwraca `{ path, code }`, nigdy angielski komunikat. Najpierw użyj
istniejącego kodu z `project-validation-codes.ts`. Nowy kod dodawaj tylko dla
nowej reguły, której użytkownik powinien dostać odrębne wyjaśnienie. Wtedy dodaj
również mapowanie i tłumaczenie w `use-project-validation.ts` oraz
`messages/en.json`.

## 8. Zdefiniuj pola właściwości poza Reactem

W `example-properties.ts` zbuduj definicje pól:

```ts
export const EXAMPLE_NUMERIC_PROPERTY_KEYS = ["radiusOffsetMm"] as const;

export type ExampleNumericPropertyKey = (typeof EXAMPLE_NUMERIC_PROPERTY_KEYS)[number];

export type ExampleNumericPropertyDefinition =
  NumericPropertyDefinition<ExampleNumericPropertyKey> & {
    group: "geometry";
    labelKey: "radiusOffset";
    unit: "millimeters";
  };

export function getExampleNumericPropertyDefinitions(
  layer: ExampleLayerDto,
  range: RangeDto | undefined,
): readonly ExampleNumericPropertyDefinition[] {
  const bounds = range ? getExampleGeometryBounds(layer, range) : undefined;
  return [
    {
      key: "radiusOffsetMm",
      labelKey: "radiusOffset",
      group: "geometry",
      unit: "millimeters",
      snap: "distance",
      value: layer.radiusOffsetMm,
      min: bounds?.minRadiusOffsetMm ?? -500,
      max: bounds?.maxRadiusOffsetMm ?? 500,
      step: 0.1,
    },
  ];
}
```

Definicja pola jest wspólnym źródłem dla wartości, limitów, kroku, jednostki i
snappingu. Nie powtarzaj tych liczb w komponencie formularza. Ustaw
`integerOnly: true` dla wartości, które mają być całkowite.

Jeśli kilka warstw ma identyczny kontrakt, korzystaj ze wspólnego modułu, np.:

- `range-layer-properties.ts` dla start/end/step;
- `text-style/` dla typografii;
- współdzielonych molekuł dla koloru, selecta i booleanów.

## 9. Zbuduj edytor właściwości

Komponent w `example-properties-editor/example-properties-editor.tsx` ma tylko
skomponować definicje oraz istniejące kontrolki:

```tsx
"use client";

export function ExamplePropertiesEditor({
  layer,
  ranges,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  snapping,
}: ExamplePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getExampleNumericPropertyDefinitions(
    layer,
    ranges.find((range) => range.id === layer.rangeId),
  );

  return (
    <PropertyGroup title={t("example.geometry")}>
      <NumericPropertyFields
        definitions={definitions}
        getLabel={(definition) => t(`example.${definition.labelKey}`)}
        getSuffix={() => t("controls.millimeters")}
        group="geometry"
        onInteractionEnd={onHistoryTransactionEnd}
        onInteractionStart={onHistoryTransactionStart}
        onValueChange={(key, value) => onLayerChange({ [key]: value } as Partial<ExampleLayerDto>)}
        snapping={snapping}
      />
    </PropertyGroup>
  );
}
```

Nie implementuj lokalnie inputów ani ich walidacji. Najpierw sprawdź wspólne
komponenty w `components/molecules/` i `features/editor/property-controls/`.

Dopisz komponent do wyczerpującego switcha `LayerSpecificProperties()` w
`features/editor/layer-properties/layer-properties.tsx`.

## 10. Dodaj overlay i uchwyty

Model domenowy określa geometrię przez:

- `getEditingOverlay()` — nieinteraktywne linie i ścieżki pomocnicze;
- `getHandles()` — położenie, typ i stabilne ID uchwytów;
- `applyHandleDrag()` — nowe DTO po przeciągnięciu.

Komponent React jest adapterem odpowiedzialnym za tłumaczenia, skalę ekranową i
cykl interakcji. Dla standardowej warstwy Range-mapped użyj
`RangeMappedLayerEditingOverlay`. Dla własnego układu skomponuj
`EditingOverlayGeometry` i `LayerHandles`, tak jak robi Label.

Overlay:

- istnieje tylko w trybie Properties;
- nie trafia do `toSvg()` ani eksportu;
- operuje w milimetrach, ale wspólne komponenty kompensują jego wizualny rozmiar
  względem zoomu;
- rozpoczyna i kończy transakcję historii wokół ciągłego przeciągania;
- zwraca pełne, poprawne DTO przez `onLayerChange`.

Jeśli warstwa nie potrzebuje overlayu, model może zwracać puste tablice, a
komponent adaptera może zwrócić `null`. Kontrakt metod pozostaje jednak jawny.

Dopisz adapter do switcha w
`features/editor/layer-editing-overlay/layer-editing-overlay.tsx`.

## 11. Zarejestruj model domenowy

W `features/layers/core/layer-registry.ts` dopisz warstwę do
`createLayerModel()`:

```ts
case LAYER_TYPE.example:
  return new ExampleLayer(layer);
```

Rejestr jest używany przez:

- finalny preview SVG;
- miniatury warstw;
- walidację projektu;
- przyszły eksport.

Brak wpisu oznacza, że warstwa nie jest częścią działającego modelu, nawet jeśli
jej formularz już istnieje.

## 12. Podłącz picker i listę warstw

Nowy typ musi pojawić się w trzech miejscach UI:

1. `LAYER_PICKER_ITEMS` w `layer-type-picker.tsx` — ikona, tytuł i opis;
2. `layerTypeLabelKey` w `layers-browser.tsx` — nazwa typu pod nazwą obiektu;
3. `messages/en.json` — wszystkie teksty, etykiety, ARIA i komunikaty.

Przykład tłumaczeń:

```json
{
  "layers": {
    "picker": {
      "exampleDescription": "Draw an example element using the selected Range."
    },
    "types": {
      "example": "Example"
    }
  },
  "example": {
    "geometry": "Geometry",
    "radiusOffset": "Radius offset",
    "overlayAriaLabel": "Example editing overlay",
    "handles": {
      "radiusOffset": "Adjust example radius"
    },
    "handleValues": {
      "radiusOffset": "{value} mm"
    }
  }
}
```

English jest obecnie jedynym locale, ale żaden tekst użytkownika nie powinien być
zahardcodowany w JSX ani w modelu domenowym.

## 13. Dodaj testy w odpowiedzialnych modułach

Nie testuj całej warstwy wyłącznie przez `EditorShell`. Minimalny zestaw obejmuje:

### DTO i fabryka

- poprawny obiekt przechodzi `ProjectSchema`;
- brakujące, nadmiarowe i niepoprawne pola są odrzucane;
- fabryka zwraca poprawne wartości domyślne;
- `createLayerFromType()` obsługuje nowy typ;
- reset zachowuje `id`, `name`, `visible` i `rangeId`.

### Model domenowy

- `toSvg()` daje oczekiwany, stabilny fragment;
- niewidoczna warstwa i brak Range dają pusty wynik;
- tekst i atrybuty są bezpieczne;
- `validate()` zwraca właściwy kod oraz ścieżkę;
- pozycje geometrii są sprawdzane na co najmniej jednym nieoczywistym Range.

### Properties i constraints

- definicje mają poprawne wartości, limity, kroki i snapping;
- limity zależne od Range zmieniają się razem z Range;
- constraints zachowują poprawne pola i clampują tylko wymagane wartości;
- komponent edytora emituje właściwą częściową zmianę DTO.

### Overlay

- renderuje właściwe uchwyty i etykiety;
- drag zmienia wyłącznie oczekiwane pola;
- snapping działa zgodnie z definicją;
- jedna interakcja rozpoczyna i kończy jedną transakcję historii.

### Integracja UI

- picker tworzy warstwę nowego typu;
- lista pokazuje jej właściwą nazwę typu;
- `LayerProperties` wybiera właściwy edytor;
- `LayerEditingOverlay` wybiera właściwy adapter.

Testuj regułę w najniższym wspólnym module. Jeśli mechanizm jest współdzielony,
nie duplikuj identycznego testu dla każdej warstwy.

## 14. Zaktualizuj dokumentację i przykład

Po zmianie kontraktu danych zaktualizuj:

- `docs/json-format.md` — zapis JSON i znaczenie pól;
- `docs/architecture.md` — tylko jeśli dochodzi nowy mechanizm lub granica;
- `docs/PLAN_IMPLEMENTACJI_GAUGE_GENERATOR_WEB.md` — status planowanego slice'a;
- `ai-handoff/README.md` — aktualny stan i następny krok.

Jeżeli warstwa powinna być demonstrowana użytkownikowi, dodaj ją świadomie do
jednego z walidowanych projektów w `features/examples/projects/`. Stan startowy
edytora pozostaje pusty we wszystkich środowiskach; nie twórz osobnego
development workbencha.

## 15. Weryfikacja końcowa

Uruchom w katalogu `web/`:

```bash
pnpm format
pnpm verify
```

`pnpm verify` obejmuje formatowanie, lint, typecheck i testy jednostkowe.

TypeScript celowo pilnuje kompletności integracji przez wyczerpujące switche i
`assertNever()`. Po dodaniu typu błędy typechecku wskażą pominięte miejsca, ale
nie zastępują testów zachowania ani poniższej checklisty.

## Checklista do pull requestu

- [ ] `LAYER_TYPE` ma nowy stabilny identyfikator.
- [ ] Ścisły schemat Zod jest częścią `LayerSchema`.
- [ ] Wyeksportowano zawężony typ DTO.
- [ ] Fabryka i `createLayerFromType()` tworzą poprawne wartości domyślne.
- [ ] Model jest dodany do `createLayerModel()`.
- [ ] Model waliduje i renderuje SVG bez Reacta.
- [ ] Constraints są zarejestrowane, jeśli warstwa zależy od zmian Range.
- [ ] Pola formularza pochodzą z `*-properties.ts`.
- [ ] Edytor warstwy jest podłączony w `LayerProperties`.
- [ ] Overlay ma domenową geometrię i cienki adapter React.
- [ ] Adapter overlayu jest podłączony w `LayerEditingOverlay`.
- [ ] Picker oraz lista znają nowy typ.
- [ ] Wszystkie teksty znajdują się w `messages/en.json`.
- [ ] Testy leżą przy odpowiedzialnych modułach.
- [ ] Dokumentacja formatu i status planu są aktualne.
- [ ] `pnpm verify` przechodzi.
