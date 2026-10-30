# SE-01 — Detailed implementation checklist

Proposed roadmap · 30 October 2026 · Quiz module implemented; other components remain planned.

Implementation reference: [quiz engine](quiz-engine.md). It supplies question validation, seven scorers, fixed-order practice/diagnostic/assessment sessions, and an adapter for persisted evidence. Stage 2 still needs subject review and integration; this does not complete the broader content contract or student player.

This is our execution checklist: what to build, in which order, which features belong to each engine, and how we know a stage is finished. Use the [architecture](architecture.md), [content requirements](content-and-authoring.md), and [AI pipeline](ai-preparation.md) for deeper specifications.

## 1. The target

**Ship one complete chapter that a teacher can prepare, review, publish, and assign, and that students can download, learn from, and adapt through offline. Progress reaches the teacher when students reconnect.**

Use Class 6 fractions as the working chapter until we confirm the curriculum and edition. The first version includes Punjabi, Hindi, and English, a fraction-strip simulation, and two reproducible student journeys through the same pack.

Our first milestone is smaller: **one manually reviewed lesson that can be played, scored, saved, and adapted through offline.** Prove that before building the full AI pipeline or expanding the chapter.

## 2. Which engine comes first?

**Build the content contract and validator first, then the scoring engine, then the local learning loop.** Adaptation needs reliable evidence; AI needs a proven format to generate into.

| Order | Build | Depends on | Completion gate |
| --- | --- | --- | --- |
| 0 | Scope decisions and device experiment | Team agreement | Target device reopens a tiny app and retains saved responses offline |
| 1 | Content contract + validator | Representative lesson and skill map | Reviewed fixture validates; broken content fails clearly |
| 2 | Assessment/scoring engine | Question and evidence contracts | Supported answers score correctly, including fraction rules |
| 3 | Local storage + basic student player | Content contract and scorer | Answer, close, reopen offline, and resume |
| 4 | Adaptive learning engine | Scored evidence and skill graph | Two students receive different, explainable paths offline |
| 5 | Simulation runtime + chapter coverage | Activity/scoring contracts | Fraction task works offline; chapter coverage is reviewed |
| 6 | Content Studio + AI preparation | Proven local loop and validated content format | Teacher generates, edits, reviews, and publishes |
| 7 | Pack builder + download/update manager | Published revisions and compatible runtime | Interrupted installation/update preserves the working pack |
| 8 | Identity/classes + sync engine + teacher workspace | Event contract and distributable packs | Assignment downloads; retried uploads count once; teacher sees evidence |
| 9 | Release verification | Complete integrated system | One chapter passes the full journey in three languages |

These are dependency stages, not separate services or mandatory one-person tasks. Start with one repository and clear module boundaries. Do not build a separate online recommendation engine: the same local engine operates with or without connectivity.

## 3. Team responsibilities

Assign a named owner and reviewer for each lane. These are responsibilities, not a required team size; one person can own several lanes.

| Lane | Owns | First task |
| --- | --- | --- |
| Content and learning | Curriculum, skill graph, reviewed questions, translations, policy examples | Write the representative lesson and expected journeys |
| Student app and offline | Player, persistence, downloads, simulation integration | Run the target-device offline experiment |
| Core engines | Schema/validator, scorer, adaptation, journey fixtures | Define contracts around the representative lesson |
| Backend and authoring | Studio, generation worker, publication, accounts, sync, teacher reports | Prepare fixtures against agreed contracts |

With fewer people, combine lanes according to skills and availability. Keep a reviewer for shared contracts and educational correctness. At each gate, the owner demonstrates the working result and the reviewer checks it before the stage is marked complete.

## 4. Stage-by-stage checklist

### Stage 0 — Scope and platform proof

- [ ] Confirm curriculum board, edition, chapter, and rights to use/translate/distribute source material.
- [ ] List target devices/browsers and whether students share devices.
- [ ] Confirm teachers have internet for preparation and publication.
- [ ] Test the proposed PWA approach on a target device: cache a tiny app/lesson, disconnect, reopen, save a response, and reopen again.
- [ ] Choose the stack and storage after this experiment. Resolve platform limitations before building the full player.
- [ ] Set initial pack-size/storage budgets from device constraints; revisit after chapter coverage is known.
- [ ] Assign owners, reviewers, and decision deadlines.

