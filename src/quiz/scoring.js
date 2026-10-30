import { assertQuiz } from './validation.js';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const sameSet = (a, b) => a.length === b.length && a.every(id => b.includes(id));
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const integer = /^[+-]?\d+$/;
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };

/** No DOM, network, AI, or persistence dependencies. Invalid input earns no evidence. */
export function scoreQuestion(question, response) {
  assertQuiz({ schemaVersion: 1, id: 'scoring', revision: '1', title: 'Scoring', language: 'en', questions: [question] });
  const q = question, a = q.answer;
  const result = (status, credit, code, normalizedResponse, valueCorrect = status === 'correct') => ({
    status, credit, earnedPoints: credit === null ? null : q.points * credit,
    maxPoints: q.type === 'reflection' ? 0 : q.points,
    valueCorrect, code, normalizedResponse,
    feedback: {
      'not-simplest-form': 'The value is equivalent. Reduce the numerator and denominator to simplest form.',
      'unit-mismatch': `Check the unit. Use ${a?.unit ?? 'the requested unit'}.`,
      'zero-denominator': 'A fraction cannot have a zero denominator.',
    }[code] ?? {
      correct: 'Correct.', incorrect: 'Try again.', partial: 'Some parts are correct.',
      invalid: 'Check the answer format.', ungraded: 'Response recorded for review.',
    }[status],
  });
  const invalid = code => result('invalid', 0, code, null, false);
  const graded = (credit, normalized, code) => result(credit === 1 ? 'correct' : credit > 0 ? 'partial' : 'incorrect', credit, code ?? (credit === 1 ? 'correct' : 'incorrect'), normalized);
  const ids = (value, allowed, complete = false) => Array.isArray(value) && value.every(id => allowed.includes(id)) && new Set(value).size === value.length && (!complete || value.length === allowed.length);
  if (q.type === 'reflection') {
    if (typeof response !== 'string' || !response.trim() || response.length > 10000) return invalid('expected-written-response');
    return result('ungraded', null, 'needs-review', response.trim(), null);
  }
  if (q.type === 'single-choice') {
    if (!q.options.some(o => o.id === response)) return invalid('unknown-option');
    return graded(Number(response === a.optionId), response);
  }
  if (q.type === 'multiple-select') {
    if (!ids(response, q.options.map(o => o.id))) return invalid('expected-unique-option-ids');
    const correct = response.filter(id => a.optionIds.includes(id)).length;
    const wrong = response.length - correct;
    const credit = a.scoring === 'exact' ? Number(sameSet(response, a.optionIds)) : Math.max(0, (correct - wrong) / a.optionIds.length);
    return graded(credit, [...response].sort());
  }
  if (q.type === 'numeric') {
    if (!object(response) || !['string', 'number'].includes(typeof response.value)) return invalid('expected-numeric-response');
    const raw = String(response.value).trim();
    if ((typeof response.value === 'string' && !decimal.test(raw)) || !Number.isFinite(Number(raw))) return invalid('expected-finite-decimal');
    const value = Number(raw);
    if (a.unit !== undefined && (typeof response.unit !== 'string' || response.unit.trim() !== a.unit)) return graded(0, { value, unit: response.unit ?? null }, 'unit-mismatch');
    if (a.unit === undefined && response.unit !== undefined && response.unit !== '') return invalid('unexpected-unit');
    // Allow only machine rounding at the tolerance boundary.
    const difference = Math.abs(value - a.value);
    const rounding = a.absoluteTolerance === 0 ? 0 : Number.EPSILON * Math.max(1, Math.abs(value), Math.abs(a.value)) * 2;
    return graded(Number(difference <= a.absoluteTolerance + rounding), { value, ...(a.unit === undefined ? {} : { unit: a.unit }) });
  }
  if (q.type === 'fraction') {
    if (typeof response !== 'string' || response.length > 100) return invalid('expected-fraction');
    const parts = response.trim().split('/').map(p => p.trim());
    if (parts.length !== 2 || !parts.every(p => integer.test(p))) return invalid('expected-fraction');
    let [n, d] = parts.map(BigInt);
    if (d === 0n) return invalid('zero-denominator');
    if (d < 0n) { n = -n; d = -d; }
    const normalized = { numerator: n.toString(), denominator: d.toString() };
    const equal = n * BigInt(a.denominator) === BigInt(a.numerator) * d;
    if (equal && a.requireSimplest && gcd(n, d) !== 1n) return result('incorrect', 0, 'not-simplest-form', normalized, true);
    return graded(Number(equal), normalized);
  }
  if (q.type === 'ordering') {
    if (!ids(response, q.items.map(i => i.id), true)) return invalid('expected-all-items-once');
    return graded(Number(response.every((id, index) => id === a.itemIds[index])), [...response]);
  }
  if (q.type === 'matching') {
    if (!object(response) || !sameSet(Object.keys(response), q.left.map(i => i.id)) || !ids(Object.values(response), q.right.map(i => i.id), true)) return invalid('expected-complete-one-to-one-matching');
    const correct = Object.keys(a.pairs).filter(id => response[id] === a.pairs[id]).length;
    return graded(a.scoring === 'exact' ? Number(correct === q.left.length) : correct / q.left.length, { ...response });
  }
}
