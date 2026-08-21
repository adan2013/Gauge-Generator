# Analiza projektu Gauge Generator i kierunek modernizacji webowej

> Stan analizy: 10 sierpnia 2026 r. Analiza oparta na kodzie i dokumentacji
> repozytorium; aplikacja nie była uruchamiana.

> Struktura repozytorium od 15 sierpnia 2026 r.: nowa aplikacja Next.js znajduje
> się w `web/`, zaś niezależny pierwowzór WPF w `../pc-legacy/`. Dalsze prace
> dotyczą wyłącznie `web/`; legacy pozostaje materiałem referencyjnym.

## 1. Czym jest projekt

**Gauge Generator Web** to bezpłatny edytor warstwowy do projektowania
tarcz zegarów analogowych i wskaźników (np. obrotomierzy i prędkościomierzy).
Użytkownik buduje kompozycję z figur, skal, opisów, łuków oraz wskazówek,
ogląda podgląd na żywo i eksportuje wynik do PNG.

| Obszar            | Obecne rozwiązanie                                                 |
| ----------------- | ------------------------------------------------------------------ |
| Język i platforma | C#, .NET Framework 4.6.1                                           |
| Interfejs         | WPF/XAML, jedno okno główne z panelami i modalami                  |
| Kontrolki         | Extended.Wpf.Toolkit 3.5, w tym PropertyGrid i AvalonDock          |
| Renderowanie      | Imperatywne rysowanie kontrolek WPF na Canvas                      |
| Eksport           | RenderTargetBitmap + PngBitmapEncoder                              |
| Format projektu   | .ggp obsługiwany przez binarną bibliotekę DataManagementSystem.dll |
| Licencja          | GNU GPL v3                                                         |
| Ostatni commit    | 2019-06-15                                                         |

Kod aplikacji jest niewielki i ma mało zależności, więc stanowi dobry materiał
do wyciągnięcia sprawdzonych założeń produktu. Celem nie jest jednak port ani
migracja: nowa aplikacja ma być samodzielnym, współczesnym projektem
inspirowanym ideą edytora warstwowego.

## 2. Cel i model działania

Projekt składa się z ustawień globalnych i listy warstw. Kolejność na liście
określa nakładanie: renderer przechodzi listę od końca, więc warstwa o niższym
indeksie znajduje się wizualnie wyżej. Warstwy można ukrywać, klonować,
przesuwać, usuwać oraz importować z innego projektu.

MVP zachowuje dokładnie tę płaską kolejność renderowania. Kolejność edytuje
uchwyt drag-and-drop, bez przycisków Move up / Move down. Nie wprowadzamy
jeszcze grupowania ani alternatywnych reguł nakładania.

Najważniejszy typ to **Range**. Definiuje pozycję i promień tarczy oraz
przeliczenie wartości na kąt. Projekt może zawierać wiele niezależnych Range,
a tym samym wiele tarcz na tym samym prostokątnym płótnie.

W pierwowzorze Range był traktowany jak warstwa, ale nowa aplikacja przechowuje
Range w osobnej kolekcji `ranges`; kolekcja `layers` zawiera wyłącznie warstwy
wizualne. Każdy typ wizualny wymaga pola rangeId: pobiera z nim środek,
promień, kierunek oraz mapowanie wartości na kąt. Dotyczy to także Label,
Ellipse i Rectangle, dzięki czemu pozycjonowanie pozostaje przewidywalne.
Range nie może zostać usunięty, dopóki istnieje warstwa zależna od jego id.

W UI zależność ma być czytelna: podczas tworzenia warstwy użytkownik wybiera
Range po nazwie, a lista warstw pokazuje przy elemencie kolorowy znacznik i
krótką nazwę źródła. Przyjazniejszą alternatywą, wartą wdrożenia po pierwszym
MVP, jest zagnieżdżona lista: każdy Range jest nagłówkiem/grupą, pod którym
widoczne są należące do niego warstwy. Zapis i kolejność renderowania nadal
pozostają jedną płaską listą, więc grupowanie nie komplikuje JSON-a.

Nowy projekt domyślnie używa kwadratowego płótna 120 × 120 mm, ale nie zawiera
żadnej warstwy, nawet Range. Płótno można później zmienić na dowolny prostokąt.
Maksimum to 80 warstw.

## 3. Funkcje użytkowe

### Zarządzanie projektem

- nowy projekt, otwieranie, zapis i „Zapisz jako” dla .ggp;
- ostrzeżenie o niezapisanych zmianach oraz cztery ostatnie projekty;
- sześć wbudowanych przykładów i odnośnik do tutoriali;
- import zaznaczonych warstw z innego .ggp, automatycznie z wymaganymi Range;
- eksport do PNG, z opcjonalnym otwarciem wygenerowanego pliku.

### Edytor i podgląd

- lista warstw z widocznością i szybkim podglądem pojedynczej warstwy;
- tworzenie, usuwanie, klonowanie oraz zmiana kolejności;
- edycja właściwości w generycznym PropertyGrid i reset do wartości domyślnych;
- tymczasowo: tylko edytowana warstwa, edytowana warstwa na wierzchu, ukrycie
  animowanej nakładki pomocniczej;
- podgląd na żywo oraz render w wyższej jakości przy eksporcie.

### Ustawienia projektu

- kolory tła i foreground;
- foreground jako pełny kwadrat albo okrągła tarcza;
- rozmiar PNG i opcja otwierania obrazu po eksporcie.

## 4. Typy warstw i parametry

| Typ           | Przeznaczenie                         | Najważniejsze opcje                                                                              |
| ------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Range         | Kontekst tarczy i skali               | środek, promień, początkowy kąt, rozwarcie także ujemne, min./max. wartości, punkt osi wskazówki |
| Tick Scale    | Promieniowe kreski i opcjonalny łuk   | odległość od środka, długość/grubość/kolor; korzysta z mapowania Range                           |
| Numeric Scale | Liczby na skali                       | min./max./krok, mnożnik, format, odległość, obrót, font i styl                                   |
| Label         | Dowolny napis                         | tekst, X/Y, obrót, font, kolor, pogrubienie/kursywa/podkreślenie                                 |
| Arc           | Kolorowy pas, np. strefa ostrzegawcza | zakres wartości lub ręczny kąt, przesunięcie, promień, szerokość, kolor                          |
| Clock Hand    | Wskazówka                             | wartość lub ręczny kąt, długości/kolory części, grubość, grot, koło osi                          |
| Ellipse       | Elipsa                                | środek, rozmiar, obrót, wypełnienie, obrys                                                       |
| Rectangle     | Prostokąt                             | środek, rozmiar, obrót, wypełnienie, obrys                                                       |

Wskazówka obsługuje pięć zakończeń: zwykłe, zaokrąglone, krótka i długa
strzałka oraz miękka strzałka. Warstwy zależne od Range ograniczają wartości do
zakresu swojego źródła.

## 5. Pełna lista właściwości obiektów

Nazwy poniżej są propozycją dla nowego JSON-a w konwencji camelCase. W nawiasach
podano limity z obecnej implementacji. Nowa aplikacja może zachować ich sens,
bez kopiowania nazw czy domyślnych wartości.

### Wspólne dla każdej warstwy

| Właściwość | Typ         | Opis                                                           |
| ---------- | ----------- | -------------------------------------------------------------- |
| id         | UUID/string | stabilny identyfikator                                         |
| type       | enum        | rodzaj warstwy                                                 |
| name       | string      | nazwa warstwy (obecnie do 25 znaków)                           |
| visible    | boolean     | czy warstwa jest renderowana                                   |
| rangeId    | UUID/string | identyfikator źródłowego Range; nie występuje w warstwie Range |

