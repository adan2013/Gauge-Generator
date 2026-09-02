# Przewodnik po Gauge Generator

Gauge Generator to działający w przeglądarce edytor grafiki wektorowej do projektowania wskaźników, tarcz, paneli przyrządów i innych grafik opartych na wartościach. Projekt składa się z wielokrotnie używanych **zakresów** i warstw wizualnych. Każdą zmianę możesz od razu podejrzeć, a następnie pobrać edytowalny projekt lub wyeksportować gotową grafikę.

> Wszystko pozostaje w Twojej przeglądarce. Nie ma konta ani przestrzeni w chmurze — pobierz plik projektu, gdy chcesz zachować trwałą kopię.

## Co możesz zbudować

Gauge Generator łączy precyzyjne wymiary fizyczne z pracą na warstwach znaną z programów graficznych. Nadaje się do tworzenia prędkościomierzy, obrotomierzy, manometrów, wskaźników baterii, paneli sterowania i ozdobnych tarcz.

- Pracuj na prostokątnym obszarze roboczym mierzonym w milimetrach.
- Twórz kilka powiązanych skal na podstawie maksymalnie pięciu niezależnych zakresów.
- Łącz liniowe, logarytmiczne i niestandardowe mapowania wartości.
- Rozmieszczaj, duplikuj, ukrywaj i zmieniaj kolejność warstw wizualnych.
- Edytuj geometrię bezpośrednio w podglądzie za pomocą uchwytów i nakładek.
- Cofaj i ponawiaj zmiany oraz przywracaj lokalne zapisy automatyczne.
- Pobieraj edytowalny projekt JSON albo eksportuj pliki SVG, PNG i PDF.

## Rozpocznij pierwszy projekt

Najszybciej poznasz edytor, otwierając **Przykłady** na górnym pasku narzędzi. Wybierz projekt, otwórz go i obejrzyj jego warstwy oraz właściwości. Przykłady są zwykłymi edytowalnymi projektami, więc możesz bezpiecznie z nimi eksperymentować.

Aby zacząć od początku:

1. Otwórz edytor i wybierz **Utwórz pierwszy zakres**.
2. Nazwij zakres i określ jego środek, promień, kąty, dziedzinę wartości oraz mapowanie.
3. Wróć do **Warstw**, wybierz **Warstwa**, a następnie typ warstwy wizualnej.
4. Wybierz zakres źródłowy, utwórz warstwę i dostosuj jej właściwości.
5. Powtarzaj te kroki, aż podgląd będzie zgodny z projektem.
6. Użyj **Pobierz**, aby zachować edytowalny projekt, oraz **Eksportuj**, aby utworzyć grafikę.

> Zakres musi istnieć przed dodaniem warstwy wizualnej. Traktuj go jako niewidoczny układ współrzędnych i skalę wartości współdzieloną przez wszystkie elementy jednej tarczy.

## Omówienie interfejsu

Przestrzeń robocza ma trzy główne obszary: pasek narzędzi u góry, panel boczny po lewej i podgląd obszaru roboczego po prawej.

![Przestrzeń robocza Gauge Generator z przykładem Grand tourer, panelem warstw, paskiem narzędzi i podglądem](/docs/editor-overview.png)

### Pasek narzędzi projektu

Pasek narzędzi służy do zarządzania całym projektem:

| Działanie          | Co robi                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| **Nowy projekt**   | Rozpoczyna pusty projekt po potwierdzeniu odrzucenia niezapisanej pracy. |
| **Otwórz**         | Sprawdza i otwiera projekt Gauge Generator w formacie JSON.              |
| **Pobierz**        | Zapisuje bieżący edytowalny projekt na komputerze.                       |
| **Eksportuj**      | Tworzy pliki SVG, PNG lub PDF, także osobno dla każdej warstwy.          |
| **Cofnij / Ponów** | Przechodzi między ostatnimi prawidłowymi zmianami projektu.              |
| **Przywróć**       | Otwiera jeden z pięciu najnowszych zapisów w tej przeglądarce.           |
| **Przykłady**      | Otwiera kompletne projekty, które można oglądać i edytować.              |
| **Centrum pomocy** | Otwiera ten przewodnik w osobnej karcie przeglądarki.                    |

W węższych oknach rzadziej używane działania są przenoszone do menu **Więcej działań**.

### Panel boczny warstw

Panel boczny oddziela **Zakresy** od **Warstw wizualnych**. Wybierz element, aby go edytować, użyj przycisku oka, aby sterować widocznością warstwy, i przeciągaj warstwy, aby zmienić ich kolejność. Pierwsza warstwa wizualna na liście znajduje się najwyżej w gotowej grafice.

