import { describe, expect, it } from "vitest";
import {
  emptyLegacyContributionProject as emptyContributionProject,
  legacyProjectSchema as projectSchema,
  projectsSchema,
  type ContributionProject,
  responsibilityLines,
  emptyContributionProject as emptySimpleProject,
  simpleProjectSchema,
  toSimpleProject,
} from "./contribution-matrix";
import { initialState, transition } from "./model";
import { parseState, serializeState } from "./storage";
import example from "./data/contribution-example.json";

function candidate() {
  return transition(initialState(), { type: "select_person", id: "candidate-anna" });
}
function submit(projects: ContributionProject[] = [projectSchema.parse(example)]) {
  return transition(
    candidate(),
    {
      type: "submit",
      jobId: initialState().jobs[0].id,
      notes: "",
      generated: "",
      answer: "Unused broad description",
      projects,
      consent: true,
    },
    "2026-11-08T12:00:00.000Z",
    "matrix-example",
  );
}
describe("explicit project attribution", () => {
  it("retains validation of old structured matrices and rejects unstructured new submissions", () => {
    expect(projectsSchema.safeParse([emptyContributionProject()]).success).toBe(false);
    expect(() =>
      transition(candidate(), {
        type: "submit",
        jobId: initialState().jobs[0].id,
        notes: "",
        generated: "",
        answer: "Wdrożyliśmy i przygotowaliśmy całe rozwiązanie.",
        consent: true,
      }),
    ).toThrow("zakres");
  });
  it("requires detail per selected action and tools/method for declared AI use", () => {
    const project = structuredClone(example);
    project.own.entries[0].detail = "";
    project.ai.tools = "";
    project.ai.method = "";
    const result = projectSchema.safeParse(project);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["own.entries.0.detail", "ai.tools", "ai.method"]),
      );
  });
  it("keeps collective wording and unknown personal work separate without inferring authorship", () => {
    const project = projectSchema.parse({
      ...example,
      goal: "Zrobiliśmy, przygotowaliśmy i wdrożyliśmy nowy system.",
      own: { status: "unknown", entries: example.own.entries },
      team: { status: "unknown", entries: [] },
      ai: { status: "unknown", entries: [], tools: "", method: "" },
    });
    expect(project.own.status).toBe("unknown");
    expect(project.own.entries).toEqual([]);
    expect(project.goal).toContain("Zrobiliśmy");
  });
  it("allows explicit solo work and no-AI answers without fabricating team or model tasks", () => {
    const project = projectSchema.parse({
      ...example,
      team: { status: "none", entries: [] },
      ai: { status: "none", entries: [], tools: "", method: "" },
    });
    expect(
      projectSchema.parse(submit([project]).applications.at(-1)?.projects?.[0]).ai.status,
    ).toBe("none");
  });
  it("saves incomplete matrix drafts across persistence but blocks incomplete submission", () => {
    const blank = emptyContributionProject();
    blank.title = "Niedokończony projekt";
    const state = transition(candidate(), {
      type: "draft",
      jobId: initialState().jobs[0].id,
      notes: "",
      generated: "",
      answer: "",
      projects: [blank],
    });
    expect(parseState(serializeState(state)).drafts[0].projects?.[0]).toEqual(blank);
    expect(() => submit([blank])).toThrow();
  });
  it("preserves exact submitted details, roles, AI configuration and immutable snapshots", () => {
    const project = projectSchema.parse(example);
    const state = submit([project]);
    project.own.entries[0].detail = "Changed after submission";
    const submitted = state.applications.at(-1)!;
    expect(projectSchema.parse(submitted.projects?.[0]).own.entries[0].detail).toBe(
      example.own.entries[0].detail,
    );
    const changed = transition(state, {
      type: "profile",
      value: { name: "Nowa Anna", headline: "Nowa rola", bio: "", location: "Warszawa" },
    });
    expect(parseState(serializeState(changed)).applications.at(-1)).toEqual(submitted);
    expect(projectSchema.parse(submitted.projects?.[0]).team.entries[0].owner).toBe(
      example.team.entries[0].owner,
    );
    expect(projectSchema.parse(submitted.projects?.[0]).ai.method).toBe(example.ai.method);
  });
  it("retains legacy submitted text and permits completion of an existing legacy text draft", () => {
    const state = candidate();
    expect(parseState(serializeState(state)).applications[0].projects).toBeUndefined();
    const draft = transition(state, {
      type: "draft",
      jobId: state.jobs[0].id,
      notes: "Old notes",
      generated: "Old generation",
      answer: "Moja wcześniejsza odpowiedź w zapisanym szkicu.",
    });
    const next = transition(draft, {
      type: "submit",
      jobId: state.jobs[0].id,
      notes: "Old notes",
      generated: "Old generation",
      answer: "Moja wcześniejsza odpowiedź w zapisanym szkicu.",
      consent: true,
    });
    expect(next.applications.at(-1)?.sourceNotes).toBe("Old notes");
    expect(next.applications.at(-1)?.projects).toBeUndefined();
    expect(next.applications[0]).toEqual(state.applications[0]);
  });
  it("rejects unknown/duplicate action IDs and missing team ownership on import", () => {
    const project = structuredClone(example);
    project.team.entries[0].owner = "";
    expect(projectSchema.safeParse(project).success).toBe(false);
    project.own.entries.push({ ...project.own.entries[0] });
    expect(projectSchema.safeParse(project).success).toBe(false);
    project.own.entries[0].task = "fabricated-action";
    expect(projectSchema.safeParse(project).success).toBe(false);
  });
});

