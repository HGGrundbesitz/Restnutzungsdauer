# Offene und widersprüchliche Punkte der RND-V2-Spezifikation

Stand: 25.07.2026

Dieses Dokument hält bewusst fest, an welchen Stellen Beispiele und
Beschreibung der `Ersteinschaetzung_RND_Spezifikation.pdf` nicht vollständig
übereinstimmen. Für die Implementierung gelten die Tabellen, Mappings und der
ausgeschriebene Pseudocode als verbindliche Grundlage. Abweichende
Beispielergebnisse werden nicht durch Sonderlogik nachgebaut.

## 1. Deckelung auf 70 Prozent der GND

Der Pseudocode deckelt das Ergebnis nach beiden Rechenzweigen auf
`0 … 70 % der GND`. V2 wendet diese Deckelung daher unabhängig davon an, ob die
vorläufige RND direkt übernommen oder die ImmoWertV-Formel verwendet wird.

## 2. Punkte und Ergebnisse der Testfälle

Die Antworten werden exakt über die veröffentlichten Mappings bewertet:

- Dach und Außenwände: `0 / 2 / 4`
- alle übrigen Fragen: `0 / 1 / 2`

Mit festem Stichtag `2026-01-01` ergeben sich für die fünf beschriebenen
Testfälle deshalb `56, 34, 26, 56, 26` Jahre. Die in der PDF genannten Werte
`64, 38, 29, 56, 26` sind nicht mit allen gleichzeitig veröffentlichten
Mappings, Tabellen und Deckelungsregeln reproduzierbar. Besonders die
Testfälle 2 und 3 enthalten widersprüchliche Punkte- beziehungsweise
Ergebnisannahmen.

## 3. Stichtag

Die öffentliche V2-Oberfläche enthält kein Stichtagsfeld. Der Server setzt den
Stichtag reproduzierbar auf `01.01.<aktuelles Jahr>` in der Zeitzone
`Europe/Berlin` und speichert ihn mit der Berechnung. In Unterlagen erkannte
Stichtage bleiben ausschließlich für den fachlichen Admin-/Gutachterprozess
verfügbar.

## 4. Anlage-2-Modell für alle Gebäudearten

Die Spezifikation listet 18 Gebäudearten und verlangt für jede eine
automatische Ersteinschätzung. V2 verwendet deshalb die angegebene
Gesamtnutzungsdauer und dasselbe Anlage-2-Rechenmodell für alle 18 Typen.

Fachlich offen bleibt, ob dieses vereinfachte öffentliche Modell für jede
Nichtwohngebäude-Untergruppe ohne weitere objektspezifische Prüfung geeignet
ist. Die Anwendung kommuniziert das Ergebnis daher nur als unverbindliche
Ersteinschätzung; die endgültige Beurteilung bleibt dem Gutachten vorbehalten.

## 5. Professionelles Mustergutachten

`RND-Gutachten.pdf` dient ausschließlich als fachlicher Kontext für den Ablauf
eines Gutachtens. Es ist weder Test-Dataset noch Soll-Ergebnis der öffentlichen
Berechnung und wird nicht als öffentliche Website-Datei ausgeliefert.
