# Eat, Art and Hike Applikation

## Einleitung
Paar aus Lüneburg, Stadt in Nordostniedersachsen. Interessieren uns für gutes Essen, Kunst und Wanderungen.

## High Level
* Restaurants bewerten
* Kunstausstellungen bewerten
* Wander- oder Städtetouren Tipps

## Autoren & Interaktion
* Nur die beiden Betreiber schreiben Reviews (keine weiteren Autoren geplant)
* Keine öffentlichen Kommentare oder Nutzer-Bewertungen

## Sprache
* Frontend/UI: Deutsch
* Quellcode, Kommentare, Dokumentation: English

## Bewertungen
* Bewertung ist eine Skala von 1-5, als Symbol wird Icon eines Lüneburger Giebels verwendet
* Halbe Giebel sind möglich (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
* Es soll auch möglich sein, mehrere Bilder hinzuzufügen (Galerie)

### Restaurants
* Name
* Bewertungskriterien (je 1-5 Giebel, halbe möglich):
  * Service
  * Essen
  * Ambiente
  * Preis/Leistung
* Gesamtbewertung (Anzahl Giebel)
* Küche, z.B. Pizza, Deutsch, Vietnamesisch (Label/Tag)
* Adresse
* Freitext
* Link zum Restaurant
* Datum

### Kunstausstellungen
* Name
* Museum/Galerie
* Zeitraum der Ausstellung (von-bis, optional)
* Freitext
* Gesamtbewertung (Anzahl Giebel)
* Link zur Kunstausstellung
* Datum

### Wander- oder Städtetour
* Name
* Länge in km (optional)
* Dauer (optional)
* Schwierigkeit (optional, z.B. leicht/mittel/schwer)
* Freitext
* Gesamtbewertung (Anzahl Giebel)
* Link (später: Kartenintegration geplant)
* Datum

## Anwendung
* Es soll eine Web Anwendung sein und moderne Technologie benutzen.

### Aufbau
* Startseite zeigt die letzten 3 Einträge.
* Es gibt drei Kategorien. Beim Klick auf eine Kategorie werden die Einträge nach Datum absteigend angezeigt
* Es gibt pro Kategorie eine Bestenliste, diese kann bei Restaurants auch nach der Küche gefiltert werden.
* Impressumsseite

### Design
* Modern
* Responsive
* Sehr ansprechend und soll hochwertig aussehen

### SEO
* Einhaltung der SEO Standards, inkl. Titel und Meta-Description
* Gute Ladezeiten

## Pflege
* Es soll möglich sein, dass man per LLM Claude eine Bewertung per Sprache (Deutsch) eingeben kann, einfach als Freitext. Claude erstellt daraus den Beitrag und lädt diesen auf der Website hoch, zunächst als Entwurf. Der Admin prüft diesen, macht evtl. noch Anpassungen und gibt die Bewertung frei.
* Alternativ kann der Admin auch einen Eintrag anlegen und die Daten eingeben.
* Es ist möglich, Einträge zu editieren
* Es ist möglich, Einträge als "inaktiv" zu markieren. Dann tauchen sie für Nutzer nicht mehr auf, nur für Admins.
* Es ist möglich, Einträge zu löschen

## Erwartete Datenmenge
* Ca. 50 Einträge pro Jahr (alle Kategorien zusammen)

## Geplante Erweiterungen (Phase 2)
* Kartenintegration für Touren (GPX-Track, interaktive Karte)

## Next Steps
* Anforderungen prüfen und fertig stellen
* Claude Code Skills erstellen. Architektur, Frontend, Backend, ...
* Architektur bestimmen. Brauchen wir einen Datenbank, oder speichert der Server im Dateisystem die MD-Dateien?
  * SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) Prinzipien beachten
  * KISS (Keep It Simple Stupid) Prinzip beachten
  * DRY (Don't Repeat Yourself) Prinzip beachten
  * YAGNI (You Ain't Gonna Need It) Prinzip beachten
  * Convention over Configuration (CoC)
* Technologie auswählen
* Implementieren
* Testen
* Deployment

## Skills
Mögliche Skills:
* generate-api-endpoint: Erstellt einen neuen REST API Endpunkt im Backend. ...
* refactor-component: Zerlegt große React-Komponenten in kleinere Sub-Komponenten (Atomic Design).
* database-migration: Workflow zum Erstellen, Prüfen und Anwenden von Prisma-Migrationen.
* security-audit: Überprüft Code auf gängige OWASP-Schwachstellen (z.B. fehlende Input-Validierung).
* ...
