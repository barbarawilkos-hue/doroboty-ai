import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyContributionProject,
  simpleProjectSchema,
  toSimpleProject,
  type ContributionProject,
} from "./contribution-matrix";
import "./contribution-matrix.css";

function ProjectEditor({
  project: saved,
  onChange,
  disabled,
  attempted,
  number,
}: {
  project: ContributionProject;
  onChange: (project: ContributionProject) => void;
  disabled: boolean;
  attempted: boolean;
  number: number;
}) {
  const id = useId();
  const project = toSimpleProject(saved);
  const parsed = attempted ? simpleProjectSchema.safeParse(project) : null;
  const issues = parsed && !parsed.success ? parsed.error.issues : [];
  const descriptionError = issues.find((issue) => issue.path[0] === "description")?.message;
  const responsibilityError = issues.find((issue) => issue.path[0] === "responsibilities")?.message;
  return (
    <fieldset className="matrix-project simple-project-form" disabled={disabled}>
      <legend>Projekt {number}</legend>
      <div className="matrix-field">
        <label htmlFor={`${id}-description`}>Opis projektu</label>
        <p id={`${id}-description-help`} className="matrix-help">
          Opisz ogólnie projekt, jego cel i to, co powstało. Możesz opisać pracę całego zespołu.
        </p>
        <Textarea
          id={`${id}-description`}
          value={project.description}
          onChange={(event) => onChange({ ...project, description: event.target.value })}
          disabled={disabled}
          required
          maxLength={12000}
          rows={5}
          aria-invalid={!!descriptionError || undefined}
          aria-describedby={`${id}-description-help${descriptionError ? ` ${id}-description-error` : ""}`}
          placeholder="Czego dotyczył projekt? Jaki był jego cel i rezultat?"
        />
        {descriptionError && (
          <span id={`${id}-description-error`} className="error-message">
            {descriptionError}
          </span>
        )}
      </div>
      <div className="matrix-field">
        <label htmlFor={`${id}-responsibilities`}>Twój zakres odpowiedzialności</label>
        <p id={`${id}-responsibilities-help`} className="matrix-help">
          Wpisz w punktach, co konkretnie było po Twojej stronie. Jedno działanie lub decyzja w
          każdej linii.
        </p>
        <Textarea
          id={`${id}-responsibilities`}
          value={project.responsibilities}
          onChange={(event) => onChange({ ...project, responsibilities: event.target.value })}
          disabled={disabled}
          required
          maxLength={12000}
          rows={6}
          aria-invalid={!!responsibilityError || undefined}
          aria-describedby={`${id}-responsibilities-help${responsibilityError ? ` ${id}-responsibilities-error` : ""}`}
          placeholder={
            "• Moja konkretna czynność lub decyzja\n• Kolejna rzecz, za którą odpowiadam"
          }
        />
        {responsibilityError && (
          <span id={`${id}-responsibilities-error`} className="error-message">
            {responsibilityError}
          </span>
        )}
      </div>
    </fieldset>
  );
}

export function ContributionEditor({
  projects,
  onChange,
  disabled = false,
  attempted = false,
}: {
  projects: ContributionProject[];
  onChange: (projects: ContributionProject[]) => void;
  disabled?: boolean;
  attempted?: boolean;
}) {
  return (
    <section className="contribution-editor" aria-label="Formularz projektu">
      <h3>Projekt i Twój wkład</h3>
      {projects.map((project, index) => (
        <div key={index}>
          <ProjectEditor
            project={project}
            onChange={(next) =>
              onChange(projects.map((item, itemIndex) => (itemIndex === index ? next : item)))
            }
            disabled={disabled}
            attempted={attempted}
            number={index + 1}
          />
          {projects.length > 1 && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onChange(projects.filter((_, itemIndex) => itemIndex !== index))}
            >
              Usuń projekt {index + 1}
            </Button>
          )}
        </div>
      ))}
      {projects.length < 3 && (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange([...projects, emptyContributionProject()])}
        >
          Dodaj kolejny projekt
        </Button>
      )}
    </section>
  );
}
