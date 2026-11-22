# Exclude private areas and enable masked session replay

Date: 2026-11-22

## Intent and acceptance criteria

Verify that Autocapture is enabled in source and project 355942. Keep automatic public button/link clicks, identify the Build category button as a simple test, and exclude private input/display areas. The user explicitly chose to enable masked session recording.

- Allow analytics only on known public routes; exclude all workspace, persona-picker, application and unknown routes.
- Ignore forms, editable controls and explicitly private DOM subtrees in Autocapture. Do not add per-button capture calls.
- Mark private route content synchronously in the DOM so replay never serializes its contents during navigation.
- Record public use with masked text/inputs/attributes, blocked private subtrees/forms/images/documents, redacted URLs, and no console/network/body/header/canvas capture.
- Pause replay on private routes in both application code and the project's URL blocklist. Respect project recording settings.
- Retain optional setup, memory-only anonymous identifiers and no person profiles.
- Update current behavior/privacy/setup documentation, run the required gate, separately review the diff, then verify the published click and a playable masked recording.

## Verification

The project Autocapture switch was already enabled. Record user sessions was enabled in the project but disabled in the previous browser integration. Project privacy was changed to Total privacy; console and network capture were disabled. A global replay URL blocklist now matches `https?://[^/]+/[^#]*#/(?:app|auth|aplikuj)(?:[/?#].*)?`. The project's tester matched the profile URL and did not match the public offers URL.

The application now uses a public-route allowlist, synchronous private DOM markers, form/control/dialog/media blocking and before-send rejection of private/unknown route events, including buffered replay data. Replay starts only on public routes and stops in layout-effect cleanup. Text/input values, DOM labels/destinations and URL queries/record identifiers are masked before serialization or sending. Only styling/icon geometry is retained. Autocapture accepts structural elements from both SDK payload formats and only predefined category action names.

`./scripts/verify` passed formatting, reference-kit integrity/six renderer tests, lint, TypeScript, all 55 application unit tests, baseline verification and the unconfigured build. Its browser stage could not launch Chromium because of the macOS sandbox; none of the 43 browser journeys passed locally. An enabled production build with the public token also succeeded. The new browser regression checks private route/form markers and that the public Build control remains usable/capturable by policy.

Separate review checked the private navigation boundary, private DOM marker timing, optional setup, native Autocapture (no per-button capture calls), replay URL redaction, both Autocapture element formats, disabled secondary capture channels, and unchanged layout/design assets. PR #2 passed the full GitHub Actions gate, including 55 unit tests and all 43 browser journeys, and was merged as 94eb7ff. Vercel published build cac98cb1fa86327557de6f5da9a201975ae83b6942053f75236d8fe5485f1f1d. Stored Activity confirmed a public clicked-button event with action category_build and a URL without the debug/query parameters. Replay 01a20445-a3fa-70aa-bf79-228e94249ac0 opened with masked text and blocked forms; the deployed private panel was under the private DOM marker.

## Replay fidelity follow-up

The live recording exposed missing CSS: rrweb's generated `_cssText` and blocked-region geometry were removed by attribute masking. Preserve generated stylesheet text only for a LINK with rel=stylesheet pointing at a same-origin public `/assets/*.css` build file, without query/hash. Keep generated blocked-region geometry. Continue removing all labels, input values, IDs, destinations and other synthesized CSS. Regression checks reject cross-origin, uploaded and query-bearing stylesheets. Acceptance: the published replay keeps public page layout with text/forms/private areas still masked or blocked.

PR #3 passed the full CI gate (55 unit tests, 43 browser journeys) after a separate privacy-boundary review and was merged as 818878b. Its main-branch CI also passed. The local gate again passed through the static build, then failed to launch Chromium under the macOS sandbox. Vercel published build a8bd0a24c69d6dcad1d6387cc7526ae73efe6c334c7a1449c97741729dd17eb6. A fresh public-page session, 01a2044d-e46d-7de5-a89c-f8ec523fefbb, is playable in project 355942; the player retains page styles, masks text and shows blocked form/image regions. A synthetic search sentinel was entered in the blocked form and did not appear in the replay. Stored Activity linked the public click to this recording. The form was cleared after verification. Screenshots of the category_build event and masked player were saved as user-facing evidence. No private production user data was used.
