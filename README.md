# SE-01 — Offline Adaptive Learning

Students download learning material, practise offline, and receive activities suited to their answers. Their progress reaches the teacher when they reconnect.

Teachers prepare and review content online, with AI assistance, before publishing it for students.

**Status:** Quiz engine implemented; student app and other engines remain to be built.

The standalone [quiz engine](docs/quiz-engine.md) supports seven question types, offline scoring, hints/retries, and resumable sessions. It plugs into the lesson renderer through structured question data, independently of Markdown conversion.

```sh
npm test
npm run demo:quiz
```

## Start here

Read the [short build plan](PLAN.md) for what we do now, next, and later.

Our first milestone is **one fractions lesson that adapts to answers, works offline, and saves progress across restarts**. A development quiz fixture is available; the next integration is the student player and device persistence, followed by adaptation.

The full demo will cover one complete chapter in Punjabi, Hindi, and English, with two students following different learning paths and a teacher receiving their synced progress.

## Documentation

| Document | Read it for |
| --- | --- |
| [Quiz engine](docs/quiz-engine.md) | Implemented question types, scoring, session API, and lesson-player integration |
| [Product plan](docs/product-plan.md) | User journeys and first-version scope |
| [Product rationale](docs/product-rationale.md) | The problem and reasons behind the approach |
| [Content and authoring](docs/content-and-authoring.md) | Lessons, questions, simulations, and review |
| [AI preparation](docs/ai-preparation.md) | Generation, validation, and teacher approval |
| [Architecture](docs/architecture.md) | Components, local storage, and sync |
| [Implementation checklist](docs/implementation-checklist.md) | Detailed engineering tasks and completion checks |
| [Delivery plan](docs/delivery-plan.md) | Acceptance scenarios and open decisions |

Class 6 fractions and an installable web app are provisional choices. Confirm the curriculum and test offline behaviour on the intended devices before committing to them.

## Quiz engine credits

The quiz engine and playground were conceived, directed, and guided by **Chirayu Chhabra**. The code and documentation were implemented and written by **Codex**, OpenAI's AI coding assistant, under Chirayu Chhabra's guidance.
