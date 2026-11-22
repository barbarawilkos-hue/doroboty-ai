# Compare two prominent project-card placements

Slug: `project-card-placement-previews`
Created: 2026-11-08

## Goal

Let the human compare an always-visible project section and a first, initially selected Project and gaps tab before choosing a placement. The project card must be the main value in both previews.

## Context

The human requested versions 1 and 2 of the employer application-detail proposal. O02/O01 and I01+I05 remain selected. On 2026-11-08, after reviewing both previews, the human selected version 1: the persistent section above the source-material tabs. Preserve the live scenario and the accepted, unexecuted E01/E02 plans.

## Plan

- [x] Read repository and Poster People guidance and inspect shared record consumers.
- [x] Reuse ApplicationRecord, RecordSheet, existing controls and snapshot-reading patterns.
- [x] Add an isolated, synthetic preview route with the same materials and actions in both variants.
- [x] Verify responsive layouts, source disclosures, tabs, question composition and simulated decisions.
- [x] Run verification and record actual limitations.

## Acceptance Criteria

- [x] Variant 1 shows the project above the original-material tabs immediately.
- [x] Variant 2 initially selects Project and gaps; reaching the card needs no extra click.
- [x] Layout switches retain the preview decision and notes; both variants share identical project data.
- [x] A1 and B1 are synthetic E01-derived materials, never additions to real scenario applications.
- [x] Source quotes, unknown personal contribution and unmeasured results remain explicit.
- [x] Preview decisions never mutate stored applications or send invitations/messages.
- [x] Existing candidate/employer record views retain their default composition.
- [x] Desktop/mobile, 320px overflow and keyboard checks are recorded.
- [x] `./scripts/verify` executed; browser-suite blockers are recorded below.

## Files / Areas

New preview controller/card/styles/data; optional additive ApplicationRecord/RecordSheet slots; app routes; employer-list entry; FEATURES.md and record API documentation.

## Risks

The existing score must not imply validated skills. The preview omits scores in both variants and explicitly identifies synthetic materials. First-tab selection must reset correctly when switching layout without discarding the parent's notes. Shared defaults must not change.

## Handoff Notes

Use the unchanged kit's C01/C02 controls, C07 facts, C13 contextual return and C22 reading roles. Project-map anatomy is a scoped host extension. Evidence-card and source content derives from the vault's E01/stimuli.json A1/B1; exact source statements are retained. No customer testing or extraction benchmark is executed by this task.

## Validation and separate review

- Final source checks: formatting, kit integrity (67 files and 6 tests), lint, TypeScript, 27 unit tests, baseline packet validation and production build passed. The full gate is not green: its browser web server was blocked by the sandbox; the separately permitted E2E retry stopped at the first test because Playwright Chromium is absent. No browser/OS dependencies were installed.
- In-app browser checks: both variants at 320, 390 and 1280px, no horizontal overflow; first Project and gaps tab selected automatically; source disclosure with Enter and tabs with arrow keys; Use question focuses the question field; decision/reason/question survive variant changes; simulated save; B1 preserves unknown individual work and missing evaluation method.
- Regression smoke: the existing employer example keeps Answer/CV, prepared PDF, score, note and stage actions. The candidate example keeps its immutable answer/CV composition and omits employer notes and the new project card. No real stage mutation or withdrawal was executed.
- Separate diff review: new slots are optional and existing callers keep defaults. Preview state has no store actions, API or persistence writes. Packaged A1/B1 source, fields and gaps were compared exactly with E01 materials. Preview is public synthetic content; private application ownership checks remain in existing controllers.
- Screenshots and checks are stored in the parent vault project under `prototypes/2026-11-08-project-card-variants/`. These are local implementation checks, not customer research or acceptance of either layout.
- The immutable source kit was integrity-checked and its documented anatomy reviewed. A paired live source-catalog visual audit on port 8952 was not performed; no full design-system visual-acceptance claim is made.
- Local preview: `http://127.0.0.1:3001/#/app/podglad-karty?wariant=1` or `wariant=2`. Version 1 is selected; version 2 remains a comparison preview. The existing route already defaults to version 1. This selection does not constitute executed research or approval of the test criteria.

## Follow-up: content simplification

The human subsequently requested a personal-action list, including checking work, and only three project-fact sections. Repeated source disclosures were removed. See [the scoped content change](simplify-project-card-content.md) for the current fixture shape and verification; the source-disclosure checks above record the earlier comparison version.
