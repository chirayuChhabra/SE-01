# Product plan

Working proposal · 30 October 2026 · No application has been implemented yet.

## The product in one sentence

A teacher provides an ordinary lesson; online AI prepares a reviewed adaptive learning pack; students download it and keep learning and adapting offline.

## What the challenge requires

The supplied challenge brief asks for a short diagnostic and skill map, practice that adapts to answers, full offline learning with later progress sync, Punjabi/Hindi/English support, and a teacher view of concept-level difficulties. The demonstration must cover at least one complete chapter and two simulated students taking different paths. The broader subject scope is maths and science for classes 6–10.

Teacher-side AI preparation is our proposed way to produce the content. It is not an explicit challenge requirement.

## Connectivity assumption

Students may lack continuous internet. We assume teachers can connect while preparing and publishing lessons; the brief does not guarantee teacher connectivity. Students still need an initial opportunity to download their packs and later opportunities to sync. A teacher need not remain online during student learning.

## Three workspaces

| Workspace | User actions | Connectivity in the first version |
| --- | --- | --- |
| Content Studio | Submit a lesson, generate adaptations, review, edit, publish | Online |
| Student App | Download, diagnose, learn, practise, assess, view progress | Initial download online; learning offline; later sync |
| Teacher Workspace | Manage classes, assign packs, inspect evidence, assign support | Online |

Administration provides accounts, roles, and access controls. One person may be both teacher and content reviewer.

## Proposed platform

Begin with a responsive, installable web app (PWA) and a backend. Test download, storage, restart, and sync behaviour on actual target phones before committing to deployment. A dedicated Android app remains an option if device testing demonstrates a need. SaaS subscriptions and pricing are outside the current product decision.

## End-to-end journey

1. Teacher selects approved chapter material, pastes a lesson, or uploads a supported document.
2. Teacher specifies curriculum, grade, objectives, and required languages.
3. AI proposes a skill mapping and prepares explanations, examples, questions, hints, translations, and supported simulation settings.
4. Software checks structure and supported answers; teacher reviews and edits the draft.
5. Publishing freezes a content version and builds a complete offline pack.
6. Teacher assigns the pack to a class; students download and verify it.
7. Students take a local diagnostic and follow locally selected activities.
8. Attempts and progress are saved on the device, including across restarts.
9. On reconnection, events sync and accepted progress reaches the teacher dashboard.
10. Teacher uses learning gaps to request, review, and assign supplementary material.

## Personalisation model

Generate a reusable pool of learning activities covering several levels and prerequisites. Each student follows a different path through that pool. Do not generate a separate full chapter for every student or try to enumerate every possible journey.

Online AI prepares options. A transparent local learning engine selects among downloaded options using evidence and versioned rules. It does not require an LLM or internet for each answer. Exhausting the available material must lead to an honest pack-boundary message and appropriate review options.

## Initial scope

- One complete chapter, provisionally Class 6 fractions; exact curriculum remains open.
- Teacher lesson intake, bounded AI generation, editing, review, and publication.
- Approved skill map; diagnostic, explanations, worked examples, hints, practice, and chapter assessment.
- Single-choice, multiple-choice, and numeric/fraction answers.
- One configurable fraction-strip simulation.
- Punjabi, Hindi, and English content and feedback.
- Offline download, learning, persistence, and retry-safe sync.
- Classes, assignments, and evidence-based teacher reporting.
- Two reproducible student journeys through the same pack.

Defer broad curriculum coverage, arbitrary generated simulation code, general-purpose simulation authoring, live classes, social features, subscriptions, open-ended automatic grading, and high-stakes exam integrity.

## Reading guide

- [Content and authoring](content-and-authoring.md): lesson structure, teacher controls, standards, and review.
- [AI preparation](ai-preparation.md): generation stages, validation, costs, and publication.
- [Architecture](architecture.md): modules, boundaries, data, offline behaviour, and sync.
- [Delivery plan](delivery-plan.md): implementation order, acceptance scenarios, and unresolved decisions.
