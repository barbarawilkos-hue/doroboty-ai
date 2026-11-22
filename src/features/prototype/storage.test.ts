import { describe, expect, it } from "vitest";
import { initialState } from "./model";
import {
  MAX_IMPORT_BYTES,
  parseState,
  readState,
  saveState,
  serializeState,
  STORAGE_KEY,
  StorageConflictError,
} from "./storage";
function memory(raw: string | null = null) {
  const values = new Map(raw === null ? [] : [[STORAGE_KEY, raw]]);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
describe("browser persistence and recovery", () => {
  it("rejects a stale tab without overwriting the other tab's newer scenario", () => {
    const storage = memory();
    const tabA = readState(storage);
    const tabB = readState(storage);
    const nextA = structuredClone(tabA.state);
    nextA.people[0].headline = "Newer saved profile";
    const saved = saveState(storage, nextA, tabA.raw);
    const nextB = structuredClone(tabB.state);
    nextB.people[0].headline = "Stale replacement";
    expect(() => saveState(storage, nextB, tabB.raw)).toThrow(StorageConflictError);
    expect(storage.getItem(STORAGE_KEY)).toBe(saved);
    expect(readState(storage).state.people[0].headline).toBe("Newer saved profile");
  });
  it("protects a save against reset or replacement after the snapshot was removed", () => {
    const original = serializeState(initialState());
    const storage = memory();
    expect(() => saveState(storage, initialState(), original)).toThrow(StorageConflictError);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
  it("round-trips a complete valid scenario", () => {
    const storage = memory();
    const s = initialState();
    saveState(storage, s);
    expect(readState(storage).state).toEqual(s);
    expect(parseState(serializeState(s))).toEqual(s);
  });
  it("protects incompatible/corrupt original saves", () => {
    for (const raw of ["{", JSON.stringify({ ...initialState(), version: 2 })]) {
      const storage = memory(raw);
      const loaded = readState(storage);
      expect(loaded.blocked).toBe(true);
      expect(loaded.original).toBe(raw);
      expect(storage.getItem(STORAGE_KEY)).toBe(raw);
    }
  });
  it("does not fail startup when storage access is denied", () => {
    expect(readState(null).state.jobs.length).toBeGreaterThan(0);
    expect(
      readState({
        getItem() {
          throw new Error("Denied");
        },
        setItem() {},
      }).blocked,
    ).toBe(true);
  });
  it("reports quota/write failure without altering the original", () => {
    const old = "old";
    const storage = {
      getItem: () => old,
      setItem() {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => saveState(storage, initialState())).toThrow("Wyeksportuj");
    expect(storage.getItem()).toBe(old);
  });
  it("rejects invalid references and oversized files", () => {
    const s = initialState();
    s.saved = [{ candidateId: "missing", jobId: s.jobs[0].id }];
    expect(() => parseState(JSON.stringify(s))).toThrow("Dotychczasowy stan");
    expect(() => parseState(" ".repeat(MAX_IMPORT_BYTES + 1))).toThrow("za duży");
  });
  it("accepts legacy appearance preferences without changing scenario data", () => {
    const state = initialState();
    for (const theme of ["dark", "system", "light"]) {
      expect(parseState(JSON.stringify({ ...state, theme }))).toEqual(state);
    }
  });
});
