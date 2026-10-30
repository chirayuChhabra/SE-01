import { Marked } from 'marked';
import createDOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';

export function createRenderer(window) {
  const purifier = createDOMPurify(window);
  const parser = new Marked({ gfm: true, breaks: false });
  parser.use({ renderer: {
    code({ text, lang }) {
      const language = (lang || '').split(/\s/)[0];
      const known = language && hljs.getLanguage(language);
      const code = known ? hljs.highlight(text, { language }).value : escapeHTML(text);
      return `<div class="code-block"><div class="code-label">${escapeHTML(language || 'text')}</div><pre><code class="hljs">${code}</code></pre></div>`;
    },
    blockquote({ tokens }) {
      const html = this.parser.parse(tokens);
      const match = html.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i);
      if (!match) return `<blockquote>${html}</blockquote>`;
      const kind = match[1].toLowerCase();
      return `<aside class="callout ${kind}"><div class="callout-title">${kind[0].toUpperCase() + kind.slice(1)}</div>${html.replace(match[0], '<p>')}</aside>`;
    },
  }});
  return (markdown) => {
    const safe = purifier.sanitize(parser.parse(markdown), { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'input', 'form', 'iframe', 'object'], FORBID_ATTR: ['style'] });
    const template = window.document.createElement('template');
    template.innerHTML = safe;
    template.content.querySelectorAll('table').forEach(table => {
      const wrap = window.document.createElement('div'); wrap.className = 'table-wrap'; table.replaceWith(wrap); wrap.append(table);
    });
    template.content.querySelectorAll('a').forEach(a => { a.rel = 'noopener noreferrer'; });
    template.content.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; });
    return template.innerHTML;
  };
}
export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export function exportDocument(html, css, theme, title) {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHTML(title)}</title><style>${css}</style></head><body><main class="document theme-${['editorial','minimal','midnight'].includes(theme) ? theme : 'editorial'}">${html}</main></body></html>`;
}
