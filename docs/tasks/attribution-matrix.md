# Capture attribution at application input

Created: 2026-11-08

## Goal

Replace new applications' broad free-text answer with a project form that explicitly separates the person's contribution, team deliveries and AI use. Employer reading must reproduce submitted structured declarations, never infer personal authorship from collective wording.

## Scope and acceptance

- [x] Offer selectable actions with a concrete detail per selection in three separate layers. Require an answer for each layer, with explicit unknown/no-team/no-AI alternatives rather than invented attribution.
- [x] Capture project context/result, support 1–3 projects, save incomplete drafts and validate complete submissions with shared schemas.
- [x] Preserve submitted matrix snapshots through persistence/import/export, profile changes and role switching. Keep legacy answers/drafts readable and resumable without silently attributing them.
- [x] Show the submitted matrix persistently in application detail for both audiences. Legacy employer records state that no matrix was supplied; remove the rejected hand-authored summary from Marek's record.
- [x] Provide a connected form/read-view demonstration, including an unknown-attribution example. Current employer entry points lead to this mechanism rather than the superseded text-summary comparison.
- [x] Validate attribution boundaries, incomplete input, draft recovery, snapshot immutability, mobile layout and checks. Record browser-suite limitations accurately.

## Design

Use the existing Poster People reading surface, outlined controls, pink selection/facts and serif headings. This is a structured self-declaration, not proof of authorship or a hiring recommendation. Ready options structure answers; required details make selected actions concrete. No AI call or semantic truth detector is introduced.

## Compatibility

Version-1 saves retain optional structured project fields. Old submitted text is immutable and is not rewritten or parsed into ownership. Existing nonempty legacy text drafts may resume the prior form; new applications require the matrix. Historical E01/E02 and the previously selected persistent placement remain unchanged; the input mechanism is revised.

## Verification

- Final `./scripts/verify`: formatting, immutable kit integrity and 6 kit tests, lint, types, 35 unit tests, baseline packet and production build passed. All 35 E2E scenarios failed before execution because Playwright Chromium is absent. Updated E2E journeys are source coverage, not executed results. No browser installation was performed.
- Eight new unit tests cover mandatory layers, selection details, AI configuration, honest unknowns/no-AI/solo, incomplete draft recovery, immutable submitted details, legacy compatibility and invalid action IDs/roles. The four tests of the rejected manual Marek projection were removed with that projection.
- In-app browser: blank submission focuses its first error; a partial matrix draft survives save/reload; approval is required; a complete synthetic Anna application is locally submitted and survives reload. Candidate and employer readouts match exactly; the matrix remains visible on CV. No employer stage was changed and no message was sent.
- Actual application form and submitted record checked at 1280px and 320px without horizontal overflow. Demo checks covered raw typed detail/tool/method equality, unknown attribution without own actions, adding/removing another project without losing the first, and error focus on a missing selection group. An initial demo assertion compared against stale pre-HMR test text; it was repeated against the current pre-action value and passed.
- Legacy Marek record retains its original answer, shows the missing-matrix notice and has no inferred project card. Existing historical text and E01/E02 materials are unchanged. A synthetic test application remains visible as “Test macierzy — projekt demonstracyjny”, Anna Kowalska.
- Separate review: new submissions use shared validation inside the domain operation; drafts allow incomplete data. Optional structured fields preserve version-1 compatibility. Submitted detail renders the saved data directly for both audiences, omits the redundant internal answer, and does not expose employer notes to the candidate. Hidden selections/configuration are removed when submitting an explicit unknown/no-AI/solo answer. Legacy draft text is preserved when saving a converted matrix draft.
- Evidence in `../2026-11-08-attribution-matrix/` relative to repository root: changes.md, checks.json, form/readout desktop/mobile captures, demo complete/unknown captures. The local Vite process was restarted after the earlier server had stopped. An existing browser error tab could not be navigated by the browser tool; checks continued in a fresh tab of the same browser against the restored original application.
