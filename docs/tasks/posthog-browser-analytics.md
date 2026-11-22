# Connect browser analytics to PostHog

Date: 2026-11-22

## Intent and acceptance criteria

Connect the existing Vercel demo to the user's EU PostHog project 355942 without an AI plugin or wizard. Capture pageviews and button/link clicks on the published site and confirm actual received events in PostHog.

- Keep analytics optional: an unconfigured checkout sends no external analytics requests.
- Use the public project token through Vercel build variables; never add a personal API key.
- Track React Router hash navigation once per pathname, including initial entry and browser history.
- Mask DOM text/attributes and exclude form contents, scenario records, search terms, URL query strings and dynamic record identifiers from outgoing events.
- Keep session replay, surveys, error capture and person profiles disabled. Use memory-only anonymous identifiers.
- Preserve the existing Polish interface and local workflows. Update the privacy explanation using its existing paragraph structure and styles (C22 reading composition); keep the immutable design kit unchanged.
- Run `./scripts/verify`, review the final diff separately, publish the reviewed source and verify real ingestion. Record local, CI and deployment results separately.

## Verification

`./scripts/verify` passed formatting, the immutable 67-file kit and six renderer tests, lint, TypeScript, all 49 application unit tests, the baseline packet and the unconfigured production build. The command exited 1 because the macOS sandbox refused Chromium startup before any of the 42 browser journeys could execute. Browser checks remain pending in GitHub Actions; this is not a passing full local gate.

A separate build with the actual public project token succeeded, including the lazily loaded PostHog chunk. Existing dependency versions/integrities were retained; only PostHog and its new dependencies were added. The public write-only token was saved as a Production-only Vercel config variable, outside source control.

Separate diff review checked optional loading, hash-route coverage and effect cleanup, payload allowlisting, memory identifiers, disabled replay/profiles and preservation of local application workflows. The privacy paragraph reuses its existing reading typography, markup and styles; no design-kit or layout changes were made. Live ingestion, CI and deployment checks remain pending.
