import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationRecord } from "./application-record";
import { nextStages, stageLabels, type Application, type RecruitingDecision } from "./model";
import { usePrototype } from "./store";
import "./recruiting-decision.css";

const choices: { value: RecruitingDecision; label: string; saveLabel: string }[] = [
  { value: "clarify", label: "Dopytaj", saveLabel: "Zapisz dopytanie" },
  { value: "invite", label: "Zaproś na rozmowę", saveLabel: "Zapisz zaproszenie" },
  { value: "decline", label: "Odrzuć", saveLabel: "Zapisz odrzucenie" },
];
const proposedQuestion =
  "Jakie kryteria wykorzystano do oceny efektu Twojej pracy i jaki wynik udało się osiągnąć?";

export function RecruitingApplication({ application }: { application: Application }) {
  const { state, run } = usePrototype();
  const [choice, setChoice] = useState<RecruitingDecision | null>(null);
  const [question, setQuestion] = useState(proposedQuestion);
  const [announcement, setAnnouncement] = useState("");
  const statusRef = useRef<HTMLSpanElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const pendingFocus = useRef(false);
  const company = state.companies.find((item) => item.id === application.companyId);
  const availableStages = nextStages[application.stage];
  const deciding = application.stage === "submitted" || application.stage === "reviewed";
  const selected = choices.find((item) => item.value === choice);
  useLayoutEffect(() => {
    if (pendingFocus.current) {
      statusRef.current?.focus();
      pendingFocus.current = false;
    }
  }, [application.events.length]);
  useLayoutEffect(() => {
    if (choice === "clarify") questionRef.current?.focus();
  }, [choice]);

  async function saveDecision(event: FormEvent) {
    event.preventDefault();
    if (!choice) return;
    if (choice === "clarify" && !question.trim()) {
      questionRef.current?.focus();
      return;
    }
    pendingFocus.current = true;
    if (
      await run({
        type: "recruiting_decision",
        applicationId: application.id,
        decision: choice,
        question,
      })
    ) {
      setChoice(null);
      setQuestion(proposedQuestion);
      setAnnouncement(`Zapisano: ${selected?.label}.`);
    } else pendingFocus.current = false;
  }

  return (
    <>
      <ApplicationRecord
        application={application}
        companyName={company?.name ?? ""}
        audience="employer"
        history={application.events}
        statusRef={statusRef}
        footer={
          deciding ? undefined : availableStages.length > 0 ? (
            <div className="record-actions">
              {availableStages.map((stage) => (
                <Button
                  key={stage}
                  variant={stage === "rejected" ? "outline" : "default"}
                  onClick={async () => {
                    pendingFocus.current = true;
                    if (
                      await run({ type: "stage", applicationId: application.id, stage, note: "" })
                    ) {
                      setAnnouncement(`Zapisano etap: ${stageLabels[stage]}.`);
                    } else pendingFocus.current = false;
                  }}
                >
                  {stage === "rejected" ? "Odrzuć" : stageLabels[stage]}
                </Button>
              ))}
            </div>
          ) : (
            <p className="record-caption">
              {stageLabels[application.stage]}. Brak kolejnych działań w tym procesie.
            </p>
          )
        }
      >
        {deciding && (
          <form
            className="recruiting-decision"
            aria-labelledby="recruiting-decision-title"
            onSubmit={saveDecision}
          >
            <h3 id="recruiting-decision-title">Jaki następny krok?</h3>
            <div className="record-actions" role="group" aria-label="Decyzja wobec zgłoszenia">
              {choices.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={choice === item.value ? "default" : "outline"}
                  aria-pressed={choice === item.value}
                  onClick={() => setChoice(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {choice === "clarify" && (
              <div className="recruiting-decision__question">
                <label htmlFor="recruiting-question">Propozycja pytania</label>
                <p className="record-caption" id="recruiting-question-hint">
                  Dostosuj pytanie do tego zgłoszenia przed zapisaniem.
                </p>
                <Textarea
                  id="recruiting-question"
                  ref={questionRef}
                  aria-describedby="recruiting-question-hint"
                  required
                  maxLength={12000}
                  rows={4}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                />
              </div>
            )}
            {selected && (
              <div className="recruiting-decision__save">
                <Button type="submit" disabled={choice === "clarify" && !question.trim()}>
                  {selected.saveLabel}
                </Button>
                <p className="record-caption">Zapis w historii procesu w tym prototypie.</p>
              </div>
            )}
          </form>
        )}
      </ApplicationRecord>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