### Range

| Właściwość                     | Typ     | Opis / zakres                                                                                              |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| centerX, centerY               | number  | przesunięcie środka tarczy (-100–100%)                                                                     |
| radius                         | number  | promień tarczy (min. 5 mm, maks. połowa dłuższego boku canvasu)                                            |
| angleStart                     | integer | początkowy kąt skali (0–360°)                                                                              |
| openingAngle                   | integer | rozwarcie skali (-360–360°); ujemne zmienia zwrot                                                          |
| rangeStartValue, rangeEndValue | integer | początek i koniec wartości skali (-1000–1000)                                                              |
| valueDirection                 | enum    | ascending albo descending; niezależnie od zwrotu geometrycznego łuku                                       |
| scaleDefinition                | obiekt  | wspólna definicja mapowania wartości na pozycję: linear, logarithmic albo custom curve; bez parametru step |

### Tick Scale

| Właściwość                    | Typ     | Opis / zakres                        |
| ----------------------------- | ------- | ------------------------------------ |
| rangeMin, rangeMax, rangeStep | integer | fragment skali i krok; krok 1–1000   |
| lineThickness                 | number  | grubość kreski (1–5%)                |
| distanceFromCenter            | number  | pozycja zewnętrznego końca (20–100%) |
| lineLength                    | number  | długość kreski (2–100%)              |
| lineColor                     | kolor   | kolor kresek                         |

Linia krawędziowa skali nie należy do Tick Scale. Przy ścieżkach z regulowanym
zaokrągleniem powinna zostać wprowadzona później jako osobny obiekt wizualny.

### Numeric Scale

| Właściwość                    | Typ     | Opis / zakres                                |
| ----------------------------- | ------- | -------------------------------------------- |
| rangeMin, rangeMax, rangeStep | integer | fragment skali i krok                        |
| scaleMultiplier               | number  | mnożnik wyświetlanej wartości (0,01–100)     |
| rounding                      | integer | liczba miejsc formatowania (0–2)             |
| distanceFromCenter            | number  | odległość etykiet od środka (20–100%)        |
| rotated                       | boolean | obraca napisy zgodnie z pozycją na skali     |
| textStyle                     | object  | wspólna typografia, kolor i referencja fontu |

### Label

| Właściwość                      | Typ     | Opis / zakres                                  |
| ------------------------------- | ------- | ---------------------------------------------- |
| text                            | string  | wyświetlany tekst (obecnie do 40 znaków)       |
| layout.point offsets            | number  | przesunięcie X/Y od środka Range w mm          |
| layout.point rotation           | integer | obrót (0–359°)                                 |
| layout.text-arc radiusOffset    | number  | przesunięcie promienia ścieżki w mm            |
| layout.text-arc valueStart/End  | integer | fragment ścieżki mapowany przez wartości Range |
| layout.text-arc align/direction | enum    | wyrównanie oraz kierunek tekstu na ścieżce     |
| textStyle                       | object  | wspólna typografia, kolor i referencja fontu   |

### Arc

| Właściwość     | Typ     | Opis / zakres                                         |
| -------------- | ------- | ----------------------------------------------------- |
| valueStart/End | integer | niezerowy fragment ścieżki mapowany wartościami Range |
| radiusOffsetMm | number  | przesunięcie promienia ścieżki w mm                   |
| strokeWidthMm  | number  | grubość łuku w mm                                     |
| roundedEnds    | boolean | płaskie albo zaokrąglone końce ścieżki SVG            |
| color          | kolor   | kolor obrysu łuku                                     |

Arc nie posiada trybu ręcznych kątów. Kąty renderowania są zawsze wyliczane z
`valueStart` i `valueEnd` przez aktualne mapowanie źródłowego Range.

### Clock Hand

| Właściwość        | Typ     | Opis / zakres                                          |
| ----------------- | ------- | ------------------------------------------------------ |
| negativeLength    | number  | długość części za osią (0–50%)                         |
| thickness         | number  | grubość wskazówki (1–10%)                              |
| negativeColor     | kolor   | kolor części za osią                                   |
| positiveLength    | number  | długość części przed osią (20–100%)                    |
| positiveColor     | kolor   | kolor części przed osią                                |
| endType           | enum    | normal, rounded, shortArrow, longArrow, softArrow      |
| circleSize        | number  | promień koła osi (1–10%)                               |
| circleColor       | kolor   | kolor koła osi                                         |
| circleBehindArrow | boolean | koło pod wskazówką albo nad nią                        |
| manualAngle       | boolean | wybór ręcznego kąta zamiast wartości                   |
| value             | integer | wartość z Range (-1000–1000, ograniczana przez źródło) |
| angle             | integer | ręczny kąt (0–360°)                                    |

### Ellipse i Rectangle

Warstwy mają ten sam zestaw właściwości; różni je prymityw SVG.

| Właściwość                   | Typ     | Opis / zakres                                  |
| ---------------------------- | ------- | ---------------------------------------------- |
| centerOffsetX, centerOffsetY | number  | przesunięcie środka względem Range (-100–100%) |
| width, height                | number  | wymiary (5–100%)                               |
| color                        | kolor   | wypełnienie                                    |
| borderColor                  | kolor   | kolor obrysu                                   |
| borderThickness              | number  | grubość obrysu (0–25%; zero ukrywa obrys)      |
| angle                        | integer | obrót (-360–360°)                              |

### Ustawienia projektu

| Właściwość                      | Typ     | Opis                                                                      |
| ------------------------------- | ------- | ------------------------------------------------------------------------- |
| canvas.widthMm, canvas.heightMm | number  | fizyczne wymiary prostokątnego płótna w milimetrach                       |
| canvas.background               | kolor   | zapisany kolor tła obrazu, używany tylko przy wyłączonej przezroczystości |
| canvas.transparentBackground    | boolean | domyślnie `true`; canvas jest wtedy przezroczysty                         |
| export.size                     | integer | bok PNG (100–2000 px w starej aplikacji)                                  |
| export.svg                      | boolean | włącza eksport źródłowego SVG jako osobny format wyjściowy                |
| export.pdf.fitMode              | enum    | fit albo actualSize; zaawansowane opcje PDF są poza MVP                   |

### Jednostki, skale i snapping

Projekt operuje kanonicznie wyłącznie w **milimetrach**. W JSON-ie wszystkie
wymiary, współrzędne, promienie, grubości i przesunięcia są liczbami w mm.
Płótno jest prostokątem o widthMm i heightMm; nie zakładamy kwadratowego
obrazu ani jednej centralnej tarczy. Dzięki temu PDF, SVG i wydruk 1:1 nie
wymagają niejednoznacznego przeliczania.

Procenty mogą występować wyłącznie jako pomocniczy sposób wprowadzania wartości
w interfejsie, np. 50% promienia aktywnego Range. UI od razu przelicza je na
mm i zapisuje wynik w mm. Renderer SVG używa wspólnego układu współrzędnych
viewBox wyrażonego w mm.

Skala jest niezależnym obiektem domenowym współdzielonym przez Tick Scale,
Numeric Scale i Clock Hand:

| Tryb        | Dane                         | Znaczenie                                                           |
| ----------- | ---------------------------- | ------------------------------------------------------------------- |
| linear      | min, max, step               | wartość jest równomiernie mapowana na kąt Range                     |
| nonlinear   | lista punktów value/position | użytkownik ustala krzywą przez przeciąganie punktów na wykresie X/Y |
| logarithmic | min, max, detailEmphasis     | logarytm z większą przestrzenią dla niskich albo wysokich wartości  |

