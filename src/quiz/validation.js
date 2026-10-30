export const QUESTION_TYPES = Object.freeze([
  'single-choice', 'multiple-select', 'numeric', 'fraction', 'matching', 'ordering', 'reflection',
]);

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const unique = values => new Set(values).size === values.length;

/** Structural validation only; content still needs subject/language review. */
export function validateQuiz(quiz) {
  const errors = [];
  const check = (condition, path, message) => { if (!condition) errors.push({ path, message }); };
  if (!object(quiz)) return [{ path: 'quiz', message: 'Expected an object.' }];
  check(quiz.schemaVersion === 1, 'schemaVersion', 'Supported schema version is 1.');
  for (const key of ['id', 'revision', 'title', 'language']) check(text(quiz[key]), key, 'Required nonempty string.');
  check(Array.isArray(quiz.questions) && quiz.questions.length > 0, 'questions', 'Provide at least one question.');
  if (!Array.isArray(quiz.questions)) return errors;
  check(unique(quiz.questions.map(q => q?.id)), 'questions', 'Question IDs must be unique.');
  quiz.questions.forEach((q, index) => {
    const path = `questions[${index}]`;
    const at = (ok, field, message) => check(ok, `${path}.${field}`, message);
    if (!object(q)) { check(false, path, 'Expected a question object.'); return; }
    for (const key of ['id', 'revision', 'prompt']) at(text(q[key]), key, 'Required nonempty string.');
    at(QUESTION_TYPES.includes(q.type), 'type', 'Unsupported question type.');
    at(Array.isArray(q.skills) && q.skills.length > 0 && q.skills.every(text) && unique(q.skills), 'skills', 'Provide unique skill IDs.');
    at(Number.isFinite(q.points) && q.points > 0, 'points', 'Points must be positive.');
    if (q.hints !== undefined) at(Array.isArray(q.hints) && q.hints.every(text), 'hints', 'Hints must be nonempty strings.');
    if (q.explanation !== undefined) at(text(q.explanation), 'explanation', 'Expected a nonempty string.');
    if (q.type === 'reflection') {
      at(q.answer === undefined, 'answer', 'Reflections are ungraded and must not have an answer key.');
      return;
    }
    const a = q.answer;
    if (!object(a)) { at(false, 'answer', 'Provide an answer rule.'); return; }
    const allowed = {
      'single-choice': ['optionId'], 'multiple-select': ['optionIds', 'scoring'],
      numeric: ['value', 'absoluteTolerance', 'unit'], fraction: ['numerator', 'denominator', 'requireSimplest'],
      matching: ['pairs', 'scoring'], ordering: ['itemIds'],
    }[q.type];
    if (!allowed) return;
    for (const key of Object.keys(a)) at(allowed.includes(key), `answer.${key}`, 'Unsupported answer rule.');
    const items = (field, min) => {
      const list = q[field];
      const valid = Array.isArray(list) && list.length >= min && list.every(i => object(i) && text(i.id) && text(i.label)) && unique(list.map(i => i.id));
      at(valid, field, `Provide at least ${min} uniquely identified labelled items.`);
      return valid ? list.map(i => i.id) : [];
    };
    if (q.type === 'single-choice' || q.type === 'multiple-select') {
      const ids = items('options', 2);
      if (q.type === 'single-choice') at(ids.includes(a.optionId), 'answer.optionId', 'Answer must reference an option.');
      else {
        at(Array.isArray(a.optionIds) && a.optionIds.length > 0 && unique(a.optionIds) && a.optionIds.every(id => ids.includes(id)), 'answer.optionIds', 'Provide unique correct option IDs.');
        at(['exact', 'partial'].includes(a.scoring), 'answer.scoring', 'Choose exact or partial scoring explicitly.');
      }
    }
    if (q.type === 'numeric') {
      at(Number.isFinite(a.value), 'answer.value', 'Expected a finite number.');
      at(Number.isFinite(a.absoluteTolerance) && a.absoluteTolerance >= 0, 'answer.absoluteTolerance', 'Provide a nonnegative absolute tolerance (0 for exact).');
      if (a.unit !== undefined) at(text(a.unit), 'answer.unit', 'Expected a unit string.');
    }
    if (q.type === 'fraction') {
      at(Number.isSafeInteger(a.numerator), 'answer.numerator', 'Expected a safe integer.');
      at(Number.isSafeInteger(a.denominator) && a.denominator > 0, 'answer.denominator', 'Expected a positive safe integer.');
      at(typeof a.requireSimplest === 'boolean', 'answer.requireSimplest', 'Set the simplest-form rule explicitly.');
    }
    if (q.type === 'ordering') {
      const ids = items('items', 2);
      at(Array.isArray(a.itemIds) && a.itemIds.length === ids.length && unique(a.itemIds) && a.itemIds.every(id => ids.includes(id)), 'answer.itemIds', 'Answer must be a permutation of all item IDs.');
    }
    if (q.type === 'matching') {
      const left = items('left', 2), right = items('right', 2);
      at(left.length === right.length, 'right', 'Version 1 supports one-to-one matching with equally sized lists.');
      at(object(a.pairs) && Object.keys(a.pairs).length === left.length && left.every(id => right.includes(a.pairs[id])) && unique(Object.values(a.pairs)), 'answer.pairs', 'Map every left ID to a distinct right ID.');
      at(['exact', 'partial'].includes(a.scoring), 'answer.scoring', 'Choose exact or partial scoring explicitly.');
    }
  });
  return errors;
}

export function assertQuiz(quiz) {
  const errors = validateQuiz(quiz);
  if (errors.length) {
    const error = new Error(errors.map(e => `${e.path}: ${e.message}`).join('\n'));
    error.name = 'QuizValidationError';
    error.errors = errors;
    throw error;
  }
  return quiz;
}
