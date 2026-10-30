import { assertQuiz } from './validation.js';
import { scoreQuestion } from './scoring.js';

export const SCORING_VERSION = 'quiz-scoring-v1';
const MODES = ['practice', 'diagnostic', 'assessment'];
const clone = value => structuredClone(value);
const canonical = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function initial(quiz) {
  return { index: 0, completed: false, attempts: [], hints: Object.fromEntries(quiz.questions.map(q => [q.id, 0])) };
}

function apply(quiz, mode, state, event) {
  if (state.completed) throw new Error('Quiz is already complete.');
  const q = quiz.questions[state.index];
  if (event.questionId !== q.id) throw new Error('Event does not refer to the current question.');
  const attempts = state.attempts.filter(a => a.questionId === q.id);
  const last = attempts.at(-1);
  const settled = last && (mode !== 'practice' || ['correct', 'ungraded'].includes(last.result.status) || attempts.length >= 3);
  if (event.kind === 'hint') {
    if (mode !== 'practice' || settled) throw new Error('Hints are available only during active practice.');
    if (state.hints[q.id] >= (q.hints?.length ?? 0)) throw new Error('No more hints available.');
    state.hints[q.id]++;
  } else if (event.kind === 'submit') {
    if (settled) throw new Error('This question is already submitted.');
    const result = scoreQuestion(q, event.response);
    if (result.status === 'invalid') throw new Error(`Invalid response: ${result.code}`);
    state.attempts.push({
      eventId: event.id, sequence: event.sequence, questionId: q.id, questionRevision: q.revision,
      language: quiz.language, skills: [...q.skills], mode, response: clone(event.response),
      attemptNumber: attempts.length + 1, hintsUsed: state.hints[q.id],
      independent: attempts.length === 0 && state.hints[q.id] === 0 && result.status !== 'ungraded',
      occurredAt: event.occurredAt, scoringVersion: SCORING_VERSION, result,
    });
  } else if (event.kind === 'next') {
    if (!last) throw new Error('Submit an answer before continuing.');
    if (state.index === quiz.questions.length - 1) state.completed = true;
    else state.index++;
  } else throw new Error('Unsupported session event.');
}

function replay(quiz, snapshot) {
  if (!snapshot || snapshot.version !== 1 || snapshot.scoringVersion !== SCORING_VERSION || snapshot.content !== canonical(quiz)) throw new Error('Saved session has incompatible content or scoring version.');
  if (!MODES.includes(snapshot.mode) || !Array.isArray(snapshot.events)) throw new Error('Invalid saved session.');
  const state = initial(quiz), ids = new Set();
  snapshot.events.forEach((event, index) => {
    if (!event || !nonempty(event.id) || ids.has(event.id) || event.sequence !== index + 1 || !nonempty(event.occurredAt)) throw new Error('Invalid saved event sequence.');
    ids.add(event.id);
    apply(quiz, snapshot.mode, state, event);
  });
  return state;
}

function summary(quiz, state) {
  const graded = quiz.questions.filter(q => q.type !== 'reflection');
  const latest = graded.map(q => state.attempts.filter(a => a.questionId === q.id).at(-1));
  const earnedPoints = latest.reduce((total, a) => total + (a?.result.earnedPoints ?? 0), 0);
  const maxPoints = graded.reduce((total, q) => total + q.points, 0);
  return {
    completed: state.completed, answeredQuestions: new Set(state.attempts.map(a => a.questionId)).size,
    totalQuestions: quiz.questions.length, earnedPoints, maxPoints,
    percentage: maxPoints ? earnedPoints / maxPoints * 100 : null,
    independentCorrect: state.attempts.filter(a => a.independent && a.result.status === 'correct').length,
    ungradedResponses: state.attempts.filter(a => a.result.status === 'ungraded').length,
  };
}

/**
 * storage: { load(key): Promise<snapshot|null>, save(key, snapshot): Promise<void> }
 * save must atomically replace one snapshot or throw. Use one writer per session key.
 * Mutations are queued and only become visible after durable save succeeds.
 */