Warstwy kresek i liczb używają tej samej definicji, więc skala zawsze ma spójne
znaczniki oraz etykiety. Wskazówka przy skali nieliniowej wylicza pozycję przez
interpolację pomiędzy sąsiednimi punktami.

#### Edytor przebiegu skali

Nieliniowy przebieg ustawia się w panelu właściwości przez klikalny, dwuosiowy
wykres. Oś X przedstawia wartość z zakresu, a oś Y znormalizowaną pozycję na
skali od 0 do 1 (następnie renderer przelicza ją na kąt Range). Użytkownik
widzi bieżącą krzywą i może:

- kliknąć wykres, aby dodać punkt value/position;
- przeciągać punkt, aby ustawić przebieg skali;
- zaznaczyć punkt i usunąć go klawiszem Delete lub przyciskiem Remove point;
- ustawiać dokładne value i position w polach Number input;
- zablokować skrajne punkty: minimum = 0 oraz maksimum = 1.

Wykres zachowuje rosnący porządek wartości i pozycji, więc nie pozwala tworzyć
przecięć ani cofającej się skali. Wartości punktów są zawsze całkowite, a przy
włączonym snappingu używają projektowego kroku Distance snap. Pozycje zawsze
używają kroku `0,05`. Przy
`valueDirection=descending` wykres pokazuje i edytuje efektywne pozycje
`1 - position`, pozostawiając zapisane punkty w porządku rosnącym. Custom nie ma
osobnej opcji odbicia kształtu.

Nad wykresem są trzy jawne przyciski trybu:

| Przycisk EN  | Działanie                                              |
| ------------ | ------------------------------------------------------ |
| Linear       | ustawia dwa punkty krańcowe i równomierne mapowanie    |
| Logarithmic  | tworzy logarytmiczne mapowanie dla dodatniego zakresu  |
| Custom curve | pozwala tworzyć i przeciągać własne punkty na wykresie |

Każda zmiana trybu jest akcją destrukcyjną i wymaga potwierdzenia. Wybrany tryb
otrzymuje własną domyślną definicję; wartości graniczne ani punkty Custom nie są
przenoszone między trybami. Import CSV nie jest elementem planu.
Kierunek wartości jest niezależny od trybu i nie jest resetowany. Dla Logarithmic
pole **Detail emphasis** wybiera, czy więcej miejsca na łuku otrzymują niskie,
czy wysokie wartości; nazwa nie zależy od ich lewej lub prawej pozycji.
Granice domeny wszystkich trybów oraz wartości Start/End/Step warstw skali są
całkowite. Ułamkowe etykiety Numeric Scale powstają wyłącznie przez Value
multiplier i Decimal places.

Snapping jest domyślnie włączonym ustawieniem edytora i działa podczas
interaktywnej zmiany pozycji, promienia lub kąta. Domyślne, niezależne kroki
to **2 mm** dla odległości i **10°** dla kąta. Obsługuje:

- angle snap — przyciąganie do kroku kąta i do kątów znaczników aktywnej skali;
- radius snap — przyciąganie do promienia Range, krawędzi oraz wcześniej
  utworzonych elementów;
- point snap — przyciąganie do środka, osi wskazówki i punktów skali;
- przełącznik Snap oraz osobne pola Distance snap (mm) i Angle snap (°).

Ustawienia snappingu nie zmieniają wyniku renderowania projektu. Są lokalną
preferencją edytora przechowywaną razem z ustawieniami autosave w localStorage,
nie elementem eksportowanego JSON-a.

### Label: tekst po ścieżce Range

Label obsługuje layout punktowy oraz `text-arc`. Tekst po ścieżce przechowuje
offset promienia, granice w wartościach Range, wyrównanie oraz kierunek. Renderer
SVG używa `path` i `textPath`; kąty nie są zapisywane w Label, lecz wynikają ze
wspólnego mapowania i geometrii Range.

### Fonty

MVP używa wyłącznie web-safe i systemowych fontów dostępnych w przeglądarce.
Lista wyboru pokazuje tylko zweryfikowane rodziny, a renderer stosuje
zdefiniowany fallback, gdy wybrany font nie jest dostępny. Ładowanie lokalnego
fontu z komputera użytkownika pozostaje możliwym rozszerzeniem: wymaga osobnego
mechanizmu File API, jawnej informacji o licencji oraz zasad zapisu/ponownego
udostępniania projektu.

## 6. Stan techniczny

### Co przenieść jako założenie produktu

- Dobrze zdefiniowany model domeny: projekt → warstwy → Range jako wspólny
  układ współrzędnych i skala wartości.
- Matematyka renderowania jest w kodzie źródłowym (global.cs i klasy warstw).
- Nie ma serwera, kont ani współdzielenia; pierwsza wersja WWW może działać
  wyłącznie lokalnie w przeglądarce.
- Przykłady obrazów pokazują użyteczność modelu: zegar, tachometr i podwójne
  skale. Są inspiracją dla scenariuszy produktu, nie wzorcem kompatybilności.

### Dług techniczny i ograniczenia

- WPF/.NET Framework 4.6.1 oznacza Windows-only i starą platformę.
- Stan globalny, UI, trwałość danych oraz renderer są sprzężone w klasie Global.
- PropertyGrid oparty na refleksji utrudnia ergonomiczne formularze i walidację.
- Renderer tworzy kontrolki WPF, co utrudnia testy oraz zależy od systemowych
  fontów.
- Są puste bloki catch, więc diagnostyka błędów jest znikoma.
- Brakuje testów automatycznych, CI i opisanego procesu budowania.
- DataManagementSystem.dll i binarny format .ggp nie powinny wejść do nowej
  architektury; nie są potrzebne dla niezależnej aplikacji.
- Repozytorium ma licencję GPL-3.0. Nową implementację należy tworzyć od
  podstaw i nie kopiować kodu ani zasobów bez świadomego wyboru licencji oraz
  sprawdzenia jego skutków.

## 7. Rekomendowany stack

Rekomendacja: **Next.js (App Router) + TypeScript + React**. W pierwszym
wydaniu aplikacja nadal może być całkowicie klientowa; Next.js zapewnia jednak
dobrą strukturę, dokumentację oraz prostą drogę do późniejszego API.

| Warstwa       | Propozycja                                                                   | Powód                                                                              |
| ------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Aplikacja     | Next.js (App Router) + TypeScript                                            | routing, dokumentacja i gotowość na API                                            |
| Mini-wiki     | widok Help w aplikacji, zasilany statyczną treścią Next.js/MDX               | klikalna pomoc dla użytkownika, bez zewnętrznej strony i bez komend deweloperskich |
| Stylowanie    | Tailwind CSS v4, własny theme config                                         | spójne tokeny, responsywne utility classes i brak rozproszonych wartości kolorów   |
| Komponenty    | własny Atomic Design, z Radix UI tam gdzie potrzebna jest dostępna prymitywa | spójny interfejs bez narzucania gotowego wyglądu                                   |
| Stan          | Redux Toolkit + React-Redux                                                  | centralny, lokalny store projektu z czytelną historią działań                      |
| Dane          | Zod + JSON Schema                                                            | walidacja importu i wersjonowanie                                                  |
| Renderer      | SVG jako źródło prawdy, Canvas do PNG                                        | wektorowy podgląd i łatwa kontrola DOM                                             |
| Eksport PDF   | jsPDF + svg2pdf.js                                                           | PDF z zachowaniem geometrii wektorowej i skalą wydruku                             |
| Eksport SVG   | serializacja renderowanego SVG                                               | edytowalny, niezależny od rozdzielczości plik wektorowy                            |
| Pliki lokalne | File System Access API z fallbackiem upload/download                         | otwieranie i zapisywanie plików JSON bez serwera                                   |
| Lokalizacja   | next-intl oraz komunikaty w plikach locale                                   | gotowość na kolejne języki, start wyłącznie z en                                   |
| Testy         | Vitest, React Testing Library, snapshoty SVG/PNG                             | testy matematyki, UI i regresji bez osobnej warstwy E2E                            |
| Dostawa       | ESLint, Prettier, GitHub Actions, Vercel lub static export                   | powtarzalny build                                                                  |

