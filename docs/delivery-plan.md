# Delivery plan and open decisions

Working proposal · 30 October 2026. No implementation dates or effort estimates are committed.

## Build sequence

1. **Content contract and representative lesson:** agree on a skill map; manually author one lesson with examples, questions, hints, translations, and a simulation configuration. Define the schema around actual content.
2. **Playable local slice:** render that lesson, score supported responses, save attempts, and select activities with transparent rules.
3. **Teacher authoring and AI preparation:** intake source material, generate into the same schema, preview, edit, validate, review, and publish. Keep a manually reviewed fixture to distinguish generation failures from player failures.
4. **Complete chapter and offline packs:** fill agreed coverage, build downloadable versions, verify installation and offline restart behaviour.
5. **Classes and sync:** accounts, assignments, retry-safe upload, reconciliation, and teacher evidence views.
6. **End-to-end verification:** two student journeys, translations, accessibility, target devices, storage failures, publication corrections, and offline limitations.

## Acceptance scenarios

| Scenario | Required outcome |
| --- | --- |
| Teacher prepares a lesson | Source becomes an editable structured draft with traceable generated items |
| Teacher changes one activity | Selected regeneration preserves other approved material |
| Invalid generation | Invalid answers/references/objects cannot silently publish |
| Teacher publishes and assigns | Assignment references a fixed pack version |
| Interrupted download | Retry produces a verified complete pack; partial content is not marked ready |
| Student disconnects | Diagnostic, explanations, simulation, feedback, scoring, adaptation all work |
| Two student profiles | Same pack produces different reproducible paths based on evidence |
| Student struggles | App offers relevant prerequisite support and explains why |
| Offline app restart | Installed content and saved progress remain available |
| Language switch | Reviewed language variant changes while skill history is retained |
| Retry the same upload | Server counts each unique event once |
| Teacher checks progress | Dashboard distinguishes completion, skill evidence, and last sync |
| Student exhausts content | Clear boundary message and appropriate review options |
| Content update | Previously recorded answers retain their original revision context |

## Decisions required before implementation

| Question | Why it matters | Current position |
| --- | --- | --- |
| Curriculum, edition, chapter? | Defines outcomes and content correctness | Class 6 fractions is provisional |
| Target phones/browsers and shared devices? | Determines storage and identity design | Unresolved |
| Teacher preparation connectivity? | Required for proposed AI workflow | Explicit assumption to validate |
| Who authors and reviews? | Determines approval and language review capacity | Project team for initial content; reviewers unassigned |
| Accepted source formats and rights? | Determines extraction and redistribution | Pasted text/approved material first; uploads undecided |
| Pack size and activity coverage? | Bounds generation, review, and downloads | Set after representative lesson/device testing |
| Skill evidence and recommendation policy? | Determines adaptation behaviour | Transparent rules; thresholds unchosen |
| Multi-device reconciliation? | Determines accepted combined progress | Preserve events; exact policy unchosen |
| Student choice and teacher overrides? | Determines navigation and assignments | Must be explicit |
| AI provider, budget, retention? | Determines worker and operational controls | Unselected |
| Account/privacy/recovery policies? | Determines school deployment readiness | Must be defined before deployment |

## Demonstration script

Teacher supplies a lesson, reviews the generated adaptations, publishes a pack, and assigns it. Two simulated students download the same pack. Disconnect both: one advances, while the other receives prerequisite support. Restart one student app to show persistence. Reconnect and retry an upload to show safe sync. The teacher sees different skill evidence and requests a reviewed supplementary pack.

## Completion boundary

The first version is complete when this teacher-to-student-to-teacher loop works for one complete chapter in the required languages, with the acceptance scenarios verified. Broad curriculum coverage and a production school rollout require further content, device, operational, and privacy work.
