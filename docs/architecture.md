# Architecture

One React/TypeScript application is built by Vite into static files. HashRouter renders routes under /#/; route parameters created in the browser require no hosting rewrites. The running app currently uses local CSS tokens, Timeless font and Base UI primitives. New and changed UI must follow the accepted Poster People [design system](design-system/README.md), adapted into the existing stack; installing its reference did not convert runtime styles. There is no server data/API layer.

## Data flow

JSON marketplace/person fixtures → initialState → PrototypeProvider → feature views. Local operations go through transition with shared Zod schemas and explicit role/ownership/transition checks for coherent simulation. All roles still have access to the same browser data; these checks are not security.

Candidate source notes, generated draft and approved application are distinct fields. Submission snapshots CV, candidate name, job title, scenario score and summary. Employer stage events are appended, with private-in-the-UI notes. Profile/job edits do not rewrite submitted records.

Storage uses one versioned localStorage key. Import validates schema/version, unique IDs, cross-references and stage history before replacing state. Unreadable/incompatible saves are protected against automatic overwrite; settings can download the original raw save, import a valid file or explicitly reset. Failed/quota-limited persistence leaves the in-memory app usable and offers export. Import/export is capped at 2 MB; no binary CV storage.

## Features

src/features/prototype owns model/storage/state and page compositions. src/features/jobs retains reusable presentation/filter/description logic; src/components/ui owns Base UI controls. Keep changes small.

LocalStorage is origin-specific. Reload preserves state; another browser/device/port starts separately. Writes acquire a same-origin Web Lock and compare the exact loaded storage snapshot before writing. A stale tab is blocked rather than merged; it can export its attempted change and explicitly reload the latest scenario. Import/reset use the same guard. There is no automatic live synchronization. Browsers without Web Locks use memory-only edits with export guidance. Hash links reference records in the receiving browser, not transferred records.

## Evidence and distribution

The baseline historical CSV and JSON are separate from interactive state. Future evidence must arrive in a separately reviewed package. package:participant copies only explicit allowed files/directories, including the complete docs/design-system guide/kit, and omits docs/source, historical task notes, agent run history and .git. A packet verifier checks the baseline data; packaging also verifies a pristine file/hash manifest. Ordinary checks permit participants to edit code and generate build/test output without invalidating a distribution fingerprint. Instructor repository history is never participant-safe.

## Checks

npm run check and ./scripts/verify run formatting, design-system reference integrity/example checks, lint, types, unit tests, build and Playwright against the static preview. Playwright checks external requests, complete workflows, error/recovery behavior, keyboard controls and mobile layout. No test starts system services. npm run dev only starts Vite.

## Diagnostic and release identity

The app collects at most 20 technical codes/times in tab memory, with app version and a source-derived build ID. It does not collect messages, stacks, URLs, scenario content or person identifiers and does not send telemetry. Help and the render-error fallback offer an explicit technical download. Vite emits release.json, and release:prepare archives only dist with file hashes. See RELEASE.md for smoke, recovery and rollback procedures.

## Optional browser analytics

`src/features/analytics/` lazily loads posthog-js only when VITE_POSTHOG_PROJECT_TOKEN is
configured. AnalyticsPageviews observes HashRouter pathnames; effect cleanup prevents
duplicate StrictMode captures and stale captures after an asynchronous load. Autocapture
is restricted to button/link clicks. Before-send allowlisting keeps only basic SDK metadata,
normalized public routes, structural element positions and fixed public action names. DOM
text/attributes, search queries, record identifiers and person properties are excluded.
A synchronous private DOM marker blocks sensitive route subtrees; layout-effect cleanup
pauses recording during navigation and private routes reject all analytics payloads.
Session replay uses text/input/attribute/URL masking and blocks forms, images and documents.
Console, network, header/body and canvas capture stay disabled in source and project settings.
EU ingestion, memory-only anonymous IDs and disabled person profiles keep analytics separate
from the browser-local scenario and local diagnostic reports. A missing or blocked SDK does not prevent rendering.
