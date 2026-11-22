import { useId } from "react";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./project-evidence.css";

export type ProjectEvidenceData = {
  title: string;
  ownActions: string[];
  teamAndAi: string | null;
  result: string;
  gaps: string[];
  question: string;
};

export function ProjectEvidence({
  material,
  placement = "section",
  onQuestion,
  questionActionLabel = "Użyj pytania",
}: {
  material: ProjectEvidenceData;
  placement?: "section" | "tab";
  onQuestion?: (text: string) => void;
  questionActionLabel?: string;
}) {
  const titleId = useId();
  const gapsId = useId();
  return (
    <section
      className={`project-evidence project-evidence--${placement}`}
      aria-labelledby={titleId}
    >
      <div className="project-evidence__eyebrow">
        <Sparkles aria-hidden="true" size={16} /> Karta projektu{" "}
        <span>Na podstawie zgłoszenia</span>
      </div>
      <h3 id={titleId}>{material.title}</h3>
      <p className="project-evidence__lead">
        Własny wkład, rezultat i informacje do doprecyzowania.
      </p>
      <div className="project-evidence__facts">
        <section className="project-evidence__fact project-evidence__fact--own">
          <div className="project-evidence__label">
            <h4>Praca własna</h4>
            <span>{material.ownActions.length ? "Opisano" : "Brak konkretów"}</span>
          </div>
          {material.ownActions.length ? (
            <ul className="project-evidence__actions">
              {material.ownActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          ) : (
            <p>Zgłoszenie nie wskazuje konkretnych własnych działań ani ich podziału.</p>
          )}
        </section>
        <section className="project-evidence__fact">
          <div className="project-evidence__label">
            <h4>Zespół i AI</h4>
            <span>{material.teamAndAi ? "Opisano" : "Brak informacji"}</span>
          </div>
          <p>{material.teamAndAi ?? "Nie opisano podziału pracy w zespole ani użycia AI."}</p>
        </section>
        <section className="project-evidence__fact">
          <div className="project-evidence__label">
            <h4>Rezultat</h4>
            <span>Opisano</span>
          </div>
          <p>{material.result}</p>
        </section>
      </div>
      <section className="project-evidence__gaps" aria-labelledby={gapsId}>
        <div className="project-evidence__gap-heading">
          <MessageCircle aria-hidden="true" size={20} />
          <h4 id={gapsId}>Do doprecyzowania</h4>
        </div>
        <ul>
          {material.gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
        <div className="project-evidence__question">
          <span>Możesz zapytać</span>
          <p>„{material.question}”</p>
          {onQuestion && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onQuestion(material.question)}
            >
              {questionActionLabel} <ArrowRight aria-hidden="true" size={16} />
            </Button>
          )}
        </div>
      </section>
      <p className="project-evidence__limit">
        Karta porządkuje deklaracje. Sam opis nie potwierdza autorstwa ani umiejętności.
      </p>
    </section>
  );
}
