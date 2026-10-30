# Quiz engine v1

The quiz engine is implemented in [`src/quiz`](../src/quiz/index.js). It is dependency-free JavaScript with ES module exports, usable from a browser or Node. It runs without a network connection and does not depend on the Markdown-to-HTML renderer. The runnable [fractions fixture](../examples/fractions-quiz.json) demonstrates every supported question type. This is a development fixture awaiting subject review, not published curriculum.

## Question types and rules

| Type | Student response | Scoring |
| --- | --- | --- |
| `single-choice` | One option ID, e.g. `"a"` | Correct option earns full points. True/false uses this type with two options. |
| `multiple-select` | Unique option IDs, e.g. `["a", "b"]` | Explicit `exact` or `partial` policy. |
| `numeric` | `{ "value": "4", "unit": "cm" }` (unit optional) | Absolute tolerance and exact unit label; no implicit unit conversion. Suitable for numeric blanks. |
| `fraction` | String such as `"2/4"` | Exact rational equivalence, optionally requiring simplest form. |
| `matching` | Map of left IDs to right IDs | Complete one-to-one matching, with explicit `exact` or `partial` policy. |
| `ordering` | Every item ID in the proposed order | Exact order; all-or-nothing. |
| `reflection` | Nonblank text, up to 10,000 characters | Saved for review; excluded from score and independent correctness. |

Multiple-select partial credit is `max(0, (correct selections − wrong selections) / correct options)`. Selecting every option cannot earn full credit when distractors exist. Empty selection is a valid incorrect response; duplicate or unknown IDs are invalid. Matching partial credit is the proportion of correct pairs. Missing/repeated matches are invalid, so the player must collect a complete response before submission.

Invalid responses do not consume attempts and produce no learning evidence. Valid wrong answers do. Numeric text accepts signed decimals, not expressions, commas, percentages, or scientific notation. A numeric JSON number must be finite. Tolerance is absolute, with machine-rounding allowance at a nonzero tolerance boundary; zero means exact numeric equality. Units are case-sensitive labels after trimming whitespace. Add explicit conversion rules in a future scoring version if needed.

Fractions use integer arithmetic with `BigInt`, avoiding floating-point comparison errors. Response integers may be larger than JavaScript's safe numeric range; authored numerator/denominator values must be safe integers. Zero denominators are invalid. Negative denominators are normalised to positive. `2/4` earns full credit for equivalence to `1/2`, but earns zero with `not-simplest-form` when simplification is required. That result still reports `valueCorrect: true`, so adaptation can distinguish a representation issue from a wrong value. Version 1 accepts the same fraction as the key; constraints such as “use a different denominator” are not implemented.

Free-text exact answers, algebra, mixed-number input, essays graded by AI, image hotspots, drag-only tasks, and simulation assessment are deferred. Matching and ordering should have keyboard-operable controls in the player; drag-and-drop is optional presentation, not part of the contract.

## Content contract

A quiz has `schemaVersion: 1`, stable string `id` and `revision`, `title`, `language`, and an ordered, nonempty `questions` array. Each question has `id`, `revision`, `type`, `prompt`, a nonempty array of unique `skills`, positive `points`, optional ordered string `hints`, and optional `explanation`. Reflection points are ignored. Question IDs are unique within a quiz. Quiz ID plus question ID identifies a question in evidence.

Answer rules by type:

```js
// single-choice; options: [{ id, label }, ...]
answer: { optionId: 'a' }
// multiple-select; options: [{ id, label }, ...]
answer: { optionIds: ['a', 'b'], scoring: 'partial' } // or 'exact'
// numeric
answer: { value: 4, absoluteTolerance: 0, unit: 'cm' } // unit optional
// fraction
answer: { numerator: 1, denominator: 2, requireSimplest: true }
// matching; left and right: [{ id, label }, ...]
answer: { pairs: { l1: 'r2', l2: 'r1' }, scoring: 'exact' }
// ordering; items: [{ id, label }, ...]
answer: { itemIds: ['first', 'second', 'third'] }
// reflection: omit answer
```

`validateQuiz(quiz)` returns `{ path, message }[]`. `assertQuiz(quiz)` throws a `QuizValidationError` with the same errors. Unsupported schema versions, question types, answer-rule fields, ambiguous scoring policies, broken option references, and invalid keys are rejected. This validates the quiz contract; it does not validate the external skill catalogue, translation quality, accessibility, publication review, or whether the authored answer is educationally correct.

Prompts, labels, hints, and explanations are strings. The lesson player decides whether to pass them through its Markdown renderer or render plain text. Do not use raw `innerHTML` for authored strings; use the renderer's sanitisation policy. Grading uses IDs and answer rules, never rendered text or DOM structure.

Each quiz is one language variant. Use the same quiz/question/skill IDs across translations, and store the actual language with evidence. A session is pinned to its language and exact content. In-place language switching during a quiz needs a later presentation-variant API; open a separate session for another variant for now.

## Session behaviour

| Mode | Hints | Valid submissions per question | Feedback and score |
| --- | --- | --- | --- |
| `practice` | Staged hints | Up to 3; stop after correct/ungraded response | Immediate feedback; explanation after correct answer or third attempt |
| `diagnostic` | Disabled | 1 | Hidden until quiz completion |
| `assessment` | Disabled | 1 | Hidden until quiz completion |