**Deliverable:** recorded scope/stack decisions and a working offline proof.

### Stage 1 — Content contract and validation engine

Author one real lesson alongside the schema so the contract reflects inspectable learning content.

- [ ] Define stable IDs/revisions for skills, lessons, activities, questions, simulations, and assets.
- [ ] Define skill prerequisites; reject missing references and cycles.
- [ ] Support explanations, worked examples, questions, hints, simulations, reflections, and checkpoints.
- [ ] Define answer rules, feedback, skill mappings, language variants, and difficulty/purpose tags.
- [ ] Define the pack manifest: exact revisions, languages, assets, policy version, and simulation versions.
- [ ] Record source/licence, provenance, and review status.
- [ ] Return validation errors that identify the object and field to fix.
- [ ] Create a manually reviewed lesson fixture with prerequisite support, standard practice, extension, and sample translations.

**Input → output:** content objects → validated objects or actionable errors.

**Done when:** the fixture passes; invalid answers, missing assets, broken skill references, and unsupported simulation configurations fail. Structural validity does not replace subject/language review. Keep this fixture for all later integration work.

### Stage 2 — Assessment and scoring engine

- [ ] Score single-choice and multiple-choice questions with an explicit partial-credit policy.
- [ ] Evaluate numeric/fraction answers, equivalent values, and simplest-form requirements.
- [ ] Define tolerance/unit rules where relevant; reject unsupported answer rules.
- [ ] Distinguish practice, diagnostic, and chapter-assessment contexts.
- [ ] Record hint use and retries; distinguish correctness from independent evidence.
- [ ] Return feedback and structured evidence for adaptation.
- [ ] Store reflections separately as ungraded responses.
- [ ] Define chapter-assessment question selection and scoring.

**Input → output:** question revision + response + context → score, feedback, and evidence.

**Done when:** a reviewed answer table passes, including `2/4` accepted for equivalence to `1/2`, rejected when simplest form is required, invalid fractions, wrong selections, and hinted/repeated attempts.

### Stage 3 — Local storage and basic student player

- [ ] Render explanations, examples, questions, hints, and feedback from the fixture.
- [ ] Switch language while retaining stable skill history.
- [ ] Persist installed content, student-scoped attempts, session position, and learning state.
- [ ] Give events unique IDs, student/device/session references, local sequence, content/question revisions, language, and policy version.
- [ ] Save evidence before showing “saved”; expose write failures without silently losing the response.
- [ ] Maintain an upload outbox even before the sync endpoint exists.
- [ ] Cache the app shell and required lesson resources for offline reopening.
- [ ] Add local test profiles for the two journeys; design storage namespaces for later real identity.

**Done when:** a student answers, closes the app, reopens disconnected, and resumes with the same evidence. Failed writes do not claim success. Completion is recorded separately from mastery.

### Stage 4 — Adaptive learning engine

Keep this engine independent of UI, networking, and AI. Begin with transparent, versioned rules.

- [ ] Create provisional per-skill estimates from the diagnostic.
- [ ] Update estimates from scored evidence with explicit hint/retry handling.
- [ ] Define thresholds, evidence windows, and diagnostic stopping rules; require multiple pieces of evidence before major changes.
- [ ] Check prerequisites and select targeted support when evidence indicates a gap.
- [ ] Choose among available explanations, simulation tasks, practice, review, and extension.
- [ ] Respect assignments and the agreed student-choice/teacher-override policy.
- [ ] Return a plain-language reason for recommendations.
- [ ] Handle uncertainty, repetition, and exhausted activity pools.
- [ ] At a pack boundary, offer appropriate review and identify the next download.

**Input → output:** skill graph + evidence + available activities + constraints + policy version → skill estimates, next activity, and reason.

**Done when:** scripted Student A advances after demonstrating understanding; Student B receives prerequisite support and can later advance. Identical ordered evidence and versions produce identical results. Both paths work offline. Thresholds remain prototype choices, not validated educational measurements.

**Milestone A: a working offline adaptive lesson.** Review this before full AI authoring begins.

