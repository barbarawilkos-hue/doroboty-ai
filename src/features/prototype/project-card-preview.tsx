import { useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationRecord } from "./application-record";
import { ProjectEvidence } from "./project-evidence";
import materials from "./data/project-card-preview.json";
import "./project-card-preview.css";

type Choice = "invite" | "clarify" | "decline";
const choices: { value: Choice; label: string }[] = [
  { value: "invite", label: "Zaprosić" },
  { value: "clarify", label: "Dopytać" },
  { value: "decline", label: "Nie zapraszać" },
];

export function ProjectCardPreview() {
  const questionInput = useRef<HTMLTextAreaElement>(null);
  const [params, setParams] = useSearchParams();
  const variant = params.get("wariant") === "2" ? "2" : "1";
  const material = materials.find((item) => item.id === params.get("przypadek")) ?? materials[0];
  const [drafts, setDrafts] = useState<
    Record<string, { choice: Choice | null; reason: string; question: string; saved: boolean }>
  >({});
  const draft = drafts[material.id] ?? { choice: null, reason: "", question: "", saved: false };
  function update(patch: Partial<typeof draft>) {
    setDrafts((current) => ({ ...current, [material.id]: { ...draft, ...patch, saved: false } }));
  }
  function useQuestion(question: string) {
    update({ question, choice: "clarify" });
    window.requestAnimationFrame(() => questionInput.current?.focus());
  }
  function changeParam(name: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set(name, value);
      return next;
    });
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (
      !draft.choice ||
      !draft.reason.trim() ||
      (draft.choice === "clarify" && !draft.question.trim())
    )
      return;
    setDrafts((current) => ({ ...current, [material.id]: { ...draft, saved: true } }));
  }
  const evidence = (
    <ProjectEvidence
      material={material}
      placement={variant === "1" ? "section" : "tab"}
      onQuestion={useQuestion}
    />
  );
  const canSave =
    !!draft.choice &&
    !!draft.reason.trim() &&
    (draft.choice !== "clarify" || !!draft.question.trim());
  return (
    <div className={`project-preview project-preview--${variant}`}>
      <section className="project-preview__toolbar" aria-label="Porównanie dwóch układów">
        <div>
          <p className="project-preview__kicker">Dwa układy do porównania</p>
          <p>W obu karta jest widoczna od razu. Zmieniamy jej miejsce.</p>
        </div>
        <div className="project-preview__variants" role="group" aria-label="Wariant układu">
          {[
            { value: "1", label: "1. Widoczna sekcja" },
            { value: "2", label: "2. Pierwsza zakładka" },
          ].map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={variant === item.value ? "default" : "outline"}
              aria-pressed={variant === item.value}
              onClick={() => changeParam("wariant", item.value)}
            >
              <span className="project-preview__label-long">{item.label}</span>
              <span className="project-preview__label-short">
                {item.value === "1" ? "1. Sekcja" : "2. Zakładka"}
              </span>
            </Button>
          ))}
        </div>
        <div className="project-preview__scenarios">
          <label htmlFor="project-preview-case">Przykładowe zgłoszenie</label>
          <select
            id="project-preview-case"
            value={material.id}
            onChange={(event) => changeParam("przypadek", event.target.value)}
          >
            {materials.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <span>Materiały fikcyjne · wybrana wersja 1: stała sekcja</span>
        </div>
      </section>
      <ApplicationRecord
        key={material.id}
        application={{
          candidateId: `preview-${material.id}`,
          candidateName: material.candidate,
          jobTitle: "AI Engineer · wyszukiwanie dokumentów",
          stage: "submitted",
          answer: material.source,
          cv: "Ten przykład porównuje opis projektu. CV nie jest częścią przygotowanego materiału testowego.",
          score: 0,
          summary: "",
        }}
        companyName="BrightLabs"
        audience="employer"
        history={[]}
        showScore={false}
        project={{ placement: variant === "1" ? "section" : "tab", content: evidence }}
        margin={
          <section className="project-preview__role">
            <p className="project-preview__kicker">Kontekst decyzji</p>
            <h2>Kogo szukamy?</h2>
            <p>
              Osoby do przygotowania indeksowania dokumentów i sprawdzania trafności wyszukiwania.
            </p>
            <p>
              Integrację API wykonuje inna osoba. Używanie AI i praca zespołowa są dopuszczalne.
            </p>
            <div className="project-preview__role-note">
              Przed rozmową chcemy poznać własny zakres, sposób sprawdzenia i rezultat.
            </div>
            <Link to="/app/kandydaci">Wróć do zgłoszeń</Link>
          </section>
        }
      >
        <form className="project-decision" onSubmit={save} aria-labelledby="project-decision-title">
          <h3 id="project-decision-title">Jaki następny krok?</h3>
          <p className="record-caption">
            Podejmij decyzję na podstawie materiałów i zapisz jej powód.
          </p>
          <div
            className="project-decision__choices"
            role="group"
            aria-label="Decyzja wobec zgłoszenia"
          >
            {choices.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={draft.choice === item.value ? "default" : "outline"}
                aria-pressed={draft.choice === item.value}
                onClick={() => update({ choice: item.value })}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <label htmlFor="project-decision-reason">
            Uzasadnienie
            <Textarea
              id="project-decision-reason"
              value={draft.reason}
              onChange={(event) => update({ reason: event.target.value })}
              maxLength={4000}
              placeholder="Na jakiej informacji opierasz decyzję?"
              rows={3}
            />
          </label>
          {draft.choice === "clarify" && (
            <label htmlFor="project-decision-question">
              Pytanie do osoby aplikującej
              <Textarea
                id="project-decision-question"
                ref={questionInput}
                value={draft.question}
                onChange={(event) => update({ question: event.target.value })}
                maxLength={4000}
                rows={3}
                placeholder="Co chcesz doprecyzować przed zaproszeniem?"
              />
            </label>
          )}
          <div className="project-decision__save">
            <Button type="submit" disabled={!canSave}>
              Zapisz decyzję
            </Button>
            <span>Podgląd · bez wysyłania wiadomości i zaproszeń</span>
          </div>
          <p role="status" className="project-decision__status">
            {draft.saved
              ? `Zapisano w podglądzie: ${choices.find((item) => item.value === draft.choice)?.label}.`
              : ""}
          </p>
        </form>
      </ApplicationRecord>
    </div>
  );
}