export async function openQuizSession({ quiz, identity, mode = 'practice', storage, key, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
  assertQuiz(quiz);
  quiz = clone(quiz);
  if (!MODES.includes(mode)) throw new Error('Unsupported quiz mode.');
  if (!identity || !['studentId', 'deviceId', 'sessionId'].every(field => nonempty(identity[field]))) throw new Error('Provide studentId, deviceId, and sessionId.');
  identity = Object.fromEntries(['studentId', 'deviceId', 'sessionId'].map(field => [field, identity[field]]));
  if (!storage || typeof storage.load !== 'function' || typeof storage.save !== 'function' || !nonempty(key)) throw new Error('Provide storage and a student-scoped key.');
  let snapshot = clone(await storage.load(key));
  if (snapshot == null) {
    snapshot = { version: 1, scoringVersion: SCORING_VERSION, content: canonical(quiz), quizId: quiz.id, quizRevision: quiz.revision, identity, mode, events: [] };
    await storage.save(key, clone(snapshot));
  }
  if (canonical(snapshot.identity) !== canonical(identity) || snapshot.mode !== mode || snapshot.quizId !== quiz.id || snapshot.quizRevision !== quiz.revision) throw new Error('Saved session belongs to another identity, mode, or quiz.');
  let state = replay(quiz, snapshot);
  let queue = Promise.resolve();
  function view() {
    const q = quiz.questions[state.index];
    const attempts = state.attempts.filter(a => a.questionId === q.id);
    const last = attempts.at(-1);
    const settled = Boolean(last && (mode !== 'practice' || ['correct', 'ungraded'].includes(last.result.status) || attempts.length >= 3));
    const reveal = mode === 'practice' || state.completed;
    const { answer, explanation, hints, ...presentation } = q;
    return clone({
      quizId: quiz.id, quizRevision: quiz.revision, title: quiz.title, language: quiz.language, mode,
      questionIndex: state.index, question: presentation, completed: state.completed,
      canSubmit: !settled && !state.completed, canContinue: Boolean(last) && !state.completed,
      canHint: mode === 'practice' && !settled && !state.completed && state.hints[q.id] < (hints?.length ?? 0),
      hints: (hints ?? []).slice(0, state.hints[q.id]), attemptsUsed: attempts.length,
      feedback: reveal ? last?.result ?? null : null,
      explanation: reveal && settled ? explanation ?? null : null,
      summary: reveal ? summary(quiz, state) : null,
      savedLocally: true,
    });
  }
  function commit(kind, response) {
    // Capture the current question before queuing: a double click cannot answer the next question.
    const questionId = quiz.questions[state.index].id;
    const capturedResponse = response === undefined ? undefined : clone(response);
    const operation = queue.then(async () => {
      const candidate = clone(snapshot);
      candidate.events.push({ id: idFactory(), sequence: candidate.events.length + 1, kind, questionId, occurredAt: now(), ...(kind === 'submit' ? { response: capturedResponse } : {}) });
      const nextState = replay(quiz, candidate);
      await storage.save(key, clone(candidate));
      snapshot = candidate;
      state = nextState;
      return view();
    });
    queue = operation.catch(() => {});
    return operation;
  }
  return {
    view,
    submit: response => commit('submit', response),
    hint: () => commit('hint'),
    next: () => commit('next'),
    // Internal evidence for storage/sync/adaptation; assessment UI must use view().
    exportEvidence: () => clone(state.attempts.map(a => ({ ...a, ...identity, quizId: quiz.id, quizRevision: quiz.revision }))),
    exportSnapshot: () => clone(snapshot),
  };
}

/** Browser adapter; localStorage exceptions propagate so failed writes never claim success. */
export function browserStorage(localStorage) {
  return {
    async load(key) { const raw = localStorage.getItem(key); return raw === null ? null : JSON.parse(raw); },
    async save(key, snapshot) { localStorage.setItem(key, JSON.stringify(snapshot)); },
  };
}
