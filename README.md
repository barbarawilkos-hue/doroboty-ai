# DoRoboty.ai — AIPH3 prototype

A frontend-only job marketplace for participants to extend and test. Built with React, TypeScript and Vite, using Base UI components. The required visual direction for new and changed screens is the accepted Poster People design system.

## Design system — start here for UI work

Read [project integration instructions](docs/design-system/README.md), [host implementation rules](docs/design-system/IMPLEMENTATION.md) and [application acceptance checklist](docs/design-system/VERIFICATION.md), then [design.md](docs/design-system/agent-kit/design.md), [component API](docs/design-system/agent-kit/components/API.md) and the relevant [human documentation](docs/design-system/agent-kit/reference/index.html). The complete 67-file kit is stored under docs/design-system/agent-kit, including reusable CSS/JS, component states, listing/offer examples, screenshots, Geist Serif with license and illustration. No other chat or global skill is required.

```sh
npm run design-system:check
npm run design-system:dev
```

With Node 24, the first command verifies the preserved kit and examples; the second serves a separate local preview at http://127.0.0.1:8952/. No kit installation is needed. The main app uses port 3001 as below.

Build UI from this system, adapting its anatomy and visual roles into the existing React/Base UI components and host tokens. Preserve application behavior and hash routing; do not replace product state with the standalone demo fixtures/controllers. The application has a host adaptation. For every UI task, compare the affected anatomy, type roles, state and keyboard behavior with the reference; passing kit checks alone does not establish visual acceptance. See the integration guide for exact reading order, assets, React mapping, responsive rules and verification. AGENTS.md and CLAUDE.md enforce the same direction.

## Run

Requirements: **Node.js 24 and npm**.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3001. No environment file, account, database or additional service is required. Package installation requires access to the npm registry.

Select Anna or Marek as a candidate, Karolina or Tomasz as an employer, or the instructor. Publish a job, apply, switch person and record the employer decision. Changes survive reload in this browser; settings provide export, import and reset. AI and scores simulate prepared scenarios. Use example CVs only.

## Build and verify

```sh
npm run build
npm run preview
./scripts/verify
```

The static output is dist/. Browser checks require an already provisioned Playwright Chromium; starting the app never installs it. See [participant guide](docs/PARTICIPANT_GUIDE.md), [architecture](docs/architecture.md), [current features](FEATURES.md) and [case protocol](docs/case/CASE_PROTOCOL.md).

To distribute a baseline participant package, run npm run package:participant -- /absolute/output/directory. This excludes Git history and instructor source material. Never distribute this repository’s history as a stage-safe packet.

## Optional PostHog analytics

The published exercise demo can send only public pageviews and automatic button/link clicks to EU PostHog. Session recording is disabled in code.
An unconfigured checkout makes no analytics requests. For an intentional analytics build,
set `VITE_POSTHOG_PROJECT_TOKEN` to the public, write-only project token in the hosting
provider's production environment, then rebuild/redeploy. The EU ingestion host is set
in `src/features/analytics/analytics.ts`. Local development can use `.env.local`;
`.env.example` contains an empty placeholder. Keep the variable unset for the offline test suite.

Private and unknown routes are excluded, including `/#/app/podglad-macierzy`. The integration
ignores private DOM areas and forms, removes text/attributes, and redacts URL queries and
record IDs. Session recording is disabled, no application code starts it, external extension
scripts are blocked, and before-send rejects snapshot events even on public routes.
Defensive replay masking settings remain dormant. Console/network/body/header/canvas
capture and person profiles are disabled. Identifiers use memory only. To verify a deployment, open its
public URL, navigate through a link and inspect `$pageview` and `$autocapture` events in
PostHog Activity. Match the event's host to the deployed domain.

Simple Autocapture test: open `/#/oferty` and click **Build / Twórz AI**. In PostHog Activity,
inspect the `$autocapture` event with `action = category_build`. This is automatic capture
with a fixed public data attribute, not a separate capture call. Live shows only events
arriving while that view is open; use Events and Reload for stored events. Keep project
Autocapture enabled and Record user sessions disabled. Changing the project replay switch
alone cannot enable recording in this application; source changes would be required.