Students can continue after any valid answer, including a wrong practice answer; retries are optional. Version 1 has no skip, back-edit, timer, randomisation, or negative marking. Selection is the entire published question list in its authored order. Teachers can author a selected list as a separate quiz revision. Graded question points form the denominator; reflections never affect it. The latest practice response counts for the displayed score; every attempt remains in evidence. Completion requires submitting each question and calling `next()` after the last one. Displayed percentages during practice include unanswered graded questions as zero.

An `independent` attempt is the first valid submission to a graded question with no hint revealed. A retry or hinted correct answer still earns practice points but is not independent evidence. This is a per-session property; later adaptation must detect repetition across sessions using question revisions. The engine does not infer mastery, select the next lesson, or treat completion as mastery. These are policies for the separate learning engine.

## Plugging into the lesson player

```js
import { openQuizSession, browserStorage } from './src/quiz/index.js';

const session = await openQuizSession({
  quiz, // validated published quiz data, such as examples/fractions-quiz.json
  mode: 'practice',
  identity: { studentId: 'student-1', deviceId: 'device-1', sessionId: 'run-1' },
  key: 'se01:student-1:run-1', // one stable, student-scoped key per run
  storage: browserStorage(window.localStorage),
});

render(session.view());
// Wire these to player controls. Disable controls during a pending operation.
try {
  const view = await session.submit('a'); // response shape depends on question type
  render(view); // success means persistence completed
} catch (error) {
  showSaveOrInputError(error.message); // preserve the student's input for retry
}
// await session.hint(); // reveals the next staged hint and persists its use
// await session.next(); // persists navigation, or completes the quiz
```

`view()` includes the current question presentation without its answer key, revealed hints, `canSubmit`, `canContinue`, `canHint`, latest permitted feedback, explanation, and permitted summary. A score result contains `status`, `credit` (0–1 or null for ungraded), `earnedPoints`, `maxPoints`, `valueCorrect`, `code`, `normalizedResponse`, and feedback text. UI feedback strings are currently English; localise using the stable codes/status. Authors can supply explanations in the quiz language.

`scoreQuestion(question, response)` is available for direct deterministic scoring. `session.exportEvidence()` returns all graded and ungraded attempts with unique event IDs, local sequence, student/device/session identity, quiz/question revisions, language, raw/normalised response, hint count, attempt number, independence, timestamp, skills, and scoring version. Feed this to adaptation/sync code, not directly to assessment UI while a quiz is active. `session.exportSnapshot()` exposes the saved event log for debugging/transport.

Evidence is provisional local work. This engine implements neither upload nor server acceptance. For a future sync adapter, extract attempt event IDs into a student-scoped outbox and deduplicate on ingestion. Do not infer server sync status from `savedLocally`.

## Persistence and compatibility

Provide async `storage.load(key)` and `storage.save(key, snapshot)` functions. Missing sessions return null. Save must atomically replace one snapshot or reject. Browser localStorage is included for the small first slice; an IndexedDB adapter can implement the same interface. The Node demo uses memory only and demonstrates reopening within one process.

The snapshot stores content identity, exact canonical content, scoring version, identity/mode, and ordered hint/submission/navigation events. Opening a session replays events through the scorer instead of trusting saved totals. Different content, even if the author forgot to bump the revision, is rejected. Corrupt/incompatible storage is surfaced, never silently reset. Keep the old content for old sessions and offer an explicit new session when updating a quiz. Scoring changes require a version bump and a migration/retention decision.

Operations are queued within one session controller. A failed write leaves memory and persisted history at the previous successful state; the caller must show the error and allow retry. `savedLocally` describes the visible committed state, not a pending or failed submission. A failed initial save prevents session creation. Use one active writer per session key: cross-tab locking and merging are not implemented. Reading/exporting while a save is pending returns the previous committed state.

Browser persistence tests here use a localStorage-compatible test double. Service-worker caching, offline app reopening, browser eviction, shared-device login, and target-device durability require the student app and remain unverified. Installed answer keys are available on the device; this is a learning tool, not formal exam security.

## Run and verify

```sh
npm test
npm run demo:quiz
npm run build:playground
npm run dev:quiz # http://localhost:4173
```

The tests cover answer tables, partial credit, fraction representation, malformed responses/content, hidden assessment feedback, hint/retry evidence, replay, identity/content mismatch, invalid event ordering, write failures, concurrent submissions, and browser JSON round trips. The demo completes all eight example questions, reopens a saved session, and prints the resulting evidence summary.

Open [`examples/quiz-playground.html`](../examples/quiz-playground.html) directly for the interactive playground; no server or dependencies are needed. It bundles the current engine and fixture. Rebuild it after engine changes with `npm run build:playground`. The template is `examples/quiz-playground.template.html`. The playground offers the full quiz or individual question types, three session modes, hints/retries, saved-session reopening, and inspectable evidence. It uses browser localStorage when available and clearly labels a memory-only fallback in restricted previews. “Start fresh” clears only the selected playground quiz/mode session.
