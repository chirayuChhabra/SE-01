import { readFile } from 'node:fs/promises';
import { openQuizSession } from '../src/quiz/index.js';

const quiz = JSON.parse(await readFile(new URL('./fractions-quiz.json', import.meta.url), 'utf8'));
const records = new Map();
const storage = {
  async load(key) { return structuredClone(records.get(key) ?? null); },
  async save(key, snapshot) { records.set(key, structuredClone(snapshot)); },
};
const options = { quiz, identity: { studentId: 'demo', deviceId: 'laptop', sessionId: 'practice-1' }, key: 'quiz:demo:practice-1', storage };
let session = await openQuizSession(options);
console.log(session.view().question.prompt);
await session.hint();
console.log((await session.submit('b')).feedback);
console.log((await session.submit('a')).feedback);
await session.next();
session = await openQuizSession(options);
console.log('Resumed at:', session.view().question.prompt);
const responses = [['a', 'b'], { value: '4' }, '2/4', '1/2', { l1: 'r3', l2: 'r1', l3: 'r2' }, ['find', 'divide', 'write'], 'Both parts scale equally.'];
for (const response of responses) { await session.submit(response); await session.next(); }
console.log('Results:', session.view().summary);
console.log('First attempt independent:', session.exportEvidence()[0].independent);
