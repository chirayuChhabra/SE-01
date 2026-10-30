# Architecture and component boundaries

Working proposal · 30 October 2026. These are modules, not a requirement for separate services or repositories.

## Main boundary

One learning engine operates on the device whether connectivity is available or not. Avoid separate offline and online recommendation implementations that drift. The backend validates synced evidence and reconciles accepted progress using explicit policies.

## Components to build

| Component | Responsibility |
| --- | --- |
| Content schema and validator | Define objects, references, compatibility, and validation errors |
| Curriculum/skill catalogue | Outcomes, stable skills, prerequisites |
| Teacher Content Studio | Lesson intake, editing, previews, review, publication |
| AI preparation worker | Bounded generation jobs and saved stage outputs |
| Question bank and scorer | Reusable question revisions and supported answer evaluation |
| Simulation runtime | Approved templates, configuration, state, task responses |
| Content library and pack builder | Versioned publication and complete downloadable bundles |
| Student player | Render activities, answers, feedback, navigation, language |
| Learning engine | Evidence-based estimates, activity selection, recommendation reasons |
| Local storage/download manager | Pack installation, attempts, state, pending uploads |
| Sync/reconciliation service | Retry-safe ingestion, validation, accepted progress |
| Teacher workspace | Classes, assignments, evidence, gaps, last sync |
| Identity/administration | Roles, accounts, class access, shared-device separation |

Start with one repository and a backend plus a generation worker as needed. Select the language/framework/storage after confirming device requirements; no stack is committed here.

## Core contracts

- Content Studio and AI both produce the same validated content objects.
- The pack builder consumes published revisions, never mutable drafts.
- The player renders activity data without embedding recommendation policy in UI components.
- The scorer evaluates supported answer rules; the learning engine interprets that evidence.
- The learning engine consumes the skill graph, evidence, available activities, assignment constraints, and policy version. It returns estimates, a recommended activity, and a reason.
- Storage persists evidence before the UI claims it is saved; sync transfers it independently of learning.

## Local learning policy

Begin with transparent rules. Distinguish hinted/repeated answers from independent first attempts. Avoid major skill changes from one response. Do not equate reading, time spent, or arbitrary clicks with mastery. Respect teacher assignment constraints.

Thresholds, evidence windows, diagnostic stopping rules, activity repetition, and teacher overrides must be specified and tested. They are not yet established educational measurements.

## Pack installation and updates

The manifest pins content, policy, and simulation versions and lists required assets and languages. Download verification checks completeness, compatibility, and integrity before marking a pack ready. Interrupted downloads are retryable. Keep a working version until its replacement is fully installed.

Include prerequisite support and several difficulty levels. When no suitable new activity remains, offer appropriate review and identify the next download. Do not imply offline generation exists.

## Attempt records and synchronisation

Record unique event ID, student/device/session references, local sequence, content and question revisions, language, response, hint use, attempt context, and policy version. Device timestamps are useful context but must not be the sole ordering authority across devices.

Persist events locally and upload through an outbox. Server ingestion deduplicates IDs, validates references and responses, and returns acknowledgements and reconciled progress. Preserve evidence from multiple devices instead of overwriting histories. Exact reconciliation and replay policy is an open decision.

Keep provisional local progress distinguishable from server-accepted progress. Show saved locally, pending sync, and synced states. Teacher views expose last-sync time and uncertainty; missing uploads do not prove inactivity.

## Reliability and access

- Verify offline reopening, app restart, interrupted downloads, duplicate uploads, and failed sync.
- Browser data can be cleared or evicted; storage visibility and recovery need product handling. Lost unsynced events cannot be recovered from the server.
- Separate shared-device student profiles and define offline identity/session behaviour.
- Enforce class access on the server, not just in the interface.
- Define retained evidence, deletion, export, and account recovery policies before deployment.
- Keep generation credentials on the backend.
- Offline answer keys and local events are not a guarantee of formal exam integrity.
- Specify update/revocation behaviour knowing offline clients cannot receive immediate changes.