SVG jest lepszym punktem wyjścia niż sam Canvas: aplikacja ma mało, ale
precyzyjnych figur i tekstów; SVG daje skalowalny podgląd, selekcję elementów i
łatwy eksport. Canvas można dodać później, jeśli profilowanie wykaże potrzebę.

### Lokalizacja interfejsu

Interfejs od pierwszej wersji ma być przygotowany na lokalizację, ale dostarczany
wyłącznie po angielsku (en). Każdy widoczny tekst — etykieta, tooltip, komunikat
walidacji, dialog potwierdzenia i nazwa właściwości — musi pochodzić z klucza
tłumaczenia, a nie być wpisany w komponencie. Wartości enumów należy
prezentować przez tłumaczenia, a w JSON-ie przechowywać stabilne,
nieprzetłumaczone identyfikatory, np. shortArrow.

W MVP nie trzeba pokazywać przełącznika języka, gdy dostępny jest tylko en.
Routing i provider lokalizacji powinny jednak obsłużyć kod locale, aby dodanie
np. polskiego nie wymagało refaktoryzacji. Podział komunikatów: common, project,
layers, properties, dialogs, validation i help.

### Architektura tras

- / — tymczasowy landing page / placeholder; nie zawiera edytora;
- /app — właściwa aplikacja Gauge Generator;
- /app/help — mini-wiki otwierana wewnątrz aplikacji, z możliwością powrotu
  do edytora i zachowaniem bieżącego projektu w local state.

### Wygląd i układ aplikacji

Pierwsza wersja używa wyłącznie **light mode**. Interfejs ma być czysty,
spokojny i narzędziowy: niewiele dekoracji, czytelne obramowania, dużo wolnej
przestrzeni oraz jeden wyraźny kolor akcentu. Nie projektujemy dark mode ani
przełącznika motywu na tym etapie.

Układ widoku /app:

1. u góry znajduje się poziomy pasek akcji;
2. pod nim po lewej jest pojedynczy sidebar;
3. sidebar przełącza się poziomym sliderem między listą warstw a edytorem
   zaznaczonej warstwy;
4. całą pozostałą przestrzeń po prawej zajmuje podgląd SVG projektu.

Sidebar jest jednym panelem o stałej szerokości, z wewnętrznym poziomym
kontenerem zawierającym widok Layers i widok Properties. Po wyborze warstwy
zawartość przesuwa się w lewo, a od prawej wyjeżdża jej edytor. Na górze widoku
Properties znajduje się pełnoszerokowy przycisk Back to layers, który odwraca
animację i wraca do listy. Nie renderujemy dwóch kolumn sidebara obok siebie;
jest to jeden, czytelny mechanizm zmiany trybu panelu.

#### Pasek akcji

Pasek ma stałą wysokość, jasne tło i dolną linię oddzielającą go od edytora.
Każda akcja jest jednym przyciskiem z ikoną oraz angielską etykietą w tym samym
wierszu, a także z dostępnym tooltipem i aria-label. Kolejność: New project,
Open, Download, Import, Export, Undo, Redo, Restore, Examples, Help center.

Przy zmniejszaniu dostępnej szerokości priorytetowo widoczne pozostają New
project, Open, Download, Export, Undo i Redo. Pozostałe akcje są kolejno
przenoszone do ostatniego
przycisku **More actions** z ikoną trzech kropek. Menu nie może ukrywać akcji
bez zapewnienia dostępu klawiaturą. Na bardzo małym ekranie pasek pozostaje
poziomy i przewijany lub używa skróconych etykiet; edytor nie zakłada pełnej
obsługi mobilnej w MVP.

#### Przeglądarka warstw

Lewy panel zawiera nagłówek Layers, przycisk Add layer, przycisk Project
settings oraz pionową listę warstw. Każdy wiersz zawiera miniaturowy render
warstwy, nazwę, kolorowy napis typu, przycisk widoczności oraz stan zaznaczenia.
Miniatura jest generowana z tego samego renderera SVG co podgląd, ale w małym,
ustandaryzowanym viewBox. Wiersz warstwy zawiera uchwyt drag-and-drop, nazwę,
typ, widoczność i usunięcie po potwierdzeniu. Duplicate nie jest jeszcze
częścią MVP.

Range nie ma reprezentacji końcowej widocznej na tarczy. Jest w osobnej sekcji
Ranges, więc jego wpis listy pozostaje zwarty: nazwa oraz akcje edycji/usuwania,
bez miniatury lub badge udającego finalny rysunek.

Aktywna warstwa wyróżnia się jasnoczerwonym tłem oraz czerwonym wskaźnikiem po
lewej, a nie wyłącznie kolorem tekstu. Pozwala to zachować czytelność i
dostępność. Warstwę wybiera się z listy — tak jak w oryginalnym projekcie —
nie przez kliknięcie obiektu na podglądzie. W oryginale wejście do edycji
następowało przez dwuklik na elemencie listy, a najechanie ikoną warstwy
uruchamiało szybki podgląd tylko tej warstwy; to założenie jest poprawne.

Nowa wersja zachowuje hover preview na miniaturze: tymczasowo renderuje tylko
daną warstwę i jej zależny Range, aby użytkownik nie tracił kontekstu
geometrycznego. Kliknięcie nazwy wiersza otwiera widok Properties w sliderze;
dwuklik jest również wspierany. Nie ma osobnego przycisku ołówka. Kolejność
zmienia się przez uchwyt drag-and-drop (`dnd-kit`), bez przycisków Move up/down.

Miniatury nie są widoczne w widoku Properties. Ich render nie musi być
odświeżany po każdej zmianie formularza ani podczas przeciągania uchwytu;
aktualizuje się dopiero po użyciu Back to layers. Po wyjściu z edycji
interfejs właściwości i nakładki z uchwytami są niewidoczne.

#### Widok właściwości w sidebarze

Widok Properties jest drugim slajdem tego samego sidebara. Zaczyna się
pełnoszerokowym przyciskiem Back to layers, a niżej ma nagłówek z ikoną typu
i nazwą warstwy. Zawartość jest pionową listą zwijanych grup właściwości,
np. Basics, Position, Range, Font, Appearance i Export. Grupy są otwarte
domyślnie, gdy zawierają wymagane pola lub błąd walidacji.

Każdy wiersz właściwości ma nazwę po lewej oraz kontrolkę po prawej:

| Typ danych                         | Kontrolka                                          |
| ---------------------------------- | -------------------------------------------------- |
| string                             | Text input                                         |
| liczba całkowita / dziesiętna      | Number input z dozwolonym krokiem i ograniczeniami |
| liczba wygodna do regulacji        | Number input + Range slider                        |
| kolor                              | Color picker + pole HEX                            |
| boolean                            | Switch                                             |
| enum                               | Select / dropdown                                  |
| zależność od Range                 | Select z nazwami dostępnych Range                  |
| tekst wielowierszowy w przyszłości | Textarea                                           |

