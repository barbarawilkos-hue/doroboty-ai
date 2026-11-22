import { describe, expect, it } from "vitest";
import {
  initialState,
  stateSchema,
  transition,
  type RecruitingDecision,
  type State,
} from "./model";

const now = "2026-11-08T19:00:00.000Z";
const question = "Jak sprawdzono rezultat Twojej pracy?";
function employer() {
  return transition(initialState(), { type: "select_person", id: "employer-brightlabs" });
}
function decide(state: State, decision: RecruitingDecision, text = question) {
  return transition(
    state,
    { type: "recruiting_decision", applicationId: "application-example", decision, question: text },
    now,
  );
}

describe("recruiter next step", () => {
  it("persists edited and repeated questions without changing submitted material", () => {
    const original = employer();
    const first = decide(original, "clarify");
    const second = decide(first, "clarify", "Jak wybrano metrykę sukcesu?");
    expect(original.applications[0].events).toHaveLength(1);
    expect(second.applications[0]).toMatchObject({
      answer: original.applications[0].answer,
      cv: original.applications[0].cv,
      stage: "reviewed",
    });
    expect(second.applications[0].events.slice(1)).toEqual([
      { stage: "reviewed", at: now, note: question, decision: "clarify" },
      {
        stage: "reviewed",
        at: now,
        note: "Jak wybrano metrykę sukcesu?",
        decision: "clarify",
      },
    ]);
    expect(stateSchema.parse(JSON.parse(JSON.stringify(second)))).toEqual(second);
    const invalid = structuredClone(second);
    delete invalid.applications[0].events[2].decision;
    expect(stateSchema.safeParse(invalid).success).toBe(false);
  });

  it("records invitation through the existing review stage and preserves subsequent process", () => {
    let state = decide(employer(), "invite");
    expect(state.applications[0].events.map((event) => event.stage)).toEqual([
      "submitted",
      "reviewed",
      "interview_invited",
    ]);
    expect(state.applications[0].events.at(-1)?.note).toBe("");
    expect(() => decide(state, "invite")).toThrow();
    state = transition(
      state,
      {
        type: "stage",
        applicationId: "application-example",
        stage: "first_conversation_held",
        note: "",
      },
      now,
    );
    expect(state.applications[0].stage).toBe("first_conversation_held");
    expect(decide(decide(employer(), "clarify"), "invite").applications[0].events).toHaveLength(3);
  });

  it("rejects with a terminal history and never stores a hidden question on another decision", () => {
    const state = decide(employer(), "decline");
    expect(state.applications[0].events.at(-1)).toEqual({
      stage: "rejected",
      at: now,
      note: "",
      decision: "decline",
    });
    expect(() => decide(state, "clarify")).toThrow();
    const withdrawn = transition(
      transition(initialState(), { type: "select_person", id: "candidate-marek" }),
      { type: "withdraw", applicationId: "application-example" },
      now,
    );
    expect(() =>
      decide(transition(withdrawn, { type: "select_person", id: "employer-brightlabs" }), "invite"),
    ).toThrow();
  });

  it("enforces ownership, nonempty bounded questions and valid imported decision metadata", () => {
    for (const id of ["candidate-marek", "employer-northstar"]) {
      const state = transition(initialState(), { type: "select_person", id });
      expect(() => decide(state, "clarify")).toThrow();
      expect(() => decide(state, "invite")).toThrow();
      expect(() => decide(state, "decline")).toThrow();
    }
    expect(() => decide(employer(), "clarify", "   ")).toThrow();
    expect(() => decide(employer(), "clarify", "x".repeat(12001))).toThrow();
    const invalid = decide(employer(), "clarify");
    invalid.applications[0].events[1].decision = "invite";
    expect(stateSchema.safeParse(invalid).success).toBe(false);
    expect(stateSchema.safeParse(initialState()).success).toBe(true);
  });
});
