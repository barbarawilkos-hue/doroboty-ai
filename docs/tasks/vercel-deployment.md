# Prepare the audited demo for Vercel

Date: 2026-11-22

## Intent

Publish the user's current DoRoboty.ai prototype, including the existing audit fixes, through the Vercel web dashboard. The Vercel coding plugin is unavailable on this computer. The user has connected their GitHub account to Vercel and is importing `barbarawilkos-hue/doroboty-ai` into the `do-roboty1` scope.

The fresh `DoRoboty.ai-fork` checkout is not the release source. The authoritative worktree is `/Users/barbara.wilkos/Documents/Code-ai/DoRoboty.ai`.

## Acceptance criteria

- Preserve and commit the current local application changes, including the previous publication fixes, before Vercel builds the GitHub repository.
- Use Node.js 24 for package installation and builds.
- Keep Vercel settings in `vercel.json`: Vite preset, `npm ci`, `npm run build`, public output limited to `dist`.
- Verify the actual GitHub commit and CI result before guiding the user through the final deployment action.
- Verify the deployed build identity, synthetic-data warning, primary workflow and hosting behavior against the actual URL after deployment.
- Add PostHog to this same application and deployment project in a later step, then confirm received Autocapture events. PostHog is not configured by this preparation change.

## Changes

Pinned the application engine to `24.x` in the package manifest and lockfile. The previous range allowed Node.js 26, which can override a Node.js 24 project setting on Vercel. Added explicit Vercel build settings.

The existing product behavior register was reviewed. These deployment settings do not change application behavior, so `FEATURES.md` needs no additional entry for this preparation.

## Verification and release status

Ran `./scripts/verify` with Node.js 24.21.0. Formatting, the 67-file design system reference and six renderer tests, lint, TypeScript, 45 application unit tests, the 120-journey baseline packet and the production build passed. The command finished with exit code 1 because the macOS execution sandbox denied Chromium's `MachPortRendezvousServer` startup before the 42 browser journeys could execute their assertions. This is not a passing browser check. The full gate must be checked in GitHub Actions for the pushed source commit before guiding the user to Deploy.

Compared all 305 original tracked and untracked source files with a saved SHA-256 inventory. Only the two intended Node.js engine fields changed during preparation; existing application changes were preserved. The only newly authored files are this record and `vercel.json`. A credential-pattern scan of the candidate source found no private keys, GitHub token patterns or AWS access key IDs.

The previous readiness report remains historical evidence for its recorded source and local environments. A successful local build or CI run does not verify the future Vercel deployment.

The user is being guided through the dashboard one step at a time. Final publication, costs, operational ownership, browser-local data loss and the PostHog project configuration require their own recorded decisions or verification.

## GitHub Actions activation

The user enabled Actions for the fork on 2026-11-22. The repository's Actions page showed `Actions Enabled.` and no workflow runs yet. The audited application changes and Vercel settings were already present on `main` in commit `a13304370c6a3d7ca23a3b10d358a97789188542`; GitHub had suppressed that push's workflow because Actions was disabled for the fork. This documentation-only follow-up starts the existing push-to-main workflow after activation. Browser test results remain pending until that run completes.

## Portable dependency downloads

The first enabled Actions run (`45040316539`, commit `b3030397adbb39c8169db03f2ecff82b71f19289`) failed during `npm ci`, before application checks. Two lockfile download URLs referenced a corporate package mirror that GitHub could not reach. Replace only those URLs with the public npm registry URLs for the same package versions. Acceptance requires unchanged package versions and integrity values, a clean install using the public registry, and a new CI result. Public registry metadata and downloaded tarball SHA-512 hashes were verified against the existing lockfile integrity values before this change. This has no product behavior impact; the behavior register needs no update.

The user confirmed on 2026-11-22 that the public deployment is a practice demo using synthetic data only. Other publication decisions remain to be resolved step by step before deployment.

The URL-only comparison passed: exactly two `resolved` values changed, with all versions, integrity values and other lockfile metadata preserved. A clean `npm ci` using Node.js 24.21.0 and the public registry succeeded in an isolated scratch directory (238 packages installed, zero vulnerabilities reported). Formatting checks passed for both changed files. The running application's installed dependencies were preserved. The full CI gate remains pending for the follow-up commit; the failed earlier run is not application-test evidence.
