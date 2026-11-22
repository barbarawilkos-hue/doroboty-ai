# Neutral interface, original author voice

Created: 2026-11-08

## Goal

Use neutral generic applicant labels while retaining each person's name and original grammatical forms in their own submitted answer.

## Context

The human clarified that neutral interface copy must not neutralize a person's own voice. Marek Nowak's application should retain his name and masculine first-person wording. This supersedes the source-text adaptation in gender-neutral-project-card.md.

## Plan and acceptance

- [x] Replace generic applicant labels in navigation, list, search, breadcrumbs and supporting UI with natural neutral Polish. Preserve existing URLs and role IDs.
- [x] Restore the original A1/B1 synthetic source wording and personal-action wording; keep neutral system headings and questions.
- [x] Preserve Marek's actual application snapshot and identity. Do not assign the unrelated A1/B1 project to his application.
- [x] Check the list and Marek detail, preview author voice and narrow layout; run the required verification and record actual limitations.

## Files / areas

Prototype shell/workspace, application record, preview JSON and return link, supporting public copy, existing navigation E2E locator, FEATURES.md. Copy only; no storage migration or domain behavior change.

## Verification

- Browser: the list shows “Zgłoszenia”, “Szukaj osoby lub oferty” and Marek Nowak. His detail retains “Pracowałem… Poprowadziłem…” and the original 25% result. No stored application or stage was changed.
- Preview A1 restores “Przygotowałem…” actions and original full answer; B1 restores the original “Odpowiadałem…” answer. Generated headings and questions stay neutral.
- The actual desktop record was visually reviewed and captured. Narrow list/detail measurements were 385px without horizontal overflow; a requested 320px override did not take effect, so no 320px verification is claimed. The temporary override was reset.
- `./scripts/verify`: formatting, immutable design kit and 6 kit tests, lint, typecheck, 27 unit tests, baseline packet and build passed. All 34 E2E scenarios failed to launch due to missing Playwright Chromium; the full gate is incomplete. No browser installation was performed.
- Screenshots and Polish change note: `../2026-11-08-interface-author-voice/` relative to the repository root. FEATURES.md EMP-07/EMP-11 reflects the copy contract; the existing E2E navigation locator uses the new visible label.
