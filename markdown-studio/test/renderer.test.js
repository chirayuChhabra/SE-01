import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createRenderer, exportDocument } from '../src/renderer.js';
import { sample } from '../src/sample.js';
const window = new JSDOM('').window;
const render = createRenderer(window);

test('sample renders semantic lesson blocks and highlighted code',()=>{
  const html=render(sample);
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('h1').length,1);
  assert.equal(doc.querySelectorAll('table tbody tr').length,3);
  assert.equal(doc.querySelectorAll('.callout').length,2);
  assert.ok(doc.querySelector('.callout.tip'));
  assert.ok(doc.querySelector('.hljs-keyword'));
  assert.ok(doc.querySelector('blockquote'));
  assert.ok(doc.querySelector('.table-wrap table'));
});

test('unsafe HTML and URLs cannot execute in preview or export',()=>{
  const html=render('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n<iframe src="https://example.com"></iframe><style>body{display:none}</style>');
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelector('script,iframe,style,[onerror],a[href^="javascript:"]'),null);
});

test('callouts retain formatted content and ordinary quotes remain quotes',()=>{
  const doc=new JSDOM(render('> [!WARNING]\n> **Be careful** with the denominator.\n\n> An ordinary quotation.')).window.document;
  assert.equal(doc.querySelector('.warning strong').textContent,'Be careful');
  assert.equal(doc.querySelector('blockquote').textContent.trim(),'An ordinary quotation.');
});

test('standalone export preserves theme and styles and escapes the title',()=>{
  const html=exportDocument(render('# Hello'),'.document{color:blue}','midnight','</title><script>alert(1)</script>');
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelector('script'),null);
  assert.equal(doc.querySelector('main').className,'document theme-midnight');
  assert.equal(doc.querySelector('style').textContent,'.document{color:blue}');
  assert.equal(doc.querySelector('h1').textContent,'Hello');
});

