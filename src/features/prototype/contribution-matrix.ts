import { z } from "zod";

export const contributionOptions = {
  own: [
    ["architecture", "Architektura rozwiązania"],
    ["metrics", "Dobór metryk sukcesu"],
    ["business", "Ograniczenia biznesowe i wymagania"],
    ["tradeoffs", "Decyzje o kompromisach, np. czas odpowiedzi i koszt"],
    ["security", "Audyt bezpieczeństwa"],
    ["verification", "Weryfikacja odpowiedzi i halucynacji"],
    ["other", "Inne własne działanie"],
  ],
  team: [
    ["data", "Dane i pipeline ETL"],
    ["infrastructure", "Infrastruktura i wdrożenie"],
    ["requirements", "Wymagania domenowe"],
    ["design", "Projektowanie i badania"],
    ["tests", "Testy i kontrola jakości"],
    ["other", "Inna dostawa zespołu"],
  ],
  ai: [
    ["synthetic", "Generowanie danych syntetycznych"],
    ["code", "Przygotowanie szkicu kodu"],
    ["formats", "Transformacja formatów"],
    ["entities", "Ekstrakcja encji"],
    ["analysis", "Analiza i warianty rozwiązania"],
    ["other", "Inne użycie AI"],
  ],
} as const;
export type ContributionLayer = keyof typeof contributionOptions;
export const layerNames: Record<ContributionLayer, string> = {
  own: "Mój wkład",
  team: "Rola zespołu",
  ai: "Rola AI",
};
const entrySchema = z.object({
  task: z.string().max(40),
  detail: z.string().trim().max(600),
  owner: z.string().trim().max(120),
});
const layerSchema = z.object({
  status: z.enum(["", "described", "none", "unknown"]),
  entries: z.array(entrySchema).max(7),
});
const legacyProjectDraftSchema = z
  .object({
    title: z.string().trim().max(120),
    goal: z.string().trim().max(500),
    result: z.string().trim().max(500),
    own: layerSchema,
    team: layerSchema,
    ai: layerSchema.extend({
      tools: z.string().trim().max(300),
      method: z.string().trim().max(500),
    }),
  })
  .superRefine((project, context) => {
    for (const layer of ["own", "team", "ai"] as const) {
      const ids = project[layer].entries.map((entry) => entry.task);
      if (
        new Set(ids).size !== ids.length ||
        ids.some((id) => !contributionOptions[layer].some((option) => option[0] === id))
      )
        context.addIssue({
          code: "custom",
          path: [layer, "entries"],
          message: "Wybierz działania z listy bez powtórzeń.",
        });
    }
  });
export type LegacyContributionProject = z.infer<typeof legacyProjectDraftSchema>;

export const legacyProjectSchema = legacyProjectDraftSchema
  .superRefine((project, context) => {
    function issue(path: (string | number)[], message: string) {
      context.addIssue({ code: "custom", path, message });
    }
    if (project.title.length < 3) issue(["title"], "Podaj nazwę projektu (minimum 3 znaki).");
    if (project.goal.length < 10) issue(["goal"], "Opisz cel projektu (minimum 10 znaków).");
    if (project.result.length < 10)
      issue(
        ["result"],
        "Podaj rezultat i sposób sprawdzenia lub brak pomiaru (minimum 10 znaków).",
      );
    for (const layer of ["own", "team", "ai"] as const) {
      const value = project[layer];
      if (!value.status || (layer === "own" && value.status === "none"))
        issue([layer, "status"], `Odpowiedz w części „${layerNames[layer]}”.`);
      if (value.status !== "described") continue;
      if (!value.entries.length)
        issue([layer, "entries"], "Zaznacz co najmniej jedno działanie i doprecyzuj je.");
      value.entries.forEach((entry, index) => {
        if (entry.detail.length < 20)
          issue(
            [layer, "entries", index, "detail"],
            "Podaj konkretną czynność, decyzję lub dostawę (minimum 20 znaków).",
          );
        if (layer === "team" && entry.owner.length < 3)
          issue([layer, "entries", index, "owner"], "Podaj rolę w zespole (minimum 3 znaki).");
      });
      if (layer === "ai") {
        if (project.ai.tools.length < 3) issue(["ai", "tools"], "Podaj narzędzie lub model.");
        if (project.ai.method.length < 10)
          issue(
            ["ai", "method"],
            "Podaj sposób użycia i ustawienia; oznacz parametry, których nie znasz.",
          );
      }
    }
  })
  .transform((project) => ({
    ...project,
    own: { ...project.own, entries: project.own.status === "described" ? project.own.entries : [] },
    team: {
      ...project.team,
      entries: project.team.status === "described" ? project.team.entries : [],
    },
    ai: {
      ...project.ai,
      entries: project.ai.status === "described" ? project.ai.entries : [],
      tools: project.ai.status === "described" ? project.ai.tools : "",
      method: project.ai.status === "described" ? project.ai.method : "",
    },
  }));

