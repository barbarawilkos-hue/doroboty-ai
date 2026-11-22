# Publication blockers

## Authorized scope

The user requested repairs to the blockers identified by the production-readiness
audit. Prepare the existing synthetic-data demo for sharing. Preserve unrelated
working-tree changes; do not deploy, buy services or introduce real accounts.

## Changes and acceptance criteria

- Serialize browser writes with Web Locks and compare the stored snapshot before
  writing. Reject stale-tab actions, including reset/import, without overwriting
  the newer scenario. Offer a separate recovery download and an explicit reload.
  Keep unsupported/unavailable storage usable in memory with clear export advice.
- Await the outcome before showing success, changing stages or navigating. Preserve
  validation, keyboard focus, drafts and submitted snapshots.
- Display a permanent demo notice before content/forms. Use the existing outlined
  paper/pink surfaces, Arial working text and shared Base UI controls. This is a
  scoped host extension using C01/C12/C17/C19, not a new visual system.
- Catch rendering failures and collect only bounded technical codes, times and
  build identity locally. Offer a downloadable technical report without scenario
  text, URLs, CVs, account identifiers or external telemetry.
- Resolve audited development dependency chains without a blanket audit fix or
  changing the immutable design-system kit. Preserve the existing CSS behavior.
- Provision the Playwright test browser without installing OS dependencies; run
  the full quality gate and add meaningful conflict/recovery/privacy regressions.
- Prepare versioned static release, smoke, rollback and incident procedures.
  Leave hosting, audience limits and operational ownership explicit if undecided.
- Refresh the single HTML readiness report against the repaired source version,
  retain the earlier audit and record actual verification results.

## Review

Review the complete repair diff after checks, especially asynchronous action
callers, concurrent writes, recovery exports and diagnostic data boundaries.
Update FEATURES.md for the final behavior. Do not equate local success with a
verified hosted deployment or real-use observation.

Self-review found and repaired two additional edge cases: later blocked actions
must retain the first recovery copy, and submission must keep the form mounted
between the persisted store update and its asynchronous success confirmation.
Old browser tests now wait for observable save/navigation completion and reflect
the existing simple-project form, its CV panel and legacy-format switch. Tailwind
source detection is limited to application sources so report changes do not alter
release assets. The kit remains unchanged.
