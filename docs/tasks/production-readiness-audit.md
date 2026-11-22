# Production readiness audit

## Intent

Assess the current working tree before deployment with the installed
`production-readiness` skill. Preserve the existing prototype and unrelated local
changes. Record the complete checklist and evidence in
`docs/production-readiness.html`.

## Acceptance criteria

- Inspect the actual architecture, data boundaries, scripts and release guidance.
- Run understood local checks with the required Node.js 24 runtime, without
  installing tools or publishing anything.
- Evaluate every baseline requirement, distinguish preparation from deployment
  verification and real-use observation, and retain unknown scope explicitly.
- Bind evidence to this working tree and the inspected local configuration.
- Render, validate and visually inspect the offline HTML report where possible.
- Present blockers and a concrete proposed repair package for review before code
  changes.

## Scope

Audit and report only. No application behavior change, dependency update, commit,
push, hosting change, deployment or production interaction is authorized by this
task. FEATURES.md was reviewed; the behavior register does not need updating for
this audit.
