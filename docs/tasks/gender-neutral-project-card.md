# Use gender-neutral project-card copy

Slug: `gender-neutral-project-card`
Created: 2026-11-08

## Goal

Remove assumptions about a person's gender from the project-card preview, its action summaries, suggested questions and synthetic application text.

## Context

The human requested inclusive wording because people applying can have different genders. Use natural neutral Polish, action nouns and direct questions without gendered past-tense forms. Preserve the three project sections and selected persistent placement.

## Plan

- [x] Review generic copy, both preview fixtures and the shared material label.
- [x] Update authored wording and neutralize the synthetic preview examples while retaining their facts and ambiguities.
- [x] Check both cases, question insertion, mobile wrapping and the build/check gate.

## Acceptance Criteria

- [x] Preview examples are Osoba A / Osoba B; generic copy does not assume a male applicant.
- [x] Personal actions use action nouns, and suggested questions avoid masculine second-person past tense.
- [x] Full synthetic answers and B1 gap wording match the neutral adaptation.
- [x] Original E01/E02 materials and actual stored/person-specific submissions are not rewritten.
- [x] Record actual verification results and limitations.

## Files / Areas

Preview component and JSON, shared employer material label, FEATURES.md. No style, state or domain-operation change is needed.

## Risks

Neutral wording must preserve personal responsibility and unknown contribution. Generic labels can be neutralized; quoted historical case evidence remains unchanged.

## Handoff Notes

This is a copy revision of the existing scoped prototype. The standalone design kit remains immutable. The source fixture text is a neutral adaptation of the same synthetic scenario, not a new research observation.

## Verification

- In-app browser: A1 and B1 show neutral actions, suggested questions and full answers. Both “Use question” actions insert the displayed neutral question and focus the question field. The label is “Pytanie do osoby aplikującej”.
- Both cases fit a 320px viewport without horizontal overflow. A1 was also reviewed at 1280px; the temporary viewport was reset afterwards.
- `./scripts/verify`: formatting, design-kit integrity and its 6 tests, lint, typecheck, all 27 unit tests, baseline packet and production build passed. The 34 E2E scenarios could not launch because Playwright Chromium is not installed; the full gate remains incomplete. No browser was installed.
- Evidence: `../2026-11-08-neutral-project-card/project-card.png` and `changes.md` relative to the application repository root.

## Clarification after review

The human clarified that neutral wording applies to generic interface copy, while a specific person's own wording and identity should be preserved. The source adaptation and forced action-noun wording above are superseded by `neutral-interface-author-voice.md`. Original preview source/action voice has been restored; neutral interface labels and questions remain.
