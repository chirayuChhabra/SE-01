import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateQuiz, scoreQuestion, openQuizSession, browserStorage } from '../src/quiz/index.js';

const fixture = JSON.parse(await readFile(new URL('../examples/fractions-quiz.json', import.meta.url), 'utf8'));
const question = id => structuredClone(fixture.questions.find(q => q.id === id));
const single = question('recognise-half');
const multi = question('select-halves');
const fraction = question('write-equivalent');
const simplest = question('simplify-half');
const numeric = question('missing-numerator');
const matching = question('match-values');
const ordering = question('order-simplification');
const reflection = question('explain-equivalence');

test('all example types validate; malformed content returns field paths', () => {
  assert.deepEqual(validateQuiz(fixture), []);
  const broken = structuredClone(fixture);
  broken.questions[0].answer.optionId = 'missing';
  broken.questions[1].answer.scoring = 'guess';
  broken.questions[2].answer.javascript = 'anything';
  broken.questions[4].answer.denominator = 0;
  broken.questions[6].answer.itemIds = ['find', 'find'];
  const paths = validateQuiz(broken).map(e => e.path);
  for (const path of ['questions[0].answer.optionId', 'questions[1].answer.scoring', 'questions[2].answer.javascript', 'questions[4].answer.denominator', 'questions[6].answer.itemIds']) assert.ok(paths.includes(path), path);
});

test('malformed root/questions and non-finite rules are rejected', () => {
  for (const value of [null, [], {}, { questions: [null, null] }]) assert.ok(validateQuiz(value).length > 0);
  const broken = structuredClone(fixture);
  broken.questions[2].answer.absoluteTolerance = Infinity;
  assert.ok(validateQuiz(broken).some(e => e.path.endsWith('absoluteTolerance')));
});

const table = [
  [single, 'a', 'correct', 1], [single, 'b', 'incorrect', 0], [single, 'unknown', 'invalid', 0],
  [multi, ['b', 'a'], 'correct', 1], [multi, ['a'], 'partial', 0.5],
  [multi, ['a', 'b', 'c'], 'partial', 0.5], [multi, ['a', 'c'], 'incorrect', 0],
  [multi, ['a', 'a'], 'invalid', 0], [multi, [], 'incorrect', 0],
  [numeric, { value: ' 4 ' }, 'correct', 1], [numeric, { value: 3 }, 'incorrect', 0],
  [numeric, { value: '' }, 'invalid', 0], [numeric, { value: '4cats' }, 'invalid', 0],
  [numeric, { value: '0x4' }, 'invalid', 0], [numeric, { value: Infinity }, 'invalid', 0],
  [numeric, { value: 4, unit: 'cm' }, 'invalid', 0],
  [fraction, '2/4', 'correct', 1], [fraction, ' 3 / 6 ', 'correct', 1],
  [fraction, '-2/-4', 'correct', 1], [fraction, '1/-2', 'incorrect', 0],
  [fraction, '99999999999999999999/199999999999999999998', 'correct', 1],
  [fraction, '1/0', 'invalid', 0], [fraction, '0.5', 'invalid', 0], [fraction, '1/2/3', 'invalid', 0],
  [simplest, '2/4', 'incorrect', 0], [simplest, '1/2', 'correct', 1],
  [matching, { l1: 'r3', l2: 'r1', l3: 'r2' }, 'correct', 1],
  [matching, { l1: 'r3', l2: 'r2', l3: 'r1' }, 'partial', 1 / 3],
  [matching, { l1: 'r3' }, 'invalid', 0],
  [matching, { l1: 'r3', l2: 'r3', l3: 'r2' }, 'invalid', 0],
  [ordering, ['find', 'divide', 'write'], 'correct', 1], [ordering, ['divide', 'find', 'write'], 'incorrect', 0],
  [ordering, ['find', 'find', 'write'], 'invalid', 0],
  [reflection, ' My explanation ', 'ungraded', null], [reflection, '   ', 'invalid', 0],
];
for (const [q, response, status, credit] of table) {
  test(`${q.id}: ${JSON.stringify(response)} → ${status}`, () => {
    const result = scoreQuestion(q, response);
    assert.equal(result.status, status);
    assert.equal(result.credit, credit);
  });
}

