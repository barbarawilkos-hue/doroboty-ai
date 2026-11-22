# Keep only public pageviews and clicks

Date: 2026-11-22

## Intent and acceptance

The user no longer wants session recordings, only pageviews and clicks, and has already disabled Record user sessions in PostHog project 355942. Their test URL was `/#/app/podglad-macierzy`, a deliberately excluded private workspace route. Do not expand analytics into private areas.

- Remove all application calls that start or stop replay; keep recording disabled in SDK configuration.
- Block external SDK extension scripts and reject snapshot events before sending. Preserve existing defensive masking configuration without activating the recorder.
- Keep public-route pageviews and native button/link Autocapture, existing form/private DOM exclusions, anonymous memory IDs and payload allowlisting.
- Explain the private-route exclusion and test the public Build category instead.
- Update current privacy/setup/behavior documentation. Run the required gate and a separate review, then verify a published pageview/click and absence of recorder loading after a fresh page load.

## Verification

Before the change, project settings showed Record user sessions off. A fresh public offers visit and Build click appeared as Pageview and Autocapture in Live. Browser diagnostics still showed application-triggered recorder startup calls, so source must enforce counts-only behavior independently of project configuration propagation.

Separate review checked removal of every application recorder-start call, rejection of public/private snapshot payloads, unchanged private-route/form exclusions, continued JSON remote configuration for Autocapture with external scripts blocked, and the optional unconfigured build. The Polish privacy paragraph reuses the existing C22 markup/styles; no layout or immutable kit files changed. Formatting, kit checks, lint, TypeScript, 55 unit tests, baseline packet and the static build passed locally. Browser CI and published verification remain pending.