describe("two-field project input", () => {
  it("requires a description and a real written responsibility point, without any selections", () => {
    expect(simpleProjectSchema.safeParse(emptySimpleProject()).success).toBe(false);
    expect(
      simpleProjectSchema.safeParse({
        format: "simple",
        description: "Zespół przygotował aplikację do obsługi zgłoszeń.",
        responsibilities: "- \n• ",
      }).success,
    ).toBe(false);
    expect(
      simpleProjectSchema.safeParse({
        format: "simple",
        description: "Zespół przygotował aplikację do obsługi zgłoszeń.",
        responsibilities: "Poprowadziłem badania",
      }).success,
    ).toBe(true);
  });
  it("keeps written points and general team wording intact through drafts and submission", () => {
    const project = {
      format: "simple" as const,
      description: "Zespół przygotował i wdrożył aplikację do obsługi zgłoszeń.",
      responsibilities:
        "• Dobrałam pytania testowe.\n- Sprawdziłam odpowiedzi.\n3. Uzgodniłam kryterium sukcesu.",
    };
    const state = transition(candidate(), {
      type: "draft",
      jobId: initialState().jobs[0].id,
      notes: "",
      generated: "",
      answer: "",
      projects: [project],
    });
    expect(parseState(serializeState(state)).drafts[0].projects?.[0]).toEqual(project);
    const result = submit([project]);
    expect(parseState(serializeState(result)).applications.at(-1)?.projects?.[0]).toEqual(project);
    expect(responsibilityLines(project.responsibilities)).toEqual([
      "Dobrałam pytania testowe.",
      "Sprawdziłam odpowiedzi.",
      "Uzgodniłam kryterium sukcesu.",
    ]);
    expect(project.description).toContain("Zespół przygotował");
  });
  it("simplifies old drafts from their explicit fields without inferring individual work", () => {
    const old = projectSchema.parse({ ...example, own: { status: "unknown", entries: [] } });
    const converted = toSimpleProject(old);
    expect(converted.description).toContain(example.team.entries[0].detail);
    expect(converted.description).toContain(example.ai.tools);
    expect(converted.responsibilities).toBe("");
    expect(simpleProjectSchema.safeParse(converted).success).toBe(false);
    expect(toSimpleProject(projectSchema.parse(example)).responsibilities).toContain(
      example.own.entries[0].detail,
    );
  });
});
