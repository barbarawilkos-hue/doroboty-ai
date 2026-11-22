# Move the application outside Second Brain

Date: 2026-11-22

## Intent

Keep the application in its own directory, separate from the Second Brain knowledge workspace, as requested by the user.

- Previous location: `/Users/barbara.wilkos/Documents/super-brain-main/3-Projects/doroboty-ai/prototypes/doroboty-ai`
- Current location: `/Users/barbara.wilkos/Documents/Code-ai/DoRoboty.ai`
- Existing remote: `https://github.com/barbarawilkos-hue/doroboty-ai.git`

## Acceptance criteria

- Move the complete existing repository, including `.git`, local edits, untracked files, dependencies, the readiness report and release packages.
- Preserve the current commit, branch and remote.
- Store the current application location in the Second Brain project index, log and prototype directory.
- Keep historical log entries intact and explain how their old application paths map to the new directory.
- Run the repository verification gate from the new location.

## Migration verification

The directory was moved atomically on the same volume. Before adding this task record, SHA-256 hashes and file modes matched for all 15,794 files; all 17,023 filesystem entries, including directories and symbolic links, matched. Git status, commit `81682a81c186e9065ec8fab4d7bd368556fdfe6a`, branch `codex/project-card-variants` and the existing remote were unchanged. The old application directory no longer exists.

The feature register was reviewed. No application behavior changed, so `FEATURES.md` needs no update for this relocation.

## Checks from the new location

Used the installed Node.js 24 runtime at `/opt/homebrew/opt/node@24/bin`.

- Passed: formatting, design system integrity (67 files, six renderer tests), lint, TypeScript, 45 application unit tests, baseline packet validation (120 journeys) and the static production build.
- Passed: a temporary development server at `http://127.0.0.1:3001` returned HTTP 200 for the application HTML and the transformed main module. The server was stopped after this check.
- Browser journeys remain unverified in this session. The initial gate could not bind the local preview port (`listen EPERM`). After network access was granted, the preview server started, but macOS sandboxing blocked Chromium before journey assertions ran (`MachPortRendezvousServer`, permission denied). The complete gate therefore did not pass. No browser configuration or application code was changed to bypass this restriction.
- The original Git status entries remain present; this relocation task record is the only additional source file. Existing release packages and the historical readiness report remain available in the moved repository.