Najedź na miniaturę warstwy, aby tymczasowo wyświetlić tylko ją. To narzędzie podglądu nie zmienia projektu, zaznaczenia ani eksportowanego wyniku.

Widok **Projekt** zawiera ustawienia obszaru roboczego: szerokość, wysokość, tło, przezroczystość i przyciąganie. Selektor warstw otwiera się po naciśnięciu **Warstwa** i pozwala wybrać typ, zanim element zostanie dodany.

### Właściwości i elementy edycyjne

Wybranie zakresu lub warstwy otwiera edytor właściwości. Pola liczbowe używają tych samych jednostek fizycznych co projekt, a suwaki pozwalają szybko sprawdzać prawidłowe wartości. Zmiany są natychmiast widoczne w podglądzie.

Podczas edycji warstwy elementy sterujące u dołu panelu pozwalają:

- wyświetlić tylko edytowaną warstwę;
- tymczasowo przenieść ją na wierzch;
- pokazać lub ukryć nakładkę edycyjną;
- zresetować ustawienia wizualne bez zmiany tożsamości, nazwy, widoczności ani zakresu źródłowego.

Wiele warstw udostępnia też uchwyty bezpośrednio w podglądzie. Przeciąganie uchwytu i edycja powiązanego pola to dwa sposoby zmiany tych samych danych projektu.

Ustawienia typografii zawierają niewielki zestaw czcionek dostępnych na różnych platformach. Naciśnij **Wczytaj lokalne czcionki**, aby zgodna przeglądarka wyświetliła rodziny czcionek zainstalowane na komputerze. Przeglądarka poprosi wcześniej o pozwolenie. Gauge Generator zapisuje w pliku JSON tylko nazwę rodziny — plik czcionki nie jest kopiowany do projektu. Na innym komputerze może więc zostać użyta czcionka zastępcza.

![Właściwości warstwy wskazówki i jej nakładka edycyjna w podglądzie](/docs/layer-properties.png)

### Podgląd na żywo

Podgląd zawsze dopasowuje cały obszar roboczy do dostępnego miejsca. Etykieta w lewym dolnym rogu pokazuje wymiary oraz poziom powiększenia. Nakładki edycyjne są tylko pomocnicze i nigdy nie trafiają do eksportu.

Kliknięcie pustego miejsca nie zmienia zaznaczenia. Jeśli podgląd wygląda zbyt prosto, sprawdź, czy kursor nie znajduje się nad miniaturą, czy warstwa nie jest ukryta albo czy nie włączono izolowania warstwy.

## Zakresy: podstawa projektu

**Zakres** nie jest widoczną warstwą. Określa wspólną geometrię i mapuje wartości projektu na pozycje wzdłuż tej geometrii. Każda warstwa wizualna odwołuje się do jednego zakresu, dzięki czemu kreski, liczby, łuki, etykiety i wskazówki pozostają wyrównane nawet po zmianie kształtu tarczy.

Zakres określa:

- środek i promień na obszarze roboczym;
- kąt początkowy i kąt rozwarcia;
- kształt zaokrąglonego kwadratu — od niemal kwadratowego do kołowego;
- rosnący lub malejący kierunek wartości;
- minimalną i maksymalną wartość całkowitą;
- liniowe, logarytmiczne lub niestandardowe mapowanie wartości.

### Definicje skali

Skala **liniowa** rozkłada równe zmiany wartości na równych odległościach. To najlepszy wybór domyślny dla większości przyrządów.

Skala **logarytmiczna** przydziela różną ilość miejsca niskim i wysokim wartościom. Użyj podkreślenia szczegółów, aby wskazać koniec dziedziny wymagający większej przestrzeni.

Skala **niestandardowa** mapuje wartości za pomocą zestawu rosnących punktów kontrolnych. Użyj jej dla nietypowych skal opartych na pomiarach lub istniejącej fizycznej tarczy.

Zmiana zakresu może wpłynąć na każdą powiązaną warstwę. Edytor ostrzega o dużych zmianach zależności i w razie potrzeby ogranicza geometrię lub widoczne wartości, aby projekt pozostał prawidłowy.

## Typy warstw wizualnych

Warstwy wizualne są wyświetlane zgodnie z kolejnością na liście: pierwszy element jest najwyżej. Każda warstwa ma wymaganą nazwę, stan widoczności i zakres źródłowy.

![Selektor warstw wizualnych dostępnych w Gauge Generator](/docs/layer-picker.png)

### Podziałka kreskowa {#tick-scale}

Tworzy powtarzające się kreski wzdłuż zakresu źródłowego. Ustaw widoczne wartości początkową i końcową, dodatni krok, przesunięcie promienia, długość i szerokość kresek oraz kolor. Pozycje zawsze podążają za mapowaniem zakresu, więc te same ustawienia działają ze skalami kołowymi, zaokrąglonymi, logarytmicznymi i niestandardowymi.