export function emptyLegacyContributionProject(): LegacyContributionProject {
  return {
    title: "",
    goal: "",
    result: "",
    own: { status: "", entries: [] },
    team: { status: "", entries: [] },
    ai: { status: "", entries: [], tools: "", method: "" },
  };
}
export function taskLabel(layer: ContributionLayer, id: string) {
  return contributionOptions[layer].find((option) => option[0] === id)?.[1] ?? id;
}

export const simpleProjectDraftSchema = z.object({
  format: z.literal("simple"),
  description: z.string().trim().max(12000),
  responsibilities: z.string().trim().max(12000),
});
export type SimpleContributionProject = z.infer<typeof simpleProjectDraftSchema>;
export function responsibilityLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])(?:\s+|$)/, "").trim())
    .filter(Boolean);
}
export const simpleProjectSchema = simpleProjectDraftSchema.superRefine((project, context) => {
  if (project.description.length < 20)
    context.addIssue({
      code: "custom",
      path: ["description"],
      message: "Opisz projekt w co najmniej 20 znakach.",
    });
  const lines = responsibilityLines(project.responsibilities);
  if (!lines.length || lines.some((line) => line.replace(/[^\p{L}\p{N}]/gu, "").length < 3))
    context.addIssue({
      code: "custom",
      path: ["responsibilities"],
      message: "Wpisz co najmniej jeden konkretny punkt swojego zakresu odpowiedzialności.",
    });
});
export const projectDraftSchema = z.union([simpleProjectDraftSchema, legacyProjectDraftSchema]);
export const projectSchema = z.union([simpleProjectSchema, legacyProjectSchema]);
export const projectsSchema = z.array(projectSchema).min(1).max(3);
export type ContributionProject = z.infer<typeof projectDraftSchema>;
export function isSimpleProject(
  project: ContributionProject,
): project is SimpleContributionProject {
  return "format" in project && project.format === "simple";
}
export function emptyContributionProject(): SimpleContributionProject {
  return { format: "simple", description: "", responsibilities: "" };
}
export function toSimpleProject(project: ContributionProject): SimpleContributionProject {
  if (isSimpleProject(project)) return project;
  const context = [project.title, project.goal, project.result];
  if (project.team.status === "described")
    context.push(
      "Rola zespołu:\n" +
        project.team.entries.map((entry) => `${entry.owner}: ${entry.detail}`).join("\n"),
    );
  if (project.ai.status === "described")
    context.push(
      "Użycie AI:\n" + project.ai.entries.map((entry) => entry.detail).join("\n"),
      project.ai.tools,
      project.ai.method,
    );
  return {
    format: "simple",
    description: context.filter(Boolean).join("\n\n"),
    responsibilities:
      project.own.status === "described"
        ? project.own.entries.map((entry) => entry.detail).join("\n")
        : "",
  };
}
export function projectAnswer(projects: ContributionProject[]) {
  return projects
    .map((project, index) =>
      isSimpleProject(project)
        ? `Projekt ${index + 1}: Opis projektu i zakres odpowiedzialności zapisano w formularzu.`
        : `Projekt: ${project.title}\nCel: ${project.goal}\nRezultat: ${project.result}`,
    )
    .join("\n\n");
}
