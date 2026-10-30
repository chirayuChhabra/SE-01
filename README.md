# SE-01 — Offline Adaptive Learning LMS

Working concept and proposed product direction · 30 October 2026

## Current direction and documentation

**A teacher provides an ordinary lesson. Online AI prepares adaptive material for review. Students download the published pack, learn and adapt offline, then sync progress when connected.**

We assume teachers can access internet during preparation; the challenge brief does not guarantee this. The proposed first platform is a responsive, installable web app, subject to target-device testing. No application has been implemented yet.

Read the detailed proposals in this order:

1. [Product plan](docs/product-plan.md) — experiences, lifecycle, connectivity, and scope.
2. [Content and authoring](docs/content-and-authoring.md) — lessons, customisation, assessment, simulations, and standards.
3. [AI preparation pipeline](docs/ai-preparation.md) — generation stages, validation, review, and bulk-generation limits.
4. [Architecture](docs/architecture.md) — components, contracts, offline storage, and sync.
5. [Delivery plan](docs/delivery-plan.md) — build sequence, acceptance scenarios, and open decisions.

## The problem we want to solve

Students in the same classroom can have very different learning needs. A common lesson sequence may move too quickly for one student and too slowly for another. Students with unreliable internet also need to continue learning between connections.

Our working hypothesis is that an LMS can provide access to lessons and track completion without necessarily understanding what a student needs next. Making that LMS available offline solves an access problem, but does not by itself solve the personalisation problem.

We want to combine both: **an LMS that works offline and adjusts the student's next learning activity as their understanding changes.**

The limitations below are questions to investigate in existing systems, not claims that every current LMS has them.

## Questions about current systems — and our proposed answers

### 1. Is access to the same content enough?

**Issue to investigate:** Students may receive the same chapter and sequence regardless of what they already understand.

**Our answer:** Start with a short diagnostic, estimate their understanding of individual skills, and recommend an appropriate starting activity. Continue adjusting that recommendation as they practise.

### 2. Does a single score tell us what a student needs?

**Issue to investigate:** Two students with the same total score may have different knowledge gaps. A broad label such as beginner or intermediate can hide those differences.

**Our answer:** Show a simple overall level, but maintain a skill profile underneath it. For example, track understanding of equivalent fractions separately from fraction addition. Use the skill profile to select material.

### 3. Does harder or easier mean personalised?

**Issue to investigate:** Increasing difficulty after a correct answer and lowering it after a wrong answer may miss the reason a student is struggling.

**Our answer:** Connect skills through prerequisites. When evidence suggests a missing prerequisite, offer a short explanation and targeted practice before returning to the original topic. Avoid making major changes based on a single answer.

### 4. Can learning keep adapting without internet?

**Issue to investigate:** An app might allow downloaded lessons to be read offline while still needing a server to choose questions, assess answers, or recommend the next lesson.

**Our answer:** Download a complete chapter pack containing content, questions, explanations, simulations, skill relationships, and adaptation rules. Run the learning and recommendation loop on the device.

### 5. What happens when a student outgrows their downloaded level?

**Issue to investigate:** Downloading only material for the student's initial score can leave them without suitable content after they improve—or after a deeper gap appears.

**Our answer:** Include several levels and relevant prerequisite material in each chapter pack. The initial score chooses the starting point; it does not limit what is available offline. If the student reaches the pack's boundary, clearly identify the next pack to download when connected.

### 6. Do we need AI to personalise every lesson?

**Issue to investigate:** Requiring an LLM for every recommendation would make offline learning dependent on connectivity and introduce content quality concerns.

**Our answer:** Use online AI during teacher preparation to produce explanations, questions, hints, translations, and supported simulation settings. Validate and review this material before publishing a fixed pack. A transparent local engine selects downloaded activities; the student's offline learning loop does not call AI.

### 7. Does completing a lesson mean understanding it?

**Issue to investigate:** Opening a page, watching a video, or spending time in an activity does not establish mastery.

**Our answer:** Record completion separately from understanding. Use quizzes, practice, and purposeful simulation tasks as evidence of learning. Reading a lesson alone should not raise a student's mastery level.

### 8. What role should simulations play?

**Issue to investigate:** An interactive simulation can be engaging without revealing whether the student understood the concept.

**Our answer:** Give simulations a learning objective and a task, then follow them with a short check. Use assessable responses as evidence; avoid interpreting arbitrary clicks as understanding.

### 9. Can teachers act on the information they receive?

**Issue to investigate:** Total scores and completion percentages may not explain where to intervene.

**Our answer:** Show which students are struggling with which skills, the evidence behind that assessment, and suggested practice groups. Make the last sync time visible so teachers know how current the information is.

### 10. What happens to progress while the student is offline?

**Issue to investigate:** Lost attempts, duplicate uploads, or conflicting updates can make progress unreliable.

