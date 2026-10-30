# render

A command-line Markdown renderer that creates a styled HTML page. The page embeds its CSS and works offline once generated.

## Install and use

Requires Node.js 20.19+, 22.12+, or 24+.

```sh
cd markdown-studio
npm install
npm link

render main.md
render main.md -watch
```

Each command writes `main.html` next to `main.md`, replacing an existing output. Watch mode builds immediately, then rebuilds whenever the Markdown file changes. Stop it with Ctrl+C. Refresh an open browser page to see changes; watch mode does not run a server or refresh the browser automatically.

Without a global link, run `node bin/render.js main.md` from this directory.

```sh
render main.md --output lesson.html
render main.md --theme minimal
render main.md --theme midnight -watch
render main.md --output - > lesson.html
render --help
```

`--output -` prints a single HTML document to stdout. Watch mode also accepts `--watch` or `-w`; it requires a file output. The output is written atomically, so a failed build leaves the previous HTML in place.

The renderer supports headings, lists, links, images, tables, quotes, syntax-highlighted code, and GitHub-style callouts such as `> [!TIP]`. It sanitizes HTML and removes executable embeds. Images referenced by URL remain external; relative image paths resolve relative to the generated HTML file. GFM task checkboxes are currently omitted by the sanitizer.

Run `npm test` to check the renderer and CLI. This is a standalone renderer; it does not implement the adaptive engine or reuse mr-md code. It uses marked, DOMPurify, jsdom, and highlight.js.
