import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  layerNames,
  taskLabel,
  isSimpleProject,
  responsibilityLines,
  type ContributionProject,
} from "./contribution-matrix";
import "./contribution-matrix.css";

export function ContributionReadout({ projects }: { projects: ContributionProject[] }) {
  return (
    <section className="contribution-readout" aria-label="Projekt i wkład ze zgłoszenia">
      <p className="matrix-kicker">Projekt · odpowiedzi osoby aplikującej</p>
      <h3>Projekt i zakres odpowiedzialności</h3>
      <p className="matrix-help">Opis projektu i własne punkty osoby aplikującej.</p>
      {projects.map((project, index) =>
        isSimpleProject(project) ? (
          <article className="matrix-submitted-project simple-project-readout" key={index}>
            <span className="matrix-kicker">Projekt {index + 1}</span>
            <section className="simple-project-description" aria-label="Opis projektu">
              <h4>Opis projektu</h4>
              <p>{project.description}</p>
            </section>
            <section
              className="simple-project-responsibilities"
              aria-label="Zakres odpowiedzialności"
            >
              <h4>Zakres odpowiedzialności</h4>
              <ul>
                {responsibilityLines(project.responsibilities).map((line, lineIndex) => (
                  <li key={lineIndex}>{line}</li>
                ))}
              </ul>
            </section>
          </article>
        ) : (
          <article className="matrix-submitted-project" key={index}>
            <header>
              <span className="matrix-kicker">Projekt {index + 1}</span>
              <h4>{project.title}</h4>
              <p>{project.goal}</p>
            </header>
            <div className="matrix-columns">
              {(["own", "team", "ai"] as const).map((layer) => (
                <section
                  className={`matrix-column matrix-column--${layer}`}
                  key={layer}
                  aria-label={layerNames[layer]}
                >
                  <h5>{layerNames[layer]}</h5>
                  {project[layer].status === "unknown" ? (
                    <p className="matrix-unknown">
                      {layer === "own"
                        ? "Nie potrafię rozdzielić własnego wkładu od pracy zespołu."
                        : layer === "team"
                          ? "Nie potrafię wskazać dostaw zespołu."
                          : "Nie wiem, czy lub jak używano AI."}
                    </p>
                  ) : project[layer].status === "none" ? (
                    <p>{layer === "team" ? "Praca bez udziału zespołu." : "Nie używano AI."}</p>
                  ) : (
                    <>
                      <ul>
                        {project[layer].entries.map((entry) => (
                          <li key={entry.task}>
                            <strong>{taskLabel(layer, entry.task)}</strong>
                            {layer === "team" && (
                              <span className="matrix-owner">Rola: {entry.owner}</span>
                            )}
                            <p>{entry.detail}</p>
                          </li>
                        ))}
                      </ul>
                      {layer === "ai" && (
                        <dl>
                          <dt>Narzędzie lub model</dt>
                          <dd>{project.ai.tools}</dd>
                          <dt>Sposób użycia i parametry</dt>
                          <dd>{project.ai.method}</dd>
                        </dl>
                      )}
                    </>
                  )}
                </section>
              ))}
            </div>
            <section className="matrix-result">
              <h5>Rezultat i sposób sprawdzenia</h5>
              <p>{project.result}</p>
            </section>
          </article>
        ),
      )}
    </section>
  );
}

export function MissingContributionMatrix() {
  return (
    <section
      className="contribution-readout matrix-missing"
      aria-label="Brak osobnego zakresu odpowiedzialności"
    >
      <p className="matrix-kicker">Projekt i wkład</p>
      <h3>Wkład nie został rozdzielony</h3>
      <p>
        To zgłoszenie zawiera wcześniejszy opis tekstowy. Osoba aplikująca nie podała osobno swojego
        zakresu odpowiedzialności.
      </p>
      <Link
        className={buttonVariants({ variant: "outline", size: "sm" })}
        to="/app/podglad-macierzy"
      >
        Zobacz formularz projektu
      </Link>
    </section>
  );
}
