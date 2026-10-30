import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
const run = promisify(execFile);
const cli = fileURLToPath(new URL('../bin/render.js', import.meta.url));
async function eventually(check, ms = 5000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try { if (await check()) return; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await delay(50);
  }
  throw new Error('Timed out waiting for watch rebuild');
}

test('render builds, rebuilds, supports stdout and themes, and protects the input', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'render-cli-'));
  try {
    const input = path.join(dir, 'lesson.md');
    const output = path.join(dir, 'lesson.html');
    await writeFile(input, '# Fractions\n\n> [!TIP]\n> Try **one half**.\n\n<script>alert(1)</script>');
    await run(process.execPath, [cli, input]);
    const html = await readFile(output, 'utf8');
    assert.match(html, /<h1>Fractions<\/h1>/);
    assert.match(html, /class="callout tip"/);
    assert.match(html, /<style>/);
    assert.doesNotMatch(html, /<script>/);
    const stdout = await run(process.execPath, [cli, input, '--theme', 'midnight', '-o', '-']);
    assert.match(stdout.stdout, /theme-midnight/);
    await run(process.execPath, [cli, input, '--theme', 'minimal']);
    assert.match(await readFile(output, 'utf8'), /theme-minimal/);
    await assert.rejects(run(process.execPath, [cli, input, '-o', input]), /different from the input/);
    await assert.rejects(run(process.execPath, [cli, input, '--theme', 'unknown']), /Unknown theme/);
    await assert.rejects(run(process.execPath, [cli, input, '-watch', '-o', '-']), /Watch mode requires an output file/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('watch builds immediately and detects ordinary and atomic replacement saves', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'render-watch-'));
  const input = path.join(dir, 'lesson.md');
  const output = path.join(dir, 'lesson.html');
  let child;
  try {
    await writeFile(input, '# Initial');
    child = spawn(process.execPath, [cli, input, '-watch'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let logs = '', errors = '';
    child.stdout.on('data', chunk => { logs += chunk; });
    child.stderr.on('data', chunk => { errors += chunk; });
    await eventually(() => logs.includes('Watching'));
    assert.match(await readFile(output, 'utf8'), /<h1>Initial<\/h1>/);
    await writeFile(input, '# Edited');
    await eventually(async () => (await readFile(output, 'utf8')).includes('<h1>Edited</h1>'));
    const replacement = path.join(dir, 'replacement');
    await writeFile(replacement, '# Replaced');
    await rename(replacement, input);
    await eventually(async () => (await readFile(output, 'utf8')).includes('<h1>Replaced</h1>'));
    assert.equal(errors, '');
    const exited = new Promise(resolve => child.once('exit', (code, signal) => resolve({ code, signal })));
    child.kill('SIGINT');
    assert.deepEqual(await exited, { code: 0, signal: null });
    child = null;
  } finally { if (child) child.kill('SIGKILL'); await rm(dir, { recursive: true, force: true }); }
});
