export type DiagnosticCode =
  | "render-error"
  | "unhandled-error"
  | "unhandled-rejection"
  | "recoverable-render-error"
  | "storage-unavailable"
  | "storage-write-failed"
  | "storage-conflict"
  | "invalid-import";
const codes = new Set<DiagnosticCode>([
  "render-error",
  "unhandled-error",
  "unhandled-rejection",
  "recoverable-render-error",
  "storage-unavailable",
  "storage-write-failed",
  "storage-conflict",
  "invalid-import",
]);
const events: { code: DiagnosticCode; at: string }[] = [];
export const buildId = import.meta.env.VITE_BUILD_ID ?? "development";
export const appVersion = import.meta.env.VITE_APP_VERSION ?? "0.1.0";
export function recordDiagnostic(code: DiagnosticCode) {
  // Never accept messages, stacks, URLs or scenario data, even from untyped callers.
  if (!codes.has(code)) return;
  events.push({ code, at: new Date().toISOString() });
  if (events.length > 20) events.shift();
}
export function diagnosticReport() {
  return JSON.stringify(
    { version: 1, appVersion, buildId, events: events.map((e) => ({ ...e })) },
    null,
    2,
  );
}
export function installDiagnostics() {
  window.addEventListener("error", () => recordDiagnostic("unhandled-error"));
  window.addEventListener("unhandledrejection", () => recordDiagnostic("unhandled-rejection"));
}
