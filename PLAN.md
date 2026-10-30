# SE-01 — What we build next

**Goal:** Students download a lesson, learn offline, and get practice suited to their answers. Teachers see progress when students reconnect.

**Where we are:** The standalone [quiz engine](docs/quiz-engine.md) now validates and scores seven question types and persists resumable sessions through a storage adapter. A fractions quiz fixture and tests are included. The student player, app caching, adaptation, and target-device offline checks are still pending.

## Now: make one lesson work offline

Use **Class 6 equivalent fractions** as the working example until the curriculum is confirmed.

1. **Write a small lesson.** Include an explanation, a worked example, a few questions, hints, and correct answers.
2. **Build a basic lesson screen.** Students can read, answer, and get feedback.
3. **Save progress on the device.** Close the app, disconnect the internet, reopen it, and continue where you stopped. Test this early on the intended phone/browser.
4. **Choose the next activity from answers.** A struggling student gets an explanation and easier practice. A student doing well gets a harder question.

**This step is finished when:** two test students follow different paths through the same lesson, and both can resume offline without losing answers.

**Immediate next task:** connect the Markdown lesson player to the [quiz contract](docs/quiz-engine.md#plugging-into-the-lesson-player), review the fractions fixture, and test save/reopen on the intended device. The quiz module does not require or implement Markdown conversion.

## Next: turn the lesson into a chapter

- Add the remaining fraction skills and a fraction-strip activity.
- Review content in Punjabi, Hindi, and English.
- Let students download the complete chapter.

## Later: connect teachers and students

- Let teachers create, edit, review, and publish lessons; add AI preparation.
- Add classes and assignments.
- Upload saved progress when internet returns and show teachers who needs help.

The first full demo should show a teacher assigning one chapter, two students learning differently offline, and their progress reaching the teacher after reconnecting.

## Details when needed

The [detailed implementation checklist](docs/implementation-checklist.md) keeps the engine requirements and completion checks. Use it when building each part; this page is the everyday plan.