test('equivalence and representation are separate evidence', () => {
  const result = scoreQuestion(simplest, '2/4');
  assert.equal(result.valueCorrect, true);
  assert.equal(result.code, 'not-simplest-form');
  assert.match(result.feedback, /simplest form/);
});

test('explicit exact policies; numeric units/tolerance and exact zero tolerance', () => {
  multi.answer.scoring = 'exact';
  assert.equal(scoreQuestion(multi, ['a']).credit, 0);
  multi.answer.scoring = 'partial';
  const q = structuredClone(matching);
  q.answer.scoring = 'exact';
  assert.equal(scoreQuestion(q, { l1: 'r3', l2: 'r2', l3: 'r1' }).credit, 0);
  const n = structuredClone(numeric);
  n.answer = { value: 0.3, absoluteTolerance: 0.01, unit: 'cm' };
  assert.equal(scoreQuestion(n, { value: '0.31', unit: 'cm' }).status, 'correct');
  assert.equal(scoreQuestion(n, { value: '0.311', unit: 'cm' }).status, 'incorrect');
  assert.equal(scoreQuestion(n, { value: '0.3', unit: 'm' }).code, 'unit-mismatch');
  assert.equal(scoreQuestion(n, { value: '0.3' }).code, 'unit-mismatch');
  n.answer = { value: 0.3, absoluteTolerance: 0 };
  assert.equal(scoreQuestion(n, { value: 0.1 + 0.2 }).status, 'incorrect');
});

function setup(questions = [single, simplest], mode = 'practice') {
  let saved = null, fail = false, seq = 0;
  const options = {
    quiz: { ...fixture, questions: structuredClone(questions) }, mode,
    identity: { studentId: 's1', deviceId: 'd1', sessionId: 'session1' }, key: 's1:session1',
    storage: {
      async load() { return structuredClone(saved); },
      async save(key, value) { if (fail) throw new Error('Storage full'); saved = structuredClone(value); },
    },
    idFactory: () => `event-${++seq}`, now: () => '2026-10-30T10:00:00.000Z',
  };
  return { options, fail: value => { fail = value; }, tamper: fn => fn(saved) };
}

test('practice: hints, retry evidence, resume, completion, and aggregate points', async () => {
  const { options } = setup();
  let session = await openQuizSession(options);
  assert.equal(session.view().question.answer, undefined);
  await session.hint();
  await session.submit('b');
  await session.submit('a');
  assert.equal(session.view().canSubmit, false);
  assert.deepEqual(session.exportEvidence().map(a => [a.independent, a.hintsUsed, a.attemptNumber]), [[false, 1, 1], [false, 1, 2]]);
  await session.next();
  session = await openQuizSession(options);
  assert.equal(session.view().question.id, simplest.id);
  await session.submit('1/2');
  await session.next();
  assert.equal(session.view().summary.earnedPoints, 2);
  assert.equal(session.view().summary.independentCorrect, 1);
  assert.equal(session.view().completed, true);
  await assert.rejects(session.submit('1/2'), /complete/);
  assert.deepEqual((await openQuizSession(options)).exportEvidence(), session.exportEvidence());
});

test('practice permits moving on after one wrong answer and caps retries at three', async () => {
  let session = await openQuizSession(setup().options);
  await assert.rejects(session.next(), /Submit an answer/);
  await session.submit('b');
  assert.equal(session.view().canContinue, true);
  await session.next();
  assert.equal(session.view().question.id, simplest.id);
  session = await openQuizSession(setup([single]).options);
  for (let i = 0; i < 3; i++) await session.submit('b');
  await assert.rejects(session.submit('a'), /already submitted/);
});

for (const mode of ['diagnostic', 'assessment']) {
  test(`${mode}: no hints, retries, explanations, or score leaks until completion`, async () => {
    const session = await openQuizSession(setup([single, simplest], mode).options);
    await assert.rejects(session.hint(), /only during active practice/);
    await session.submit('a');
    assert.equal(session.view().feedback, null);
    assert.equal(session.view().summary, null);
    assert.equal(session.view().explanation, null);
    await assert.rejects(session.submit('b'), /already submitted/);
    await session.next();
    await session.submit('1/2');
    await session.next();
    assert.equal(session.view().summary.percentage, 100);
  });
}

