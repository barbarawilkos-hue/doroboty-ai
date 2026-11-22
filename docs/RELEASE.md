# Publish and recover the synthetic demo

This runbook prepares a public link to the frontend demo. It does not authorize
deployment. Hosting, the public URL, a cost limit and the person responding to
problems must be recorded for the actual deployment before inviting visitors.

## Boundaries

- Use fictional people, applications and CVs only. Persona selection is public.
- A link shares the interface, not browser-local changes. A scenario file shares
  every persona and note. Never request real CVs or private scenario exports.
- Changes persist only in the same browser origin when storage and Web Locks are
  available. Otherwise the interface explicitly offers memory-only use and export.
- Export after a session and before an update, reset or browser-data cleanup.
  Changes made after the last export have no backup. Agree whether that loss is
  acceptable before admitting visitors; there is no central data store to restore.

## Prepare a known version

Use Node.js 24, npm, Python 3.9+ and the lockfile:

```sh
npm ci
npm exec playwright install chromium
./scripts/verify
npm run release:prepare
```

The test-browser command downloads Chromium; it does not install OS dependencies.
Do not skip a failing gate. `release:prepare` builds the site and creates a new
`artifacts/releases/<build-id>-<time>/doroboty-demo.zip` with `manifest.json`.
The manifest records every public file hash and the archive hash. The ZIP contains
the contents of `dist/`, not source history, reports or instructor material.

Tailwind scans `src/` explicitly, so generated reports and other documentation do
not change the public CSS. A clean source package must produce the same build ID
and public asset hashes; `release.json` may differ in build time.

`release.json` inside the site identifies its source-derived build ID, app version
and build time. The help page and technical reports contain the same build ID.
Keep the ZIP and manifest for the previous working release before replacing it.

## Hosting requirements

Choose a static host with HTTPS. Publish only the ZIP contents or `dist/`.
For a Git-based build, use `npm ci`, build command `npm run build`, Node 24 and
output directory `dist`. Hash routing needs no server route rewrites. No account
service, database, application secrets or runtime environment variables are needed.

Configure the host to revalidate `index.html` and `release.json`; long immutable
caching is suitable only for content-hashed assets. Keep old hashed assets while
previously opened tabs may still need them. Inspect the actual host settings
instead of assuming these requirements were applied. Never upload the entire repo.
Invalidate the cached entry HTML when switching releases, including rollback;
modification-time-only revalidation can incorrectly retain a newer HTML file when
older files are restored. Rehearse the host's cache purge or content-ETag behavior.

Before admitting visitors record: host, HTTPS URL, build ID, configuration reference,
who can roll back, contact route, expected audience and cost/transfer limit. Set a
spending cap or equivalent host control where supported; do not assume a free tier
cannot charge. No provider or spending commitment is selected by this runbook.

## Smoke test the target deployment

Use a separate browser profile and synthetic data. Record date, URL, build ID and
each result. Do not call a local test proof of the deployed configuration.

1. Open `release.json`; compare its build ID with the manifest. Open the homepage
   over HTTPS and confirm the demo/data warning and help link.
2. Select Anna, open a job, check the sample PDF, fill a project and responsibilities,
   save/reload the draft, approve and submit once. Confirm one application exists.
3. Select Karolina, read the submitted snapshot, save a clarification and reload.
4. Open the same scenario in two tabs. Save in one; the other must reject its stale
   action and offer a separate recovery copy. Reload only after preserving edits.
5. Export, reset this test scenario with confirmation, import the copy and reload.
   Verify the application, history and unchanged sample CV.
6. Use the main controls with the keyboard. Check 320/390px widths, visible labels,
   errors, long Polish text and the actual PDF in a capable browser.
7. Download a technical report from help. It must contain build identity and at
   most 20 technical codes/times, without scenario text, URLs or person identifiers.
8. Verify the host's HTTPS, cache, access logs, monitoring/alert destination and
   transfer/spending controls with their real configuration identifiers.

Stop inviting visitors if a required step fails, saves disappear, the build ID is
wrong or private data is exposed. Restore the last working artifact if appropriate;
then repeat the smoke test. Do not erase visitors' storage to mask a failed check.

## Diagnose, communicate and roll back

The person sharing the deployed copy must identify an operator with hosting access
and a contact route. For a small demo, help directs a visitor to the person who
provided the link; confirm that handoff and operational ownership explicitly.

1. Ask for reproduction steps and the technical report from `/#/pomoc`. Do not ask
   for a real CV, full scenario, console dump or a URL containing private tokens.
2. Compare the report's build ID with `release.json` and the release manifest.
   Codes distinguish rendering failure, storage failure, conflict and invalid import.
   Reports remain in the visitor's tab until downloaded; they are not remote logs
   or an automatically delivered alert. Verify a real alert after choosing hosting.
3. If service is broken, pause distribution and tell the people already invited
   that the demo is temporarily unavailable and that they should preserve exports.
4. Preserve the current files/manifest for diagnosis. Restore the previous ZIP
   through the chosen host's documented release mechanism. Do not overwrite a live
   data store, clear browser storage or infer data rollback from file rollback.
5. Before relying on a rollback, rehearse the previous artifact against a copy of a
   scenario written by the new version. Verify the complete history and export.
   Both versions currently use schema v1; that fact alone is not a rehearsal.
6. Confirm the restored build ID, refresh behavior, PDF, main journey and saved data.
   If old code cannot read a save, keep the original and restore compatible code;
   use import/export recovery only with explicit confirmation.

## Observe after sharing

Agree an initial group and success criteria before collecting results: completion
of the application/recruiter flow, missing saves, actionable error reports and
actual transfer/cost versus the host limit. Use a sample appropriate to that group;
no universal traffic target or observation period is claimed. No traffic is not
proof of reliability. Keep publication verification and observation separate from
local preparation in `docs/production-readiness.html`.
