# Show personal actions in three project-card sections

Slug: `simplify-project-card-content`
Created: 2026-11-08

## Goal

Present only Own work, Team and AI, and Result as project facts. Merge checking activities into the personal-action list and remove repeated source disclosures.

## Context

The human selected the persistent section, then requested a list of personal actions, no separate Checking field, and no duplicate Fragment zgłoszenia controls. Preserve the gaps/question/decision workflow and the full submitted answer in its existing material tab. The accepted E01/E02 plans and original study materials are not revised by this UI edit.

## Plan

- [x] Inspect current preview, fixtures and existing reading styles.
- [x] Render three project-fact sections using a semantic list for known personal actions.
- [x] Retain explicit unknown personal contribution in B1.
- [x] Remove disclosure markup, icon and unused styles.
- [x] Update behavior documentation and verify both example cases and responsive widths.

## Acceptance Criteria

- [x] Own work lists A1's indexing, question preparation, human selection/evaluation and comparison with documents.
- [x] Checking is not a separate heading; source-disclosure controls are absent.
- [x] Team/AI and Result remain separate facts.
- [x] B1 does not gain invented personal actions.
- [x] Full source answers, gaps, suggested questions and simulated decisions remain usable.
- [x] Run `./scripts/verify` and report actual browser-suite limitations.

## Files / Areas

Project-card preview component, its scoped CSS and synthetic preview fixtures; FEATURES.md. Existing shared record components do not need changes.

## Risks

Summarized actions must remain supported by the original source. Removing repeated quotes must not remove access to the full answer. The evidence-map test protocol remains separate from this UI revision.

## Handoff Notes

Use existing C22 reading anatomy and current project-card geometry. No theme, typography-family or immutable-kit change is needed. Screenshots and checks belong in the parent project under `prototypes/2026-11-08-project-card-content/`.

## Validation and separate review

- In-app browser: A1 shows four personal actions and exactly the three requested fact headings. B1 keeps an empty personal-action list and an explicit unknown contribution. Both retain the full Answer tab; no project-card details/disclosures remain. The alternative tab preview uses the same three sections.
- Checked 320/390/1280px with no horizontal overflow, and verified visible disc list markers. Saved current screenshot and DOM checks in the parent project artifact folder.
- Formatting, immutable kit checks, lint, TypeScript, 27 unit tests, baseline packet verification and build passed. Full verification is not green: browser launches fail because Playwright Chromium is absent. No browser or OS dependencies were installed. Final list-marker CSS was format-checked and the production build repeated.
- Separate review: all four A1 actions are supported by the original source, including the human question selection/evaluation previously displayed under Team and AI. Preview source answers and gaps remain identical to E01. B1 has no fabricated individual work. Removed the now-unused source-disclosure styles and icon. No shared record, domain operation or stored application change is required.
- UI revision is authorized by the human. E01/E02 plans and results remain unchanged; this local check is not a participant session.
