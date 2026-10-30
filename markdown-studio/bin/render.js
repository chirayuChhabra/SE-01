#!/usr/bin/env node
import { watchFile, unwatchFile } from 'node:fs';
import { readFile, writeFile, rename, unlink, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createRenderer, exportDocument } from '../src/renderer.js';

const usage = `Usage: render <file.md> [options]

Convert Markdown to a styled, standalone HTML document.

Options:
  -watch, --watch, -w  Rebuild when the input file changes
  -o, --output <file>  Output path (default: input name with .html); use - for stdout
  -t, --theme <name>   editorial (default), minimal, or midnight
  -h, --help           Show this help

The output file is replaced on each successful build. Press Ctrl+C to stop watching.
`;

function parseArgs(args) {
  let input, output, theme = 'editorial', watching = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') return { help: true };
    if (['-watch', '--watch', '-w'].includes(arg)) { watching = true; continue; }
    if (['-o', '--output', '-t', '--theme'].includes(arg)) {
      const value = args[++i];
      if (!value || (value.startsWith('-') && !(value === '-' && (arg === '-o' || arg === '--output')))) throw new Error(`${arg} requires a value`);
      if (arg === '-o' || arg === '--output') output = value; else theme = value;
      continue;
    }
    if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    if (input) throw new Error('Provide one Markdown input file.');
    input = arg;
  }
  if (!input) throw new Error(`Provide a Markdown input file.\n\n${usage}`);
  if (!['editorial', 'minimal', 'midnight'].includes(theme)) throw new Error(`Unknown theme: ${theme}. Choose editorial, minimal, or midnight.`);
  const parsed = path.parse(input);
  output ??= path.join(parsed.dir, `${parsed.name}.html`);
  if (watching && output === '-') throw new Error('Watch mode requires an output file; stdout is only supported for a single build.');
  if (output !== '-' && path.resolve(input) === path.resolve(output)) throw new Error('The output path must be different from the input path.');
  return { input, output, theme, watching, title: parsed.name };
}

async function assertDistinctFiles(input, output) {
  if (output === '-') return;
  const source = await realpath(input);
  let destination;
  try { destination = await realpath(output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (source === destination) throw new Error('The output path must be different from the input path.');
}

async function writeAtomically(output, html) {
  const target = path.resolve(output);
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temp, html, { encoding: 'utf8', flag: 'wx' });
    await rename(temp, target);
  } finally {
    await unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

async function main(args) {
  const options = parseArgs(args);
  if (options.help) { process.stdout.write(usage); return; }
  const { input, output, theme, watching } = options;
  await assertDistinctFiles(input, output);
  const css = await readFile(fileURLToPath(new URL('../src/document.css', import.meta.url)), 'utf8');
  const dom = new JSDOM('');
  const render = createRenderer(dom.window);
  async function build() {
    await assertDistinctFiles(input, output);
    const markdown = await readFile(input, 'utf8');
    const title = markdown.match(/^#\s+(.+)\s*$/m)?.[1] || options.title;
    const html = exportDocument(render(markdown), css, theme, title);
    if (output === '-') process.stdout.write(html + '\n');
    else { await writeAtomically(output, html); process.stdout.write(`Built ${output}\n`); }
  }
  if (!watching) { try { await build(); } finally { dom.window.close(); } return; }

  // Poll the path so replacement saves and filesystems without native watch
  // notifications work. Coalesce bursts and serialize builds to avoid stale output.
  let timer, building = false, pending = false, stopped = false;
  async function rebuild() {
    if (stopped) return;
    if (building) { pending = true; return; }
    building = true;
    try { await build(); } catch (error) { process.stderr.write(`render: ${error.message}\n`); }
    finally {
      building = false;
      if (stopped) dom.window.close();
      else if (pending) { pending = false; schedule(); }
    }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(rebuild, 100); }
  const absoluteInput = path.resolve(input);
  const onChange = (current, previous) => {
    if (current.mtimeMs !== previous.mtimeMs || current.ctimeMs !== previous.ctimeMs || current.size !== previous.size || current.ino !== previous.ino || current.nlink !== previous.nlink) schedule();
  };
  watchFile(absoluteInput, { interval: 300 }, onChange);
  function stop(code = 0) {
    if (stopped) return;
    stopped = true; clearTimeout(timer); unwatchFile(absoluteInput, onChange);
    // A build already in progress completes before the event loop exits.
    if (!building) dom.window.close();
    process.exitCode = code;
  }
  process.once('SIGINT', () => stop());
  process.once('SIGTERM', () => stop());
  try {
    building = true;
    await build();
    building = false;
    if (pending) { pending = false; schedule(); }
    process.stdout.write(`Watching ${input} for changes. Press Ctrl+C to stop.\n`);
  } catch (error) { building = false; stop(1); throw error; }
}

main(process.argv.slice(2)).catch(error => { process.stderr.write(`render: ${error.message}\n`); process.exitCode = 1; });
