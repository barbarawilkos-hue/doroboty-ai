import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { initialState, transition, type Action, type State } from "./model";
import {
  parseState,
  readState,
  saveState,
  STORAGE_KEY,
  WRITE_LOCK,
  StorageConflictError,
  type StoragePort,
} from "./storage";
import { recordDiagnostic } from "./diagnostics";
function browserStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const memoryAdvice =
  "Zmiany w tej karcie pozostają tylko w pamięci. Wyeksportuj je przed zamknięciem strony.";
function useStore() {
  const [storage] = useState(browserStorage);
  const [loaded] = useState(() => readState(storage));
  const [state, setState] = useState(loaded.state);
  const [issue, setIssue] = useState(loaded.issue || (!navigator.locks ? memoryAdvice : ""));
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [recoveryState, setRecoveryState] = useState<State | null>(null);
  const [original, setOriginal] = useState(loaded.original);
  const [generation, setGeneration] = useState(0);
  const blocked = useRef(loaded.blocked);
  const conflicting = useRef(false);
  const expectedRaw = useRef(loaded.raw);
  const latest = useRef(state);
  function markConflict(next?: State) {
    conflicting.current = true;
    setConflict(true);
    if (next) setRecoveryState((previous) => previous ?? next);
    setIssue(new StorageConflictError().message);
    recordDiagnostic("storage-conflict");
  }
  function apply(next: State) {
    latest.current = next;
    setState(next);
    setError("");
  }
  async function commit(createNext: () => State, replace = false) {
    const perform = () => {
      const next = createNext();
      if (conflicting.current) {
        markConflict(next);
        return false;
      }
      if (blocked.current && !replace) {
        apply(next);
        return true;
      }
      if (!storage || !navigator.locks) {
        apply(next);
        setIssue(memoryAdvice);
        recordDiagnostic("storage-unavailable");
        return true;
      }
      try {
        expectedRaw.current = saveState(storage, next, expectedRaw.current);
        if (replace) blocked.current = false;
        setIssue("");
        apply(next);
        return true;
      } catch (e) {
        if (e instanceof StorageConflictError) {
          markConflict(next);
          return false;
        }
        apply(next);
        setIssue(memoryAdvice);
        recordDiagnostic("storage-write-failed");
        return true;
      }
    };
    // Serialize the comparison and write, including truly simultaneous tab actions.
    return storage && navigator.locks ? navigator.locks.request(WRITE_LOCK, perform) : perform();
  }
  async function run(action: Action) {
    try {
      return await commit(() => transition(latest.current, action));
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Sprawdź poprawność i długość wprowadzonych danych.",
      );
      return false;
    }
  }
  async function importState(raw: string) {
    try {
      const next = parseState(raw);
      return await commit(() => next, true);
    } catch {
      setError(
        "Nieprawidłowy plik lub nieobsługiwana wersja danych. Dotychczasowy stan pozostaje bez zmian.",
      );
      recordDiagnostic("invalid-import");
      return false;
    }
  }
  function loadLatest() {
    const next = readState(storage);
    expectedRaw.current = next.raw;
    blocked.current = next.blocked;
    conflicting.current = false;
    setConflict(false);
    setRecoveryState(null);
    setOriginal(next.original);
    setIssue(next.issue || (!navigator.locks ? memoryAdvice : ""));
    apply(next.state);
    setGeneration((value) => value + 1);
  }
  useEffect(() => {
    function changed(event: StorageEvent) {
      if (
        (event.key === STORAGE_KEY || event.key === null) &&
        event.newValue !== expectedRaw.current
      ) {
        conflicting.current = true;
        setConflict(true);
        setIssue(new StorageConflictError().message);
      }
    }
    window.addEventListener("storage", changed);
    document.documentElement.classList.remove("dark");
    return () => window.removeEventListener("storage", changed);
  }, []);
  return {
    state,
    issue,
    error,
    conflict,
    generation,
    original,
    blocked: blocked.current,
    exportState: recoveryState ?? state,
    run,
    importState,
    loadLatest,
    clearError: () => setError(""),
    reset: async () => {
      try {
        return await commit(initialState, true);
      } catch {
        setError("Nie udało się zresetować scenariusza. Dotychczasowy zapis pozostaje bez zmian.");
        return false;
      }
    },
  };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePrototype() {
  const store = useContext(Context);
  if (!store) throw new Error("PrototypeProvider is required");
  return store;
}
