import { useState } from "react";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/ui/button";
import { ContributionEditor } from "./contribution-editor";
import { ContributionReadout } from "./contribution-readout";
import {
  emptyContributionProject,
  projectsSchema,
  simpleProjectSchema,
  type ContributionProject,
} from "./contribution-matrix";
import example from "./data/simple-project-example.json";

export function ContributionPreview() {
  const [projects, setProjects] = useState<ContributionProject[]>([
    simpleProjectSchema.parse(example),
  ]);
  const [view, setView] = useState<"form" | "read">("form");
  const [attempted, setAttempted] = useState(false);
  function showReadout() {
    setAttempted(true);
    const parsed = projectsSchema.safeParse(projects);
    if (parsed.success) {
      setProjects(parsed.data);
      setView("read");
    } else {
      setView("form");
      window.requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('.contribution-editor [aria-invalid="true"]')?.focus(),
      );
    }
  }
  return (
    <div className="matrix-demo">
      <BackLink to="/app/kandydaci">Wróć do zgłoszeń</BackLink>
      <p className="matrix-kicker">Fikcyjne dane demonstracyjne · osobny przykład</p>
      <h1>Projekt i Twój wkład</h1>
      <p>
        Dwa pola: ogólny opis projektu i własna lista odpowiedzialności. Pracodawca otrzymuje te
        same treści.
      </p>
      <div className="matrix-demo-toolbar">
        <Button
          type="button"
          variant={view === "form" ? "default" : "outline"}
          aria-pressed={view === "form"}
          onClick={() => setView("form")}
        >
          1. Formularz osoby aplikującej
        </Button>
        <Button
          type="button"
          variant={view === "read" ? "default" : "outline"}
          aria-pressed={view === "read"}
          onClick={showReadout}
        >
          2. Widok pracodawcy
        </Button>
      </div>
      <div className="matrix-demo-toolbar">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setProjects([emptyContributionProject()]);
            setView("form");
            setAttempted(false);
          }}
        >
          Pusty formularz
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setProjects([simpleProjectSchema.parse(example)]);
            setView("read");
            setAttempted(false);
          }}
        >
          Wypełniony przykład
        </Button>
      </div>
      <section className="record-sheet">
        <h2>{view === "form" ? "Odpowiedzi do projektu" : "Projekt przekazany pracodawcy"}</h2>
        {view === "form" ? (
          <>
            <ContributionEditor projects={projects} onChange={setProjects} attempted={attempted} />
            {attempted && !projectsSchema.safeParse(projects).success && (
              <p role="alert" className="error-message">
                Uzupełnij opis projektu i swój zakres odpowiedzialności.
              </p>
            )}
            <Button type="button" onClick={showReadout}>
              Zobacz te odpowiedzi jako pracodawca
            </Button>
          </>
        ) : (
          <ContributionReadout projects={projects} />
        )}
      </section>
    </div>
  );
}