### Stage 5 — Simulation runtime and complete chapter

- [ ] Build one fraction-strip template with bounded configuration.
- [ ] Support configured denominators, starting values, labels, instructions, hints, and task/check.
- [ ] Validate configuration, pin template versions, and save/restore simulation state.
- [ ] Send assessable task responses through the scorer; arbitrary clicks do not award mastery.
- [ ] Provide keyboard/touch operation and an accessible alternative for the learning task.
- [ ] Build a coverage matrix: each agreed chapter skill needs diagnostic evidence, teaching, practice, assessment, and relevant prerequisite/extension support.
- [ ] Complete subject review and Punjabi/Hindi/English review with shared skill IDs.

**Done when:** the simulation task works and resumes offline, and the chapter coverage matrix has no unexplained gaps. Start chapter writing and language review earlier in parallel; this is their completion gate.

### Stage 6 — Content Studio and AI preparation engine

Build manual editing, saving, and preview first. Connect AI to the same validated draft objects afterward.

- [ ] Accept approved pasted source text, chapter context, objectives, and languages.
- [ ] Let the teacher confirm mappings to approved skills.
- [ ] Generate bounded coverage plans, explanations, examples, questions, hints, feedback, translations, and approved simulation configurations.
- [ ] Save stage outputs and show queued/running/needs-review/failed/completed states.
- [ ] Set item, cost, retry, and concurrency limits before enabling generation.
- [ ] Validate structured output and check supported answers deterministically where feasible.
- [ ] Keep credentials on the backend; treat submitted material as source data.
- [ ] Edit, reorder, remove, duplicate, preview, and selectively regenerate without overwriting approved material.
- [ ] Record provenance/review decisions and block publication with unresolved validation/review requirements.
- [ ] Publish immutable revisions and retain the manual fixture to isolate player failures from generation failures.

**Input → output:** approved source + skill map + limits → editable drafts → human-reviewed published revisions.

**Done when:** a teacher works without code/JSON, recovers from a generation failure, regenerates one item while preserving others, and publishes only valid reviewed content. Distribution follows in Stage 7.

### Stage 7 — Pack builder and download/update manager

- [ ] Assemble published revisions, multiple learning levels, prerequisite support, required languages/assets, and compatible policy/simulation versions.
- [ ] Generate manifests with exact dependencies, sizes, and integrity hashes.
- [ ] Reject missing dependencies, required external resources, and incompatible versions.
- [ ] Show download size, progress, retries, readiness, and installed version.
- [ ] Verify every required file before marking a pack ready.
- [ ] Retain a working pack until its replacement is completely installed; avoid mixed revisions.
- [ ] Preserve the original question context needed to interpret recorded attempts.
- [ ] Explain storage failures/recovery; never silently delete unsynced evidence.

**Done when:** a published pack installs, runs disconnected, survives restart, and safely retries an interrupted download/update. Essential learning activities make no network requests.

**Milestone B: a teacher-published complete chapter installs and works offline.**

### Stage 8 — Identity/classes, sync engine, and teacher workspace

Sub-order: **identity/access → classes/assignments → ingestion/reconciliation → evidence reports.** Draft interfaces earlier, but derive dashboard progress from the same accepted evidence.

- [ ] Implement roles, class membership, server-enforced access, and assignments pinned to pack versions.
- [ ] Define shared-device login, offline session, logout, and profile isolation.
- [ ] Upload outbox events in batches; acknowledge IDs and retry safely.
- [ ] Validate identity, revisions, responses, and scoring rules on the server.
- [ ] Derive accepted progress from validated evidence rather than client-supplied mastery.
- [ ] Specify and implement deterministic multi-device reconciliation, preserving event histories without relying solely on device clocks.
- [ ] Distinguish provisional local progress from server-accepted progress; avoid applying evidence twice.
- [ ] Show saved locally, pending sync, synced, and useful recovery states.
- [ ] Show completion, skill evidence, students needing support, and last-sync time to teachers.
- [ ] Assign follow-up packs through the existing preparation/publication flow.
- [ ] Define evidence retention, deletion/export, recovery, and minimum student data before deployment.