Opis właściwości, jednostka, zakres i komunikat walidacji są widoczne przy
fokusie lub błędzie. Walidacja działa w trakcie edycji, ale nie blokuje wpisania
wartości pośredniej; niepoprawna wartość jest oznaczona i nie może zostać
zapisana/wyeksportowana bez poprawienia.

#### Podgląd

Podgląd zajmuje cały obszar roboczy po prawej, ma neutralne tło oraz wyśrodkowany
SVG. Powinien reagować natychmiast na poprawne zmiany właściwości. Przy aktywnej
warstwie pokazuje subtelne wyróżnienie obiektu i opcjonalną nakładkę edycyjną,
którą użytkownik może ukryć. Podgląd nie zmienia kolorów projektu na potrzeby
motywu aplikacji.

Pusty projekt pokazuje w tym miejscu ekran powitalny zamiast pustego SVG.
Komunikat zachęca do Create first Range i oferuje przycisk otwarcia katalogu
Examples / starter projects. Dzięki temu użytkownik od razu rozumie, że Range
jest pierwszym wymaganym krokiem przy budowaniu tarczy.

### Paleta kolorów - light mode

| Token                | Kolor   | Zastosowanie                                     |
| -------------------- | ------- | ------------------------------------------------ |
| color-app-bg         | #F6F7F9 | tło aplikacji i obszaru roboczego                |
| color-surface        | #FFFFFF | paski, panele, dialogi i pola formularzy         |
| color-surface-subtle | #F0F2F5 | tło sidebara, grup i stanów hover                |
| color-border         | #D8DCE2 | obramowania, separatory i nieaktywne kontrolki   |
| color-text           | #20242B | podstawowy tekst i ikony                         |
| color-text-muted     | #626B77 | opisy, etykiety pomocnicze i metadane            |
| color-accent         | #C62828 | główne akcje, fokus, zaznaczenie i aktywne ikony |
| color-accent-hover   | #A61F1F | hover / pressed dla akcentu                      |
| color-accent-subtle  | #FCE8E8 | tło zaznaczenia i łagodne komunikaty             |
| color-danger         | #B42318 | błąd walidacji i akcje destrukcyjne              |
| color-focus-ring     | #E57373 | pierścień fokusu klawiatury                      |

Czerwień jest zarezerwowana dla znaczących stanów i głównej akcji, a nie dla
całej dekoracji interfejsu. Kontrast tekstu oraz ikon musi spełniać WCAG AA;
kolor nigdy nie może być jedynym nośnikiem informacji o błędzie, zaznaczeniu
lub stanie widoczności.

### Tailwind i konfiguracja design tokens

Cała paleta z tabeli ma być zdefiniowana centralnie w konfiguracji motywu
Tailwind, a nie powielana jako wartości HEX w komponentach. Dla Tailwind v4
konfiguracją motywu jest deklaracja theme w pliku globalnego CSS; generuje ona
klasy narzędziowe dla kolorów, np. bg-app-bg, text-accent i border-border.
W razie użycia pliku tailwind.config.ts, jego wartości muszą pozostać jednym
źródłem prawdy dla tych samych tokenów.

Do konfiguracji należy dodać także tokeny promieni, cieni, odstępów, wysokości
paska akcji, szerokości obu kolumn sidebara i breakpointów. Własne klasy CSS
wolno tworzyć tylko dla złożonych zachowań, których nie da się czytelnie opisać
utilities, np. układu SVG, animacji wysuwania panelu i druku PDF.

### React Atomic Design i wzorce kompozycji

Komponenty interfejsu należy organizować według Atomic Design, przy jednoczesnym
podziale kodu domenowego na features:

| Poziom    | Przykłady w aplikacji                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Atoms     | ActionButton, Tooltip, TextInput, NumberInput, RangeSlider, Switch, Select, ColorInput, FormLabel, Divider       |
| Molecules | FieldRow, NumberField, ColorField, LayerListItem, ConfirmationModal, PropertyGroupHeader                         |
| Organisms | ActionToolbar, SidebarSlider, LayersView, PropertiesView, LayerForm, SvgPreview, ExportPdfDialog, HelpNavigation |
| Templates | EditorTemplate, HelpTemplate, LandingTemplate                                                                    |
| Pages     | route /, /app i /app/help                                                                                        |

Kod domenowy, renderer SVG, klasy Layer, schematy Zod i operacje plikowe żyją
poza Atomic Design, w modułach features/editor, features/project i lib. Atomy
nie mogą znać modelu GaugeProject ani konkretnych typów warstw.

Złożone organizmy korzystają z compound components i własnego contextu.
Przykładowo SidebarSlider składa się z Provider, LayersView i PropertiesView,
a widok Layers z Header, List, Item i Actions.
Współdzielony kontrakt contextu ma trzy części: state, actions i meta.
ReduxProvider i adaptery selectorów są jedynymi miejscami wiedzącymi, że stan
MVP jest realizowany przez Redux Toolkit; komponenty UI korzystają z
wyspecjalizowanych hooków i kontraktów, nie z implementacji store.

Destrukcyjne akcje korzystają z jednego rootowego `ConfirmationProvider` i
asynchronicznego `useConfirmation`; wywołujący przekazuje wyłącznie
przetłumaczony tytuł, opis i akcję wykonywaną po potwierdzeniu.

Store zawiera co najmniej projectSlice, editorSlice oraz historySlice.
projectSlice przechowuje aktualny DTO projektu, editorSlice stan UI
(zaznaczona warstwa, tryb sidebara, snapping i status autosave), a historySlice
utrzymuje stosy past i future, po maksymalnie 50 operacji każdy. Każda mutacja projektu jest pojedynczą akcją
odwracalną; przeciągnięcie uchwytu tworzy jedną operację dopiero po jego
zakończeniu, nie osobny wpis dla każdego ruchu kursora. Undo przenosi stan na
stos future, a Redo przywraca go na past. Akcje wyłącznie UI, np. otwarcie
panelu, nie trafiają do historii.

Należy unikać komponentów z wieloma flagami boolean, np. Button z propsami
isCompact, isDanger, isIconOnly i isToolbar. Zamiast tego stosujemy jawne,
małe warianty oraz kompozycję: PrimaryButton, DangerButton i ToolbarButton.
Struktura ma być przekazywana jako children, a nie przez propsy
renderHeader lub renderFooter. Dla React 19 ref jest zwykłym propem - nie
stosujemy forwardRef.

### Zakres prywatności i trwałości danych w wersji 1

Wersja 1 pracuje w lokalnym stanie aplikacji. Użytkownik może pobrać projekt
jako plik JSON, zaimportować JSON lub wygenerować PNG, SVG albo PDF. Nie ma
kont użytkowników, logowania, backendu, analityki ani zbierania danych.

#### Autosave i przywracanie

Co domyślnie 3 minuty aplikacja zapisuje zwalidowany stan projektu do
localStorage. Przechowuje maksymalnie pięć najnowszych snapshotów, każdy z
wersją formatu i czasem zapisu. Po dodaniu szóstego usuwa najstarszy snapshot.
Nie jest to zamiennik pliku JSON, lecz mechanizm zabezpieczenia sesji
przeglądarki.

Po udanym autosave w prawym dolnym rogu pojawia się na kilka sekund status:
Saved locally — [czas]. Przy błędzie walidacji lub zapisu komunikat ma stan
warning/error i wyjaśnia, że użytkownik powinien pobrać JSON ręcznie. Przy
ponownym uruchomieniu aplikacja wykrywa lokalne snapshoty i oferuje Restore
albo Discard. Przycisk Restore na pasku akcji otwiera ten sam dialog, pokazuje
do pięciu dat zapisów i pozwala przywrócić wybrany bezpieczny snapshot.

