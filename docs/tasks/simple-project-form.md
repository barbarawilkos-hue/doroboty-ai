# Simplify project input to two written fields

Created: 2026-11-08

## Goal

Each project has only a general description and a free-written, line-separated list of the person's specific responsibilities. Remove predefined actions and mandatory team/AI questions from new input.

## Acceptance

- [x] Two textareas per project: “Opis projektu” and “Twój zakres odpowiedzialności”. No action selectors, task checkboxes, separate title/goal/result or required team/AI fields.
- [x] Readout preserves the general description and renders the person's own lines as bullets without AI interpretation.
- [x] Incomplete drafts persist, submissions validate both fields, and historical structured/text submissions remain readable without rewriting them.
- [x] Simplify the connected preview and new application form; verify validation, persistence, readout and mobile layout, and record actual check results.

## Compatibility

Keep the previous structured matrix schema for saved records. Existing structured drafts can be represented in the two fields by retaining their explicit text, not by inferring responsibility from general descriptions. The current new-input format is separately tagged.

## Verification

- `./scripts/verify`: formatting, immutable kit (67 files and 6 tests), lint, types, 38 unit tests, baseline and production build passed. The 35 E2E scenarios could not start because the Playwright Chromium executable is absent; the full gate is not green.
- Unit coverage includes both required fields, incomplete draft and submitted-data round trips, verbatim responsibility text and historical structured-data compatibility.
- Manual browser checks in the shared preview: two textareas, zero action selectors, missing-responsibility error and focus, verbatim general description and responsibility bullets, no inferred team/AI columns, no horizontal overflow at 320px or 1280px.
- No new local application was submitted during these manual checks; they exercised the preview. Existing application records were preserved.
- Evidence: `../2026-11-08-simple-project-form/` relative to the repository root; see `checks.json`, desktop/mobile screenshots and `changes.md`.

## Follow-up demonstration

On 2026-11-08 the requested full workflow was shown using the normal application form, not only the preview. Corrected the remaining old form introduction to describe the two written fields. Submitted one synthetic Anna application to AI Operations Specialist, selected Karolina, and followed My jobs → Applications → Anna's new record. The submitted description and three responsibility points appeared immediately above the CV. Existing records and recruiting stages were preserved. FEATURES.md already describes this behavior and needed no update. Repeated `./scripts/verify`: all pre-E2E checks passed (38 unit tests); all 35 E2E scenarios remained unable to launch without Chromium. Screenshots and the route sequence are recorded in `../2026-11-08-application-recruiter-flow/flow.md` relative to the repository root.