**Done when:** duplicate uploads count once, failed sync resumes, rejected events are handled visibly, valid evidence from two devices is preserved, and the teacher sees reconciled results. Verify student/class access and local profile separation.

**Milestone C: the full teacher → student → teacher loop works.**

### Stage 9 — Release verification and demonstration

- [ ] Teacher supplies a lesson, reviews, publishes, assigns, and a student downloads it.
- [ ] Two disconnected students follow different paths through the same pack.
- [ ] Show prerequisite recovery, advancement, and honest pack-boundary handling.
- [ ] Restart offline; preserve lesson, simulation, and evidence state.
- [ ] Switch among three reviewed languages without resetting history.
- [ ] Reconnect and retry an upload; teacher evidence has no duplicate attempts.
- [ ] Exercise interrupted downloads/updates, failed writes, storage pressure, and failed sync on target devices.
- [ ] Check keyboard/touch use, readable text, labels, contrast, and simulation alternatives.
- [ ] Correct a published question with a new revision; old attempts retain their interpretation.
- [ ] Document device support, storage limitations, setup, and unresolved issues.
- [ ] Prepare resettable demo data and two scripted journeys.

**First-version completion:** one complete reviewed chapter, all three languages, and the full loop pass these checks and the [delivery acceptance scenarios](delivery-plan.md#acceptance-scenarios). A school production rollout needs further operational/privacy readiness work.

## 5. Work we can do in parallel

| After this dependency | Parallel work | Integration checkpoint |
| --- | --- | --- |
| Agreed chapter and sample lesson | Device experiment; skill map; source/translation review | Confirm platform and initial contracts |
| Content/evidence contracts | Scorer; player/storage; chapter writing; Studio designs | Render and score the same fixture |
| Scorer and persisted events | Adaptation; simulation; reviewed coverage | Demonstrate both local journeys |
| Proven local loop | Studio/AI; pack assembly; backend identity foundations | Install a teacher-published pack |
| Assignment/sync contracts | Client outbox; server ingestion; teacher evidence view | Reconcile a real offline session |

Agree on shared fixtures and interfaces before splitting work. Schema/policy changes need versions and explicit compatibility decisions for installed packs and saved evidence.

## 6. Decisions before dependent work starts

Suggested decision-record location: `docs/decisions/`. Record the owner, choice, reason, and effect on existing data.

| Decision | Deadline | Starting position |
| --- | --- | --- |
| Curriculum, edition, source rights | Stage 0 | Class 6 fractions is provisional |
| Devices, shared use, stack/storage | Stage 0 | Test a PWA on actual target devices |
| Answer rules and partial credit | Before Stage 2 | Explicit per-question rules and reviewed fixtures |
| Thresholds, evidence windows, diagnostic stopping, repetition | Before Stage 4 | Simple versioned policy agreed with content reviewer |
| Student choice and teacher overrides | Before Stage 4 | Define allowed navigation/constraints explicitly |
| Subject and language reviewers | Before full chapter production | Named reviewer for correctness and each language |
| AI provider, budgets, retention | Before generation in Stage 6 | Bounded jobs and human review |
| Pack budgets and supported versions | Before Stage 7 | Measured target-device constraints |
| Offline identity and multi-device reconciliation | Before Stage 8 | Student-scoped storage; preserve evidence; deterministic merge/replay |
| Retention, access, recovery, correction/withdrawal | Before deployment | Explicit policies, including delayed updates to offline devices |

## 7. Scope boundaries

Defer expansion to all classes 6–10, live classes, social features, subscriptions, unrestricted simulation authoring/generated code, open-ended automatic grading, interoperability adapters without a concrete integration, and high-stakes exam security.

Online AI prepares material. Offline learning selects from installed reviewed material. No student answer should require an LLM call.

## 8. First team work session

1. Confirm chapter, devices, source material, owners, and reviewers.
2. Write one equivalent-fractions lesson with prerequisite support and extension.
3. Sketch the skill map and two expected student journeys.
4. Run the tiny offline storage/reopen experiment on a target device.
5. Define initial content/evidence contracts; turn Stage 1–3 deliverables into team tasks.
6. Set a review date for **Milestone A: the offline adaptive lesson** using actual team availability. Estimate later stages after that slice reveals implementation and review effort.