Interwał 3 minuty jest wartością domyślną ustawienia lokalnego. Zapis jest też
wykonywany przed potencjalną utratą sesji, gdy przeglądarka obsłuży odpowiednie
zdarzenie, ale aplikacja nie deklaruje gwarantowanego zapisu przy awarii
przeglądarki.

#### Przygotowanie na grafiki i fonty

W MVP nie implementujemy jeszcze warstw z importowanym obrazem ani ładowania
fontów użytkownika. Format projektu pozostaje pojedynczym, przenośnym,
wersjonowanym JSON-em walidowanym przez Zod. Nie wprowadzamy SQLite, IndexedDB
ani innej bazy danych. Gdy potrzeba obrazów lub własnych fontów stanie się
realna, decyzję o ich formacie podejmiemy jako osobny krok, bez obciążania
bieżącego MVP przedwczesną abstrakcją.

### Mini-wiki i wbudowane przykłady

Aplikacja powinna zawierać małą, anglojęzyczną wiki jako zwykły widok
użytkownika wewnątrz aplikacji. Przycisk Documentation na głównym pasku otwiera
ekran Help (np. trasę /help), a użytkownik przechodzi po jego sekcjach przez
widoczne menu, odnośniki Previous/Next i przycisk Back to editor. Wiki nie
otwiera zewnętrznej strony, nie wymaga komendy, terminala, CMS-a ani backendu.

Technicznie treść może być statyczna (MDX lub komponenty Next.js), ale jest
renderowana jako część interfejsu aplikacji, z tą samą lokalizacją, nawigacją i
stylem co edytor.

Minimalna struktura wiki:

- Welcome / Getting started — cel aplikacji, tworzenie pierwszej tarczy,
  otwieranie, zapisywanie i eksport PNG;
- Interface — opis panelu projektu, panelu warstw, edytora właściwości i
  podglądu SVG;
- Layers — osobna sekcja dla każdego z ośmiu typów warstw, z opisem wszystkich
  właściwości, zakresami i grafiką;
- Projects — format JSON, walidacja oraz zasada relacji między warstwą a Range;
- Examples — opis wbudowanych przykładów i sposób ich otwierania.

Predefiniowane projekty należy przechowywać jako zwalidowane pliki JSON w
repozytorium, np. w katalogu src/examples, wraz z metadanymi: id, angielska
nazwa, opis, miniatura i ścieżka pliku. Ekran Home pokaże katalog przykładów.
Otwarcie przykładu ładuje jego kopię do local state — nie nadpisuje pliku
źródłowego i nie wymaga połączenia z siecią.

#### Deweloperski projekt workbench

W trybie deweloperskim (NODE_ENV=development) w katalogu Examples ma być
widoczny dodatkowy projekt **Layer workbench**. Ma zawierać reprezentatywny
Range oraz aktualnie rozwijany element/warstwę wraz z parametrami testowymi.
To umożliwia szybkie ręczne sprawdzenie renderera, formularza właściwości i
eksportu bez tworzenia projektu od zera.

Workbench jest wpisem generowanym wyłącznie w kodzie dla developmentu:

1. rejestr przykładów dodaje go tylko, gdy środowisko jest deweloperskie;
2. fabryka warstw wskazuje bieżący typ rozwijany przez programistę;
3. Zod waliduje wygenerowany DTO tak samo jak każdy zwykły przykład;
4. wpis, jego przełącznik i testowe dane nie są dołączane do produkcyjnego
   katalogu przykładów.

Docelowo warstwy można rozwijać pojedynczo, ustawiając stałą
ACTIVE_WORKBENCH_LAYER na odpowiedni typ. Każdy nowy typ powinien otrzymać
konfigurację workbencha i test wizualny zanim trafi do katalogu przykładów.

## 8. Katalog przycisków interfejsu

Poniższy katalog opisuje akcje obecnej aplikacji jako funkcjonalny punkt
odniesienia. W nowym interfejsie angielskie etykiety i tooltipy muszą korzystać
z lokalizacji. Import dotyczy wyłącznie nowego JSON-a, nie starszych plików ggp.

### Główny pasek projektu

| Etykieta EN | Akcja                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| New project | tworzy pusty projekt; przy niezapisanych zmianach prosi o decyzję                    |
| Download    | pobiera bieżący, zwalidowany projekt jako plik JSON na komputer                      |
| Import      | wybiera plik JSON; użytkownik decyduje, czy zastępuje projekt, czy importuje warstwy |
| Export      | otwiera menu lub dialog wyboru PNG, SVG albo PDF                                     |
| Undo        | cofa ostatnią zmianę w historii edytora                                              |
| Redo        | przywraca cofniętą zmianę                                                            |
| Restore     | otwiera dialog przywrócenia ostatniego lokalnego autosave                            |
| Examples    | otwiera katalog predefiniowanych projektów, w tym workbench w development            |
| Help center | otwiera mini-wiki wewnątrz aplikacji                                                 |

Export otwiera duże okno dialogowe zamiast bezpośrednio pobierać plik. Dialog
ma osobne, czytelne sekcje dla PNG, SVG i PDF, z podglądem właściwych ustawień
oraz jednym przyciskiem wykonania eksportu. Dolna część layoutu zawiera
zarezerwowane, nieaktywne miejsce na przyszły moduł Buy me a coffee; w MVP nie
jest to płatność, tracking ani wymagany element użycia aplikacji.

### Panel warstw

| Etykieta EN             | Akcja                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| Add layer               | otwiera wybór typu warstwy oraz formularz jej utworzenia                     |
| Project settings        | otwiera ustawienia projektu: płótno i snapping                               |
| Delete layer            | usuwa zaznaczoną warstwę po potwierdzeniu; blokuje usunięcie używanego Range |
| Duplicate layer         | tworzy kopię zaznaczonej warstwy z nową nazwą i identyfikatorem              |
| Move layer up           | przesuwa warstwę wyżej w kolejności nakładania                               |
| Move layer down         | przesuwa warstwę niżej w kolejności nakładania                               |
| Toggle layer visibility | ikona przy warstwie; ukrywa lub pokazuje ją na podglądzie                    |

Kliknięcie warstwy otwiera edytor, a najechanie może uruchamiać szybki podgląd
tylko tej warstwy. Docelowo przyciski przesuwania można uzupełnić
przeciąganiem, ale nie zastępować nim obsługi klawiatury.

### Edytor warstwy i ustawienia projektu

| Etykieta EN               | Akcja                                                         |
| ------------------------- | ------------------------------------------------------------- |
| Back to layers            | zamyka edytor i wraca do listy warstw                         |
| Reset layer               | przywraca domyślne właściwości wizualne aktualnej warstwy     |
| Show only this layer      | przełącza podgląd ograniczony do aktualnie edytowanej warstwy |
| Bring this layer to front | tymczasowo renderuje edytowaną warstwę na wierzchu            |
| Show editing overlay      | pokazuje pomocniczą nakładkę zaznaczenia; nie dotyczy Range   |
| Back to layers (settings) | zamyka ustawienia projektu                                    |

Trzy przełączniki podglądu są stanem interfejsu, więc nie powinny być zapisywane
w JSON-ie projektu. Pozostają aktywne podczas przełączania między warstwami;
reset zachowuje identyfikator, nazwę, widoczność oraz wybrany Range warstwy.

### Dialogi i ekran startowy

