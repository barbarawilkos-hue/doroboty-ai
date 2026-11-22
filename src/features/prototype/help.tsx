import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { appVersion, buildId, diagnosticReport } from "./diagnostics";
import { downloadText } from "./download";
export function HelpPage() {
  return (
    <section className="prototype-section max-w-4xl">
      <h1>Pomoc z demo</h1>
      <div className="space-y-5 mt-6">
        <p>
          To demonstracja interfejsu z fikcyjnymi osobami, ofertami i CV. Wybór osoby zastępuje
          logowanie. Zgłoszenia, pytania i decyzje nie są wysyłane do rzeczywistych osób.
        </p>
        <h2>Jak zachować i udostępnić zmiany</h2>
        <p>
          Link otwiera aplikację z przykładowymi danymi. Twoje zmiany pozostają w tej przeglądarce.
          Po sesji i przed aktualizacją lub resetem pobierz kopię w ustawieniach. Aby przenieść
          scenariusz, druga osoba musi zaimportować ten plik u siebie. Eksport zawiera cały
          scenariusz, w tym notatki — używaj wyłącznie fikcyjnych danych.
        </p>
        <Link className="underline" to="/app/settings">
          Przejdź do eksportu i importu
        </Link>
        <h2>Gdy coś nie działa</h2>
        <p>
          Zapisz kroki prowadzące do problemu i przekaż je osobie, od której masz link. Dołącz
          raport techniczny. Nie przesyłaj prawdziwego CV, danych osobowych ani pliku scenariusza.
        </p>
        <Button
          variant="outline"
          onClick={() => downloadText("doroboty-raport-techniczny.json", diagnosticReport())}
        >
          Pobierz raport techniczny
        </Button>
        <p>
          Raport zawiera wersję demo, czas i maksymalnie 20 kodów problemów z tej karty. Nie zawiera
          treści formularzy, zgłoszeń, CV, adresu strony ani identyfikatorów osób. Niczego nie
          wysyła automatycznie.
        </p>
        <details>
          <summary>Wersja demo</summary>
          <p className="break-all">
            {appVersion} · {buildId}
          </p>
        </details>
      </div>
    </section>
  );
}
