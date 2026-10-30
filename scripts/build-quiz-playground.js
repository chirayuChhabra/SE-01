import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
async function moduleBody(path) {
  return (await readFile(new URL(path, root), 'utf8'))
    .replace(/^import .*;\n/gm, '').replace(/^export /gm, '');
}
const validation = await moduleBody('src/quiz/validation.js');
const scoring = await moduleBody('src/quiz/scoring.js');
const session = await moduleBody('src/quiz/session.js');
const engine = `const { assertQuiz, validateQuiz } = (() => {\n${validation}\nreturn { assertQuiz, validateQuiz }; })();
const { scoreQuestion } = (() => {\n${scoring}\nreturn { scoreQuestion }; })();
const { openQuizSession, browserStorage } = (() => {\n${session}\nreturn { openQuizSession, browserStorage }; })();`;
const quiz = JSON.parse(await readFile(new URL('examples/fractions-quiz.json', root), 'utf8'));
const template = await readFile(new URL('examples/quiz-playground.template.html', root), 'utf8');
const html = template.replace('/* QUIZ_ENGINE */', () => engine)
  .replace('/* QUIZ_FIXTURE */ null', () => JSON.stringify(quiz).replaceAll('<', '\\u003c'));
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(match[1]);
await writeFile(new URL('examples/quiz-playground.html', root), html);
console.log('Built examples/quiz-playground.html using the current quiz engine.');