| Kontekst        | Etykieta EN            | Akcja                                                               |
| --------------- | ---------------------- | ------------------------------------------------------------------- |
| Create layer    | Create                 | tworzy warstwę po wybraniu typu, nazwy i Range dla warstw zależnych |
| Create layer    | Cancel                 | zamyka dialog bez zmian                                             |
| Duplicate layer | Duplicate              | zatwierdza utworzenie kopii                                         |
| Duplicate layer | Cancel                 | zamyka dialog bez zmian                                             |
| Import layers   | Import selected        | dodaje wybrane warstwy                                              |
| Import layers   | Select all / Clear all | zaznacza albo odznacza wszystkie importowalne warstwy               |
| Import layers   | Preview selected       | chwilowo pokazuje wyłącznie wybrane warstwy                         |
| Import layers   | Cancel                 | zamyka dialog bez zmian                                             |
| Home            | New project            | rozpoczyna pusty projekt                                            |
| Home            | Open project           | wybiera lokalny projekt                                             |
| Home            | Example project        | otwiera jeden z przykładowych projektów                             |
| Home            | Video tutorials        | otwiera stronę tutoriali                                            |
| Help            | Back to editor         | wraca z mini-wiki do bieżącego projektu bez utraty stanu            |
| Help            | Previous / Next        | przechodzi między kolejnymi sekcjami mini-wiki                      |

Wszystkie akcje destrukcyjne i potencjalnie utracone zmiany wymagają
zlokalizowanego dialogu potwierdzenia: Delete layer, Reset layer, New project,
Open project i zamknięcie edytora z niezapisanymi zmianami.

### Eksport PDF w skali

Eksport PDF jest osobną akcją i dialogiem od Export PNG. Ma tworzyć PDF z
elementami wektorowymi, aby linie, łuki i figury pozostały ostre przy druku i
powiększaniu. PNG nie powinien być jedyną zawartością PDF.

MVP PDF ma świadomie prosty zakres: pojedyncze płótno SVG na jednej stronie,
domyślnie A4, z automatycznie dobraną orientacją i zachowaniem wymiarów w mm.
Dialog może oferować tylko Fit to page oraz Actual size 1:1. Nie implementujemy
jeszcze wielu kopii na arkuszu, własnego formatu strony, marginesów ani
znacznika referencyjnego.

Skala oznacza rozmiar fizyczny na papierze. Płótno w mm daje jednoznaczne 1:1,
ale dokumentacja nadal instruuje użytkownika, aby w oknie druku wybrał Actual
size / 100% i wyłączył dopasowanie strony.

## 9. Model obiektowy, JSON i Zod

Nowa aplikacja powinna zachować podobne programowanie obiektowe: abstrakcyjna
klasa Layer definiuje wspólny kontrakt, a konkretne klasy warstw zawierają
walidację domenową i tworzenie elementów SVG. React ma wyświetlać wynik
rendererów, a nie przechowywać geometrię w komponentach.

```ts
abstract class Layer {
  constructor(
    public readonly id: string,
    public name: string,
    public visible: boolean,
  ) {}

  abstract readonly type: LayerType;
  abstract validate(context: ProjectContext): ValidationIssue[];
  abstract toSvg(context: RenderContext): React.ReactNode;
  abstract getEditingOverlay(context: OverlayContext): readonly EditingOverlayPrimitive[];
  abstract getHandles(context: OverlayContext): OverlayHandle[];
  abstract applyHandleDrag(handleId: string, pointer: CanvasPointMm, context: DragContext): Layer;
}

class Range {
  // niezależny kontekst geometrii i skali, nie jest wizualną Layer
}

class TickScale extends Layer {}
class NumericScale extends Layer {}
class Label extends Layer {}
class Arc extends Layer {}
class ClockHand extends Layer {}
class Ellipse extends Layer {}
class Rectangle extends Layer {}
```

Instancje klas nie powinny być zapisywane przez JSON.stringify bezpośrednio.
Warstwa trwałości konwertuje dane: JSON → Zod → DTO → instancje klas przy
odczycie oraz instancje → DTO → Zod → JSON przy zapisie. JSON pozostaje dzięki
temu prosty, bezpieczny i niezależny od kodu wykonawczego.

Nowy format powinien być jawnym i wersjonowanym JSON-em, niezależnym od Reacta
i renderera. Nie ma wymogu odczytu .ggp. Referencję obiektową RangeSource
zastępuje się stabilnym rangeId.

```ts
type GaugeProject = {
  format: "gauge-generator-web";
  version: 1;
  meta: {
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  canvas: {
    widthMm: number;
    heightMm: number;
    background: string;
    transparentBackground: boolean;
  };
  layers: LayerDto[];
  ranges: RangeDto[];
  extensions?: Record<string, unknown>;
};

type BaseLayer = { id: string; name: string; visible: boolean };
type DependentLayer = BaseLayer & { rangeId: string };
```

Zod jest jedyną bramą wejściową pliku. Schemat discriminatedUnion rozróżnia
warstwy po type, odrzuca nieznane pola i podaje ścieżkę błędu. Druga walidacja
domenowa sprawdza reguły między obiektami: unikalność id, istnienie rangeId oraz
poprawność rangeMin/rangeMax względem źródłowego Range.

Format JSON jest otwarty na rozwój, ale nie nieokreślony: metadata przechowuje
co najmniej tytuł i czasy utworzenia/modyfikacji, canvas opisuje fizyczny
rozmiar, a każda warstwa ma jawny type i parametry jako pary key-value.
Nowe opcjonalne możliwości trafiają najpierw do pola extensions albo do nowej
wersji formatu z migratorem. Nie zmieniamy znaczenia istniejącego pola bez
podniesienia version. Dzięki temu stare pliki pozostają możliwe do odczytu przez
migrację, a Zod nadal wykrywa literówki i uszkodzone dane.

```ts
const layerSchema = z.discriminatedUnion("type", [
  tickScaleSchema,
  numericScaleSchema,
  labelSchema,
  arcSchema,
  clockHandSchema,
  ellipseSchema,
  rectangleSchema,
]);

const projectSchema = z
  .object({
    format: z.literal("gauge-generator-web"),
    version: z.literal(1),
    canvas: canvasSchema,
    layers: z.array(layerSchema).max(80),
    ranges: z.array(rangeSchema).max(5),
  })
  .strict();
```

Specyfikacja musi jednoznacznie opisać układ współrzędnych, jednostki, punkt
zera i zwrot kąta, kolejność rysowania, zaokrąglenia, wartości graniczne oraz
fallback fontów. Od tych zasad zależy zgodność obrazów.

### Nakładki edycyjne i interakcja bezpośrednio na podglądzie

Każda warstwa definiuje dwa niezależne wyniki renderowania:

- właściwy element SVG, który jest częścią projektu i trafia do PNG, SVG oraz
  PDF;
- nakładkę edycyjną, widoczną wyłącznie dla aktualnie wybranej warstwy w
  edytorze, która pokazuje jej geometrię, zakres i interaktywne uchwyty.

Abstrakcyjna Layer udostępnia procedury getEditingOverlay, getHandles i
applyHandleDrag. Nakładka nie jest serializowana do JSON-a i nie jest częścią
eksportu. Jest deklaratywnym SVG, a wspólny kontroler edytora odpowiada za
pointer capture, przeliczenie ekranu na mm, snapping oraz przekazanie wyniku do
warstwy.

Uchwyty mają stabilne, semantyczne identyfikatory i typy, np. move, radius,
rotation, angleStart, angleEnd, rangeMin, rangeMax, scalePosition. Dzięki temu
warstwa opisuje swoją geometrię, a UI zachowuje wspólny styl uchwytów i
podpowiedzi.

