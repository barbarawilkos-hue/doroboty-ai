# Replace the recruiter note with three decisions

Created: 2026-11-08

## Scope

Replace only the employer detail's note/action area with “Dopytaj”, “Zaproś na rozmowę” and “Odrzuć”. Clarification supplies an editable question proposal. Preserve the page header, project readout, CV, sidebar, routing and candidate form.

## Acceptance

- [x] Three explicit choices for submitted/reviewed records; choosing an option does not mutate the record until saved.
- [x] Clarification opens a labeled, editable proposed question; the approved text persists in employer history and remains excluded from candidate rendering.
- [x] Invitation and rejection persist through authorized domain operations; repeated clarification and imported history validate. Preserve later process transitions and terminal states.
- [x] Use the existing RecordSheet, Base UI Button/Textarea, H3 scale and outlined/selected control treatments (C01/C02); wrap actions at narrow widths. No new page composition or kit edits.
- [x] Verify domain boundaries, question retention/focus, save/reload and desktop/mobile; report actual gate results.

## Verification

- `./scripts/verify`: formatting, immutable kit (67 files/6 tests), lint, types, 42 unit tests, baseline and build passed. The 35 E2E scenarios could not launch without the Playwright Chromium executable; full gate remains incomplete. Updated affected E2E sources are not reported as executed.
- Four domain tests cover repeated clarification, approved question persistence/import, ownership, validation, terminal states, invitation through review, subsequent conversation and rejection without accidentally storing hidden question text.
- Manual browser: empty/whitespace questions disable save; editing survives switching choices; selection leaves stage unchanged; approved clarification saves to history, focuses status and survives reload. Candidate rendering omits both question and decision form.
- Verified 1311px and 320px widths without horizontal overflow; mobile actions stack. Saved full desktop/mobile screenshots and a focused section screenshot under `../2026-11-08-recruiting-decisions/` relative to the repository root.
- Manual save appended one clarification to the synthetic Anna AI Operations Specialist record (`34170ab6-4262-4e32-82d9-04dbf6f8e787`) and moved it to review. No interview invitation, rejection or external message was sent during browser checks; invitation/rejection persistence was tested in isolated unit state.
- Header, project/CV content, page composition, candidate form and immutable kit were preserved. FEATURES.md EMP-09 and the host record documentation were updated.
