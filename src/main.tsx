import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import "./app/globals.css";
import { AppErrorBoundary } from "./features/prototype/error-boundary";
import { installDiagnostics, recordDiagnostic } from "./features/prototype/diagnostics";
installDiagnostics();
createRoot(document.getElementById("root")!, {
  onCaughtError: () => {},
  onUncaughtError: () => recordDiagnostic("unhandled-error"),
  onRecoverableError: () => recordDiagnostic("recoverable-render-error"),
}).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