test('invalid input does not consume an attempt or add evidence', async () => {
  const session = await openQuizSession(setup().options);
  await assert.rejects(session.submit('missing'), /Invalid response/);
  assert.equal(session.exportEvidence().length, 0);
  assert.equal(session.exportSnapshot().events.length, 0);
});

test('failed writes leave state unchanged, and a subsequent retry works', async () => {
  const env = setup();
  const session = await openQuizSession(env.options);
  const before = session.exportSnapshot();
  env.fail(true);
  await assert.rejects(session.submit('a'), /Storage full/);
  assert.deepEqual(session.exportSnapshot(), before);
  assert.equal(session.view().attemptsUsed, 0);
  env.fail(false);
  await session.submit('a');
  assert.equal(session.view().attemptsUsed, 1);
});

test('write is invisible until acknowledged, and duplicate successful submissions are rejected', async () => {
  const env = setup([single]);
  const session = await openQuizSession(env.options);
  let release, started;
  const writing = new Promise(resolve => { started = resolve; });
  const persist = env.options.storage.save;
  env.options.storage.save = async (...args) => {
    started();
    await new Promise(resolve => { release = resolve; });
    await persist(...args);
  };
  const first = session.submit('a'), second = session.submit('a');
  await writing;
  assert.equal(session.view().attemptsUsed, 0);
  release();
  await first;
  await assert.rejects(second, /already submitted/);
  assert.equal(session.exportEvidence().length, 1);
});

test('identity, question edits, scoring version, and broken event logs cannot silently resume', async () => {
  const env = setup();
  const session = await openQuizSession(env.options);
  await session.submit('a');
  await assert.rejects(openQuizSession({ ...env.options, identity: { ...env.options.identity, studentId: 'other' } }), /identity/);
  const edited = structuredClone(env.options.quiz);
  edited.questions[0].prompt = 'Edited without a revision bump';
  await assert.rejects(openQuizSession({ ...env.options, quiz: edited }), /incompatible/);
  env.tamper(saved => { saved.events[0].sequence = 9; });
  await assert.rejects(openQuizSession(env.options), /event sequence/);
});

test('reflection-only quiz records work without inventing a grade', async () => {
  const session = await openQuizSession(setup([reflection]).options);
  await session.submit('My explanation');
  await session.next();
  assert.equal(session.view().summary.percentage, null);
  assert.equal(session.view().summary.maxPoints, 0);
  assert.equal(session.view().summary.independentCorrect, 0);
  assert.equal(session.view().summary.ungradedResponses, 1);
});

test('initial storage failure prevents a false saved state', async () => {
  const env = setup();
  env.fail(true);
  await assert.rejects(openQuizSession(env.options), /Storage full/);
});

test('a different scoring version is rejected before replay', async () => {
  const env = setup();
  await openQuizSession(env.options);
  env.tamper(saved => { saved.scoringVersion = 'future-version'; });
  await assert.rejects(openQuizSession(env.options), /incompatible/);
});

test('duplicate event IDs cannot overwrite evidence', async () => {
  const env = setup();
  env.options.idFactory = () => 'same-id';
  const session = await openQuizSession(env.options);
  await session.submit('b');
  await assert.rejects(session.submit('a'), /event sequence/);
  assert.equal(session.exportEvidence().length, 1);
});

test('double navigation cannot skip the next question', async () => {
  const session = await openQuizSession(setup().options);
  await session.submit('a');
  const outcomes = await Promise.allSettled([session.next(), session.next()]);
  assert.deepEqual(outcomes.map(r => r.status), ['fulfilled', 'rejected']);
  assert.equal(session.view().question.id, simplest.id);
  assert.equal(session.view().completed, false);
});

test('browser adapter persists through JSON and exposes corrupted storage', async () => {
  const values = new Map();
  const adapter = browserStorage({ getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) });
  assert.equal(await adapter.load('empty'), null);
  const env = setup();
  env.options.storage = adapter;
  const session = await openQuizSession(env.options);
  await session.submit('a');
  assert.deepEqual((await openQuizSession(env.options)).exportEvidence(), session.exportEvidence());
  values.set(env.options.key, '{broken');
  await assert.rejects(openQuizSession(env.options), SyntaxError);
});
