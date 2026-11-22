import { describe, expect, it } from "vitest";
import { diagnosticReport, recordDiagnostic, type DiagnosticCode } from "./diagnostics";
describe("private local diagnostics", () => {
  it("retains only bounded, allowlisted technical codes without accepting private payloads", () => {
    recordDiagnostic("private CV https://example.invalid/?token=secret" as DiagnosticCode);
    for (let i = 0; i < 35; i++) recordDiagnostic("storage-conflict");
    const report = JSON.parse(diagnosticReport());
    expect(Object.keys(report).sort()).toEqual(["appVersion", "buildId", "events", "version"]);
    expect(report.events).toHaveLength(20);
    for (const event of report.events) {
      expect(Object.keys(event).sort()).toEqual(["at", "code"]);
      expect(event.code).toBe("storage-conflict");
      expect(Number.isFinite(Date.parse(event.at))).toBe(true);
    }
    expect(diagnosticReport()).not.toMatch(/private|secret|example\.invalid|CV/);
  });
});
