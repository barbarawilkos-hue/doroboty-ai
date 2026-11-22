import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { diagnosticReport, recordDiagnostic } from "./diagnostics";
import { downloadText } from "./download";
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    recordDiagnostic("render-error");
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="prototype-panel prototype-fallback">
        <h1>Nie udało się wyświetlić strony</h1>
        <p className="my-5">
          Zapisane dane scenariusza pozostają w przeglądarce. Odśwież stronę. Jeśli problem wraca,
          przekaż raport techniczny osobie, od której masz link do demo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>Odśwież stronę</Button>
          <Button
            variant="outline"
            onClick={() => downloadText("doroboty-raport-techniczny.json", diagnosticReport())}
          >
            Pobierz raport techniczny
          </Button>
        </div>
      </main>
    );
  }
}