Minimalny zestaw interaktywnych nakładek:

| Warstwa                    | Uchwyty na podglądzie                                                       |
| -------------------------- | --------------------------------------------------------------------------- |
| Range                      | środek, promień oraz początek i rozwarcie kąta zakresu; Range nie ma pivotu |
| Tick Scale / Numeric Scale | granice widocznego zakresu, promień oraz długość kresek/pozycję etykiet     |
| Arc                        | aktywny przedział wartości Range i uchwyt promienia                         |
| Clock Hand                 | obrót/wartość wskazówki, długość końca dodatniego i punkt osi               |
| Label                      | pozycja i obrót                                                             |
| Ellipse / Rectangle        | pozycja, szerokość, wysokość i obrót                                        |

Przeciągnięcie uchwytu aktualizuje te same właściwości, co formularz w
sidebarze; obie metody są równoważne. Snapping jest stosowany do każdego
przeciągnięcia: odległość do 2 mm i kąt do 10°. Każdy uchwyt ma minimalny, stały rozmiar
ekranowy zapewniający wygodne trafienie niezależnie od zoomu oraz etykietę
aktualnej wartości. W trakcie przeciągania overlay pokazuje zrozumiały odczyt,
np. Radius: 42 mm albo Angle: 120°.

### Strategia testów jednostkowych

Testy jednostkowe są tworzone razem z każdym komponentem i modułem domenowym.
Celem nie jest 100% coverage, tylko sprawdzenie podstawowych zadań, regresji
i zachowania istotnego dla użytkownika.

| Obszar                  | Co testujemy                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| klasy Layer i geometria | walidację, przeliczanie mm/kąt/wartość, SVG i obsługę przeciągnięcia uchwytu |
| snapping                | domyślne 2 mm i 10°, osobne kroki oraz tymczasowe wyłączenie                 |
| skale                   | liniową, logarytmiczną i custom curve, w tym interpolację wskazówki          |
| komponenty atomowe      | render, dostępność, kliknięcie, disabled/focus i podstawowe warianty         |
| organizmy UI            | wybór warstwy, slider sidebara, edycję właściwości, undo/redo i komunikaty   |
| pliki oraz autosave     | parsowanie Zod, błędny JSON, localStorage, fake timers i Restore             |

Stos narzędzi obejmuje wyłącznie Vitest dla logiki i komponentów oraz React
Testing Library dla interakcji użytkownika. Nie tworzymy osobnego pakietu ani
pipeline'u E2E w MVP.

W repozytorium należy utworzyć wspólne narzędzia testowe:

- factory createProject z sensownym domyślnym prostokątnym płótnem;
- fabryki createRange, createTickScale, createClockHand i pozostałych warstw,
  przyjmujące tylko właściwości zmieniane w danym teście;
- builder createEditorState, createTestStore oraz renderEditor, który
  automatycznie owija widok w ReduxProvider, lokalizację i wymagane contexty;
- makeRenderContext oraz makeOverlayContext dla czystych testów rendererów;
- mockFileApi i mockLocalStorage oraz kontrolowany zegar do testów autosave;
- katalog fixtures z małymi, zwalidowanymi projektami JSON.

Test komponentu nie może samodzielnie konstruować pełnego projektu, providerów
ani mocków przeglądarki. Używa fabryki lub helpera, a test podaje wyłącznie
dane istotne dla danego scenariusza. Każda nowa warstwa wymaga minimum testu
renderowania, walidacji oraz jednego testu uchwytu nakładki.

## 10. Plan realizacji nowej aplikacji

### Etap 0 — decyzje produktowe i fundament

1. Zatwierdzić nowe doświadczenie użytkownika i zestaw warstw dla MVP,
   wykorzystując obecny projekt jako inspirację funkcjonalną.
2. Spisać od nowa kontrakt matematyczny: układ współrzędnych, zwrot kąta,
   jednostki, wartości brzegowe i kolejność renderowania.
3. Zdefiniować nowy schemat JSON v2, w tym krzywe skali linear/logarithmic/
   custom, oraz dwa–trzy przykładowe projekty JSON.
4. Wybrać niezależny branding, UI i assety; nie przenosić kodu, ikon ani
   formatu .ggp z aplikacji WPF.

### Etap 1 — rdzeń i renderer

1. Utworzyć projekt Next.js oraz podstawowy interfejs: pasek akcji, slider
   sidebara, pusty podgląd SVG i jasny motyw Tailwind.
2. Zbudować klasy Layer, DTO, Zod, Redux Toolkit store, historię undo/redo,
   autosave localStorage i wspólne fabryki testowe.
3. Zaimplementować Range jako niezależny obiekt mapowania wartości, bez
   miniatury finalnego SVG, wraz z nakładką, uchwytami oraz testami.

### Etap 2 — kolejne warstwy, po jednym kroku

Każdy kolejny krok obejmuje jeden typ warstwy: model, formularz, SVG,
nakładkę edycyjną, miniaturę, walidację Zod, testy oraz przykład workbench.
Kolejność zwiększa złożoność stopniowo:

1. Tick Scale;
2. Numeric Scale;
3. Label;
4. Arc;
5. Clock Hand;
6. Ellipse;
7. Rectangle.

Po każdym kroku należy ocenić ergonomię parametrów i w razie potrzeby
skorygować model, formularze oraz wspólne abstrakcje zanim powstanie kolejna
warstwa. Skale logarytmiczne i custom curve rozwijają wspólny moduł skali przy
wdrażaniu Tick Scale oraz Numeric Scale.

### Etap 3 — dopracowanie i wydanie

1. Dodać Import, Download (JSON), PNG, SVG oraz podstawowy PDF.
2. Dopracować responsywność, dostępność i komunikaty walidacyjne.
3. Rozbudować bibliotekę przykładów i testy regresji dla uzgodnionych zasad.
4. Udokumentować nowy JSON i publiczne API renderera, a następnie opublikować
   statyczną aplikację.

## 11. Ryzyka i decyzje

| Temat                         | Ryzyko         | Zalecenie                                                                                        |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| Granice inspiracji a reużycie | średnie        | traktować starszy projekt jako analizę produktu; nowe UI, kod, assety i JSON tworzyć niezależnie |
| Fonty                         | średnie        | web-safe lub legalnie osadzone fonty i widoczny fallback                                         |
| Identyczne piksele            | średnie        | testy z tolerancją, bo WPF i SVG różnie antyaliasują                                             |
| Modyfikatory podglądu         | niskie         | zachować jako stan UI, nie serializować do v2                                                    |
| Backend i współpraca          | niskie dla MVP | odłożyć, ale utrzymać model niezależny od UI                                                     |
| Licencja starego repozytorium | średnie        | przed użyciem fragmentów kodu lub zasobów ustalić licencję nowego projektu                       |

## 12. Zakres sensownego MVP

MVP: osiem typów warstw, wiele Range, podgląd SVG, kolejność/widoczność/
klonowanie, typowane formularze, Import i Download (JSON), localStorage autosave
co 3 minuty z Restore, skale liniowe, logarytmiczne i edytowalne krzywe
nieliniowe, snapping, interaktywne nakładki edycyjne, PNG, SVG, wektorowy PDF
w skali, mini-wiki, własne przykłady, undo/redo oraz testy jednostkowe z
wspólnymi fabrykami. Chmura, konta, współpraca i telemetria powinny wejść
dopiero w kolejnych iteracjach.

Taka kolejność daje niezależny od Windows edytor, który wykorzystuje dojrzałą
ideę modelu warstw, ale nie dziedziczy starego formatu, UI ani zależności.