**Our answer:** Save learning events locally before showing them as saved. Give events unique identifiers, queue them for upload, and make sync safe to retry. Keep content versions with attempts so the backend can interpret results correctly. Reconcile progress using an explicit policy rather than blindly overwriting one device's state with another's.

### 11. Can offline progress be tamper resistant?

**Issue to investigate:** Students may edit local records or attempt to award themselves marks.

**Our answer:** Treat tamper resistance as a design requirement, not a guarantee. Use platform-protected storage where available, integrity checks, and server-side validation of uploaded attempts. The backend should derive accepted progress from validated evidence instead of trusting a client-supplied level. A student-controlled offline device cannot guarantee formal exam integrity; high-stakes assessments need a separate design.

### 12. Does personalisation work in the student's language?

**Issue to investigate:** Translating navigation alone leaves learning content, feedback, and explanations inaccessible.

**Our answer:** Include Punjabi, Hindi, and English lesson content, questions, and feedback in the available language packs. Preserve skill identifiers across languages so switching language does not reset progress. Review translations for mathematical and scientific meaning.

## What we can make

An offline-capable LMS with three connected experiences:

- **Student experience:** Download chapters, take a diagnostic, learn through lessons and simulations, practise, take quizzes or tests, and receive an evolving learning path.
- **Content Studio:** Provide a lesson, generate adaptations, edit and review drafts, and publish an offline pack.
- **Teacher experience:** Manage classes and assignments, review synced skill profiles, identify shared learning gaps, and prepare follow-up material.

The first connection provisions the learning pack. From then on, the student can learn and adapt within that pack without a connection. Later connections upload progress and download content updates or additional packs.

## The learning loop

1. **Connect and prepare:** Set up the student profile, choose a language, and download a chapter pack. The diagnostic can run locally once its questions are available.
2. **Find a starting point:** Use a short diagnostic to estimate skill levels. Treat uncertain estimates as provisional.
3. **Recommend an activity:** Choose a lesson, simulation task, or practice set using the skill profile and prerequisites.
4. **Learn offline:** Make explanations, feedback, and relevant material available on the device.
5. **Gather evidence:** Record answers, hints used, and repeated mistakes. Use response time cautiously; it can reflect interruptions or reading needs.
6. **Update the path:** Adjust skill estimates and choose the next activity. Explain significant recommendations in simple terms.
7. **Save locally:** Persist attempts and progress while offline.
8. **Sync when connected:** Upload queued events, reconcile accepted progress, and fetch available pack updates.

## Example: two students, one chapter

**Student A** understands equivalent fractions and performs well on the diagnostic. The app starts them with fraction addition, then offers more challenging applications when practice confirms understanding.

**Student B** struggles with equivalent fractions. The app recommends a visual explanation, a fraction simulation task, and targeted practice. Once there is enough evidence of understanding, it introduces fraction addition and checks that the prerequisite transfers.

Both students use the same downloaded chapter pack. Their starting points and subsequent activities differ, and those changes continue offline.

## First version

Use **one complete chapter, provisionally Class 6 fractions**, to prove the full loop before expanding to maths and science across classes 6–10.

Include:

- A small skill map with explicit prerequisites.
- A short diagnostic and a visible skill profile.
- Teacher lesson intake and bounded AI preparation, with editing, review, and publication.
- Reviewed, packaged material across multiple levels.
- At least one purposeful interactive simulation.
- Adaptive practice, quizzes, and a chapter assessment.
- Local progress storage and retry-safe synchronisation.
- Punjabi, Hindi, and English support for the selected chapter.
- A teacher view that identifies students needing help with particular concepts.
- Two reproducible simulated student journeys demonstrating different paths.

Defer broad curriculum coverage, live classes, social features, unrestricted AI-generated simulation code, unreviewed automatic publication, and high-stakes exam security until the core learning loop works.

## What would make the demo convincing?

- Show a teacher providing a lesson, reviewing AI-generated adaptations, and publishing and assigning a pack.
- After downloading the pack, disconnect the device and complete a learning session.
- Show two students receiving different activities because of different skill evidence.
- Show a struggling student receiving prerequisite support and later progressing.
- Restart the app while offline and show that saved progress remains available.
- Reconnect and show progress reaching the teacher view without duplicate attempts.
- Show why the app recommended a particular activity, rather than only displaying a level change.

## Decisions still to make

- Which curriculum and chapter should define the first skill map?
- Is the target device a shared school device, a personal phone, or both?
- Which platform and storage approach best support those devices?
- How much freedom should students have to override recommendations?
- What evidence is sufficient to advance, revisit, or retain a skill level?
- How should progress reconcile when the same student uses multiple devices offline?
- Which material can we legally use, translate, and distribute in downloadable packs?

## Core idea

**Download a learning pack once. Keep learning and adapting offline. Sync progress when connected.**
