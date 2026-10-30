# Content and authoring

Working proposal · 30 October 2026. Field lists below are design requirements, not a final machine-readable schema.

## Content model

Curriculum → subject → course/grade → chapter → lessons → activities.

A separate skill map connects learning objectives and prerequisites. A lesson may teach several skills; a skill may appear in several lessons. Content order and prerequisite relationships are different concepts.

Example: an equivalent-fractions lesson teaches recognition of equal quantities. It includes an explanation, worked example, fraction-strip task, practice, and exit check. Understanding equal parts is a prerequisite.

| Object | Required information |
| --- | --- |
| Skill | Stable ID, description, curriculum mapping, prerequisite IDs |
| Lesson | Stable ID, title, objectives, skills, language variants, ordered activities |
| Question | Stable ID, prompt, response type, skills, answer rules, hints, feedback |
| Simulation activity | Template ID/version, configuration, objective, task, assessment |
| Asset | Reference, media type, size, hash, relevant accessibility description |
| Published revision | Immutable version, author, review state, source/licence, compatibility |
| Pack | Manifest, exact content versions, languages, assets, dependencies, total size |

Difficulty and misconception tags are author estimates until evaluated. Stable skill IDs persist across translations. Attempts reference the actual question revision and language variant used.

## Teacher workflow

Teachers can assign published content, duplicate and customise it, or create from a template. AI preparation is the primary shortcut, while direct editing remains available.

1. Select curriculum, grade, chapter, objectives, and languages.
2. Provide source material and optional instructions.
3. Confirm the proposed skill mapping.
4. Generate and inspect activities.
5. Edit, reorder, remove, duplicate, or regenerate selected items.
6. Preview student journeys and inspect answer keys.
7. Resolve validation and review issues.
8. Publish an immutable revision and assign it.

The interface must not require teachers to write code or JSON. Draft saving, preview, validation messages, and selective regeneration are first-version requirements. Simultaneous collaborative editing is deferred.

## Initial editor blocks

- Explanation: formatted text, maths, optional image.
- Worked example: problem, solution steps, explanation.
- Question: supported response type, answer rule, feedback.
- Hint: staged support associated with a question.
- Simulation: an approved template with editable settings.
- Reflection: ungraded prompt or saved response.
- Section/checkpoint: activity grouping and navigation.

Required content must be packaged locally. External links can supplement a lesson but cannot be essential to completing it offline. Audio/video support depends on a later pack-size budget.

## Assessment rules

Start with single-choice, multiple-choice, and numeric/fraction responses. Explicit answer rules govern equivalence, simplification, units, tolerances, and multiple-choice scoring where applicable.

For example, `2/4` satisfies “give a fraction equivalent to one-half” but does not satisfy “give one-half in simplest form.” Answer correctness and representation requirements must be distinguishable.

Practice permits hints and retries. Diagnostics gather starting evidence. Chapter assessments use a defined selection and scoring policy. Completion is separate from understanding; reading and arbitrary simulation clicks do not establish mastery. Open-ended responses may be stored, but remain ungraded until an appropriate review method exists.

## Simulations

Developers build and verify simulation mechanics. Teachers and AI configure approved templates. The first template is fraction strips with configurable denominators, starting values, labels, instructions, hints, and a task/check.

The runtime contract covers configuration validation, load, state save/restore, and assessable task responses. Template versions are pinned in packs. Unrestricted AI-generated executable code is outside initial scope.

## Customisation boundaries

| Role | Editable scope |
| --- | --- |
| Teacher | Examples, ordering, question selection, language wording, assignments |
| Author/reviewer | Skill mappings, lessons, translations, publication approval |
| Student | Language, supported accessibility preferences, allowed activity choice |
| Administrator | Accounts, classes, access, available courses |
| Platform team | Schema, scoring implementations, learning policy, simulation code |

Teacher copies do not alter another class's published lesson. Changes to what an activity measures require review of its skill mapping. Approved drafts must not be overwritten by regeneration without an explicit edit action.

## Review and publication

Lifecycle: draft → review → published → retired. Revisions preserve sources, licences, generated provenance, edits, and review decisions. Faulty content needs a correction/withdrawal process; already-offline devices cannot receive withdrawals until reconnecting.

Review checks: objective clarity, curriculum fit, correctness, answer keys, feedback quality, prerequisite coverage, translations, accessibility, and offline dependencies. A second AI review is supporting evidence, not proof of correctness.

## Standards

Choose a curriculum board, edition, and outcomes before producing the full chapter. The brief's grade range does not define a curriculum.

Target [WCAG 2.2 AA](https://www.w3.org/TR/wcag/) with keyboard access, contrast, accessible labels, meaningful image alternatives, and accessible interaction alternatives. This is a target to verify, not a current conformance claim.

Potential interoperability adapters:

- [QTI](https://www.1edtech.org/standards/qti/index): questions, tests, and assessment results.
- [Common Cartridge](https://www.1edtech.org/standards/cc): exchange of packaged learning materials.
- [xAPI](https://github.com/adlnet/xAPI-Spec): exchange of learning-activity records.

Use an explicit internal schema first. No interoperability certification or full compatibility is implied. Implement an adapter when a real integration requires it.
