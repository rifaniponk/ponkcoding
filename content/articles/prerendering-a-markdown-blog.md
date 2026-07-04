---
title: "Prerendering a Markdown blog with React, Vite, and zero client JavaScript"
slug: "prerendering-a-markdown-blog"
description: "How this site turns a folder of Markdown files into fast static pages — the build pipeline, the trade-offs, and what I would do differently."
date: "2026-06-12"
updated: "2026-06-28"
category: "Web Development"
tags:
  - react
  - vite
  - static-sites
  - markdown
status: "published"
author: "Rifan Fauzi"
featured: true
---

Every few years I rebuild this site, and every rebuild teaches me something about the gap between what the web offers and what a personal publication actually needs. This time the answer was almost embarrassingly simple: Markdown files in a folder, React as a templating language, and a build step that leaves nothing behind but HTML.

## Why static, why now

A personal blog has maybe a dozen page templates and a few hundred documents. Nothing about that requires a server, a database, or client-side hydration. What it does require is durability — I want these notes to render identically in ten years.

> The fastest JavaScript is the JavaScript you never ship.

So the constraint for this rebuild: the reader downloads HTML, CSS, and images. Nothing else. React still gets to do what it is genuinely good at — composing templates — but only at build time.

## The build pipeline

The whole engine is four stages. Markdown goes in one end; a deployable `dist/` folder comes out the other.

```text
content/*.md  →  parse + frontmatter  →  react render  →  static html
```

## Project structure

Everything content-related lives in one folder, so writing never touches the code tree.

```text
ponkcoding/
├── content/
│   └── articles/
├── scripts/          # md → index pipeline
├── src/
│   ├── generated/    # build output, gitignored
│   └── pages/
└── vite.config.ts
```

## Prerendering with Vite

A small script walks the content folder at build time, renders each document through the Markdown pipeline, and emits a typed content index.

```typescript
// Render every markdown route to a static file
export async function prerender(routes: Route[]) {
  for (const route of routes) {
    const html = renderToStaticMarkup(<ArticlePage doc={route.doc} />);
    await writeFile(route.outFile, '<!doctype html>' + html);
  }
}
```

```bash
$ npm run build
✓ 214 documents rendered in 3.1s
$ netlify deploy --prod
```

> **Note:** Mermaid diagrams will render to SVG at build time too, so readers never download the Mermaid runtime. The source stays in the Markdown file as a fenced block.

## Trade-offs and honest costs

Static means every interactive idea has to justify a build-time answer. Search became a prebuilt index. Comments became email. The discipline is the feature — but it is a real constraint, and it will not suit every project.

> **Caution:** Prerendering 200+ pages on every deploy sounds slow, but isn't — the render is the cheap part. Watch your image pipeline instead; that is where build minutes go to die.

## What I'd do differently

Start with the content model, not the stack. The engine took a weekend; deciding what a "note" versus an "essay" versus a "lab entry" is took a month of writing to figure out. Next rebuild, the folder structure comes first.
