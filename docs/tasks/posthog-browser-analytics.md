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

`./scripts/verify` passed formatting, the immutable 67-file kit and six renderer tests, lint, TypeScript, all 49 application unit tests, the baseline packet and the unconfigured production build. The command exited 1 because the macOS sandbox refused Chromium startup before any of the 42 browser journeys could execute. This was not a passing full local gate; the later GitHub Actions results below verify the browser journeys.

A separate build with the actual public project token succeeded, including the lazily loaded PostHog chunk. Existing dependency versions/integrities were retained; only PostHog and its new dependencies were added. The public write-only token was saved as a Production-only Vercel config variable, outside source control.

Separate diff review checked optional loading, hash-route coverage and effect cleanup, payload allowlisting, memory identifiers, disabled replay/profiles and preservation of local application workflows. The privacy paragraph reuses its existing reading typography, markup and styles; no design-kit or layout changes were made. The live and CI results below were collected after this source review.

## CI, publication and received events

- Pull request #1 passed the complete quality job on commit `ca90daa9e8ee2dfbd60d6307ef148201b4342e45`: 49 application unit tests, 42 Chromium journeys, all static gates and participant packaging. [CI run](https://github.com/barbarawilkos-hue/doroboty-ai/actions/runs/45046375033).
- The reviewed change was merged as `f8c14eeeb41ffdb5377479d050d9f823e37bde2c`; its [main-branch CI run](https://github.com/barbarawilkos-hue/doroboty-ai/actions/runs/45046592905) also passed.
- Vercel production deployment `Ghm6WUHQVBxG9fGgqyNu95fY93re` reached Ready for that merge commit. The public URL is https://doroboty-ai-cyan.vercel.app/.
- The published `/release.json` matched the locally checked analytics source: build ID `85e8351791d2caba18286a701eab4ac26c9ad1e650c6bc72503234850efc52f4`.
- On 2026-11-22 around 17:58-18:00 Europe/Warsaw, browser interactions exercised the homepage offers link, search button, offer detail and return link. PostHog project 355942 showed received `$pageview` and `$autocapture` events in Live, then all 10 stored entries in Activity / Events. The event list identified both `clicked button` and `clicked link`, with the actual production domain. Detail routes appeared as `/oferty/:slug`; query strings and dynamic record values were absent.
- The updated privacy explanation rendered in the local browser and at 390 CSS pixels without horizontal overflow. This change reused existing paragraph markup/styles and did not alter the reference kit.

Verification demonstrates browser event delivery on this demo, not recruiting outcomes, user research or real authentication. Analytics remains optional for other checkouts.
