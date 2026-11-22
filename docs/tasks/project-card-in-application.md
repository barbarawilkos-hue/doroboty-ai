# Show the selected project card in the normal employer application

Created: 2026-11-08

## Goal

The normal employer path Zgłoszenia → Marek Nowak opens his project card immediately above Answer/CV, using the selected persistent placement.

## Context

The human chose version 1, then repeatedly reached the existing application detail without the card. The isolated A1/B1 comparison is insufficient for that navigation. Reuse its card anatomy with a separate manual fixture grounded in Marek's existing submitted answer about support automation, not the unrelated document-search project.

## Plan and acceptance

- [x] Extract the shared card and scoped styles without changing the two comparison layouts.
- [x] Add a manual projection of the known synthetic application snapshot: own actions and declared 25% result; team/AI and measurement details remain unknown.
- [x] Render it persistently in the authorized employer detail. Require exact source/identity matching so custom or unrelated answers never receive this card.
- [x] Suggested question appends to the unsaved employer note and focuses it. Preserve existing note content and stage behavior; omit this action at terminal stages.
- [x] Keep candidate view, saved application snapshots, CV, score, history and existing role boundaries unchanged.
- [x] Verify the normal list/detail path, persistent card across tabs, note insertion, narrow layout, comparison preview and tests; record real limitations.

## Scope and risks

This is a local teaching prototype for the prepared Marek snapshot, not automatic extraction for arbitrary applications. Do not rewrite stored answers or attach A1/B1 content to Marek. The card is a summary of declarations, not an independent skills assessment. No messages or real invitations are sent.

## Verification

- In-app browser: normal list → Marek detail reveals the three fact sections above material tabs. Card persists on CV. Suggested question preserves the existing note and focuses it; repeated clicks do not duplicate it; a 12,000-character note stays intact with a visible error. Test text was removed and no stage action was executed.
- Actual 1280px and 320px viewports had no horizontal overflow. The shared preview's first Project and gaps tab still activates in variant 2; B1 retains unknown individual work. Temporary viewport override was reset.
- `./scripts/verify`: formatting, 67-file kit integrity and 6 kit tests, lint, typecheck, all 31 unit tests, baseline packet and build passed. The 35 E2E scenarios failed before execution because Playwright Chromium is absent. The added E2E journey is present but unexecuted; no browser/OS dependencies were installed.
- Four new unit cases cover the prepared source and rejection of altered answer/person/application identity. E2E coverage adds normal navigation, persistent placement, note retention/focus/deduplication/length, terminal behavior and candidate omission; custom-snapshot coverage asserts no mismatched card.
- Separate review: employer lookup still authorizes the record first; the projection is read-only and exact-source scoped; candidate controller does not pass the card. Terminal records keep reading but omit the append action. Shared CSS is scoped to the card. Source answer/CV, score, events and stage operations remain unchanged.
- Evidence: `../2026-11-08-integrated-project-card/` relative to repository root contains `changes.md`, `checks.json`, desktop/mobile full-page captures and `marek-card.png` with the application header and card.
