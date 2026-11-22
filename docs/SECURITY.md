# Prototype data boundary

This static frontend has no trusted server or real authentication. Role-specific UI and local transition checks organize the scenario; anyone using the browser can inspect all stored data. Use synthetic data only.

No secret API keys, credentials, real CVs or private material belong in frontend source, JSON, localStorage or exports. Exports include private-in-the-UI source/recruiter notes.

Render imported text through React text nodes, validate imports with shared Zod schemas, reject unsupported versions, duplicate IDs, broken references and oversized files. Never overwrite an unreadable save automatically.

Writes are serialized by the same-origin Web Locks API and guarded by a stored-snapshot comparison. Neither role selection nor the write lock authenticates a person. Conflicting tabs require an explicit reload; recovery copies are separate scenario exports and contain every persona/note. Browsers without safe locking do not persist edits.

Local diagnostics accept only allowlisted technical codes and timestamps, are capped at 20 events in memory, and contain build identity. No messages, stacks, URLs, CVs or scenario fields enter the report. Diagnostics are never sent externally. Optional browser analytics is separate: a public, write-only PostHog project token enables EU pageview/click delivery. Before-send allowlisting removes text, DOM attributes, queries, dynamic route IDs, referrers and person properties. Masked session replay is restricted to known public routes. Private route subtrees, forms, controls, images and documents are blocked; replay stops on private routes. Text and DOM attributes are masked, replay URLs are redacted, and console/network/body/header/canvas capture is disabled. Person profiles are disabled; analytics identifiers live only in memory. No personal API key is used. Remote alert delivery is not implemented.