### Podziałka liczbowa {#numeric-scale}

Umieszcza sformatowane liczby wzdłuż zakresu. Wybierz widoczny przedział i krok, a następnie ustaw promień, orientację, czcionkę, rozmiar, kolor, wyróżnienie, mnożnik i miejsca dziesiętne. Zapisane wartości skali pozostają całkowite; wartości ułamkowe są tworzone tylko na potrzeby prezentacji.

### Etykieta {#label}

Dodaje dowolny tekst ze wspólnymi ustawieniami typografii. Etykietę można umieścić jako zwykły obiekt punktowy z przesunięciem i obrotem albo poprowadzić wzdłuż wybranego przedziału ścieżki zakresu. Tekst na ścieżce obsługuje wyrównanie i kierunek bez zapisywania ręcznych kątów.

### Łuk {#arc}

Rysuje kolorowy pas na niezerowym przedziale wartości — nadaje się do ostrzeżeń, celów i stref pracy. Ustaw wartości początkową i końcową, przesunięcie promienia, grubość, kolor i zaokrąglenie końców. Kąty są zawsze wyprowadzane z zakresu źródłowego.

### Wskazówka {#needle}

Pokazuje jedną wartość na zakresie. Dostosuj wartość, długość przednią, ogon, szerokość, styl końcówki, kolory i opcjonalną piastę. Punkt obrotu zawsze znajduje się w środku zakresu, więc wskazówka pozostaje wyrównana po jego przesunięciu.

### Elipsa i prostokąt {#ellipse-and-rectangle}

Dodają płaskie kształty przeznaczone na piasty, panele, maski i elementy ozdobne. Oba obsługują niezależną szerokość i wysokość, przesunięcie środka, obrót, wypełnienie, kolor i szerokość obramowania. Prostokąty mogą mieć zaokrąglone narożniki.

### Linia {#line}

Dodaje prostą linię konstrukcyjną lub wskaźnikową położoną względem środka zakresu. Możesz zmieniać jej środek, długość, obrót, szerokość i kolor. Nakładka udostępnia środek i oba końce do bezpośredniej edycji.

### Ikona {#icon}

Umieszcza ikonę z katalogu Lucide. Wyszukaj ikonę, a następnie ustaw jej szerokość, wysokość, środek, obrót, kolor i szerokość obrysu. Ikony pozostają kształtami wektorowymi w plikach SVG i PDF.

## Praca z projektami

Pliki projektów Gauge Generator są sprawdzanymi dokumentami JSON zawierającymi ustawienia obszaru roboczego, zakresy, warstwy wizualne i metadane. Polecenie **Otwórz** zastępuje bieżący projekt dopiero po pomyślnej walidacji pliku.

Edytor co kilka minut tworzy lokalny zapis i zachowuje pięć najnowszych migawek. To pomoc w odzyskiwaniu danych powiązana z tą przeglądarką, a nie zamiennik pobranych plików projektu.

Użyj:

- **Pobierz**, gdy chcesz później kontynuować edycję;
- **SVG** do skalowalnej grafiki wektorowej i dalszej edycji;
- **PNG** do gotowego obrazu rastrowego w wybranym DPI;
- **PDF** do druku na A4 lub A3 — jako kompletnego projektu albo jednej widocznej warstwy na stronie.

Przezroczyste tło jest domyślnie włączone. Zapisany kolor tła zostaje zachowany przy włączonej przezroczystości i pojawia się ponownie po jej wyłączeniu.

## Praktyczny sposób pracy

1. Ustaw rozmiar obszaru roboczego i przyciąganie przed precyzyjnym rozmieszczaniem.
2. Najpierw zbuduj i sprawdź geometrię zakresu.
3. Dodaj podziałki kreskową i liczbową, aby system wartości był czytelny.
4. Dodaj łuki, etykiety i wskazówkę, aby zbudować znaczenie i hierarchię.
5. Na końcu dodaj płaskie kształty, linie i ikony.
6. Używaj najechania na miniaturę i izolowania podczas edycji, aby sprawdzać złożone układy.
7. Pobierz projekt, a następnie wyeksportuj gotowe pliki.

W przypadku tarczy produkcyjnej wcześnie wyeksportuj wersję roboczą. Sprawdzenie rzeczywistego rozmiaru wydruku ujawnia problemy z odstępami i grubością linii, których łatwo nie zauważyć w dopasowanym podglądzie.

## Filmy poklatkowe z budowy

Już wkrótce.

Chcesz poeksperymentować? [Otwórz edytor](/app) lub rozpocznij od kompletnego projektu z sekcji **Przykłady**.
