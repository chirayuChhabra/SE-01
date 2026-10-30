# AI preparation pipeline

Working proposal · 30 October 2026. Provider, model, prompts, budgets, and execution framework remain undecided.

## Purpose

Turn teacher-provided source material into a bounded, reviewable collection of adaptive activities. Generation occurs online before student use. The downloaded result runs without AI access.

The first chapter uses an agreed skill map and supported activity types. AI proposes mappings and content within that structure; it does not silently invent the curriculum.

## Inputs

- Source lesson or approved chapter material, with redistribution permission.
- Curriculum, grade, objectives, approved skill catalogue.
- Required languages and supported activity/simulation types.
- Teacher instructions and coverage targets.
- Explicit limits on generated items, media size, job cost, and retries.

Start with pasted text and existing structured material. Exact upload formats and document extraction/OCR support must be selected before implementation. Extracted source text must be previewable so extraction errors do not silently become teaching material.

## Stages or AI skills

| Stage | Output | Checks |
| --- | --- | --- |
| Source preparation | Extracted, attributable source sections | Missing pages/text, unsupported format, source boundaries |
| Curriculum mapping | Proposed skills and prerequisites | Approved IDs, coverage, prerequisite cycles |
| Coverage planning | Required activities by skill and purpose | Bounded counts, support and extension coverage |
| Lesson adaptation | Explanations and worked examples | Source support, instructional fit, structure |
| Assessment generation | Questions, answers, hints, feedback | Answer validation, duplicates, supported response types |
| Simulation configuration | Settings for approved templates | Configuration schema, supported tasks |
| Language adaptation | Punjabi/Hindi/English variants | Stable skill links, preserved meaning, review status |
| Quality checks | Findings and unresolved issues | Deterministic checks plus AI-assisted review |
| Teacher review | Edited and approved content | Required approvals and unresolved blockers |
| Pack assembly | Immutable downloadable version | Complete dependencies, hashes, compatibility |

These are bounded tasks with contracts. They may be sequential stages in one job; independent autonomous agents are not required. Uploaded material is source data, not permission to override system instructions or execute code.

## Structured outputs

Each stage produces schema-validated objects with stable references and provenance. Record source references, generation configuration, model/prompt version, edits, and review decisions. Avoid sending student-identifying records to generation jobs when aggregate skill gaps suffice.

AI must not publish directly. Invalid objects remain drafts. Arithmetic and supported answer rules receive deterministic checks where feasible; educational correctness and translation quality still require review.

## Teacher review experience

Show the skill map, planned sequence, activity groups, answer keys, language variants, coverage gaps, and sample student journeys. Flag items needing attention without implying unflagged items are automatically correct.

Teachers can edit or regenerate selected material. Regeneration creates a draft revision and preserves accepted content. Publishing freezes the reviewed output.

## Bulk generation without uncontrolled growth

Generate shared pools by skill, difficulty, and teaching purpose. Do not produce one full course per student, every possible route, or unlimited question variants. Coverage limits and pack-size budgets must be configured before jobs run.

Track queued/running/needs-review/failed/completed states. Save completed stages, bound retries, expose useful failures, and allow cancellation. Retrying a job must not duplicate published content. Exact caching, concurrency, and cost limits are implementation decisions.

## Follow-up cycle

After sync, the teacher may request supplementary material for shared gaps. Aggregate evidence informs a new generation job. The supplement goes through the same validation, review, publication, and download process. It cannot appear on an offline device until a later transfer.
