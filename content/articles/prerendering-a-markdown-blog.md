---
title: 'How this site turns Markdown into a fast React publication'
slug: 'prerendering-a-markdown-blog'
description: 'A technical tour of Ponkcoding: validated Markdown, generated TypeScript, route and article-level code splitting, client-side navigation, and the trade-offs behind the architecture.'
date: '2026-06-12'
updated: '2026-07-07'
category: 'Web Development'
tags:
  - react
  - vite
  - static-sites
  - markdown
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/prerendering-markdown-blog-cover.jpg'
featured: true
---

Ponkcoding is a static publication built with React 18, TypeScript, and Vite. Markdown is the source of truth, but the browser does not fetch or parse Markdown. A build-time script validates every article, converts its body to HTML, and emits typed TypeScript modules that Vite can split into small chunks.

There is an important distinction in that description: this site is **not prerendered yet**. The server returns the same application shell for every route, then React renders the requested page in the browser. What is static today is the content source and the build output—not one complete HTML document per article.

This article documents the implementation that is running now, including where JavaScript is used, what is loaded on each route, and where prerendering fits next.

## The architecture in one diagram

The system has two separate lifecycles. Publishing turns author-owned Markdown into JavaScript assets. Reading loads only the assets needed for the current route and article.

```text
AUTHORING AND BUILD

content/articles/*.md
        │
        ▼
gray-matter ── validate frontmatter ── exclude production drafts
        │
        ▼
remark-parse + remark-gfm
        │
        ▼
remark-rehype + rehype-slug + autolink headings
        │
        ├──► src/generated/content-index.ts
        │      metadata only: title, slug, dates, tags, reading time
        │
        └──► src/generated/articles/<slug>.ts
               one { html, headings } module per article
                       │
                       ▼
                  tsc + Vite
                       │
                       ▼
                  dist/ assets

READING

request /articles/:slug
        │
        ▼
index.html + shared React/router shell
        │
        ▼
lazy Article page JS + Article CSS
        │
        ├──► metadata index
        └──► requested article body chunk only
```

The generated directory is disposable. It is ignored by Git and rebuilt before development and production builds, so the Markdown files remain the only content that an author edits.

## Why React is still in the browser

This site is a single-page application. `BrowserRouter` owns navigation, and every page component is loaded through `React.lazy`. The shared entry chunk contains React, the router, global styles, and the small application shell; Home, Article, Profile, and Design System live in separate chunks.

The route setup is deliberately explicit:

```tsx
const Home = lazy(() =>
  import('./pages/Home/Home.tsx').then((m) => ({ default: m.Home })),
)

const Article = lazy(() =>
  import('./pages/Article/Article.tsx').then((m) => ({ default: m.Article })),
)

<Suspense fallback={null}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/articles/:slug" element={<Article />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/design-system" element={<DesignSystem />} />
  </Routes>
</Suspense>
```

That pattern prevents a static import from pulling every page into the initial bundle. Page-specific SCSS is imported inside its page component for the same reason: visiting Home does not require Article or Design System CSS.

Internal links use React Router's `Link`, so moving between pages does not reload the document or refetch the shared bundle. A small `ScrollManager` watches the current path and hash. It scrolls to the top on normal navigation and retries hash targets across animation frames because a target may not exist until a lazy page has mounted.

## Markdown is compiled, not interpreted

The content generator runs through `predev` and `prebuild`. It reads every file in `content/articles`, parses YAML frontmatter with `gray-matter`, and fails early when required fields are absent or malformed.

```typescript
function validate(file: string, data: Record<string, unknown>) {
  if (!data.title || typeof data.title !== 'string') fail(file, 'title is required')

  if (typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date))
    fail(file, 'date must be an ISO date (YYYY-MM-DD)')

  if (!Array.isArray(data.tags)) fail(file, 'tags must be an array')

  if (data.status !== 'draft' && data.status !== 'published')
    fail(file, 'status must be "draft" or "published"')
}
```

Validation makes a broken article a build error instead of a half-rendered production page. The generator also rejects duplicate slugs and, when `NODE_ENV=production`, omits anything whose status is not `published`.

The Markdown body then passes through a unified pipeline:

```typescript
const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
  .use(rehypeHighlight, { plainText: ['text'] })
  .use(collectHeadings(headings))
  .use(rehypeStringify)
  .process(markdown)
```

`remark-gfm` adds tables, task lists, strikethrough, and other GitHub-flavored Markdown syntax. `remark-rehype` crosses from the Markdown syntax tree to an HTML syntax tree. The rehype plugins assign stable IDs to headings, wrap them with anchor links, and highlight fenced code from its language tag. The generated token classes are styled by the lazy Article stylesheet, while `MarkdownContent` adds the copy control after rendering; the highlighter itself never ships to readers.

After the IDs exist, `collectHeadings` walks every `h2` and `h3` and records its depth, ID, and text. That one pass produces both the article HTML and the data needed by the sticky table of contents.

Reading time is intentionally simple: count whitespace-separated words, divide by 200, round, and keep a minimum of one minute. It is an estimate, not a readability model.

## Why the generator emits two kinds of module

A naive implementation could put metadata and rendered HTML for every article into one generated file. That would make the Home page download the entire publication just to show titles and descriptions.

Instead, the generator creates a metadata index and a body module for each slug:

```text
src/generated/
├── content-index.ts
└── articles/
    ├── apple-silicon-local-llm.ts
    ├── designing-an-ai-assistant-server.ts
    └── prerendering-a-markdown-blog.ts
```

`content-index.ts` contains `ArticleMeta[]`: title, slug, description, dates, category, tags, author, status, featured state, and reading time. It contains no article HTML. Home can import this small index to derive the featured story, note list, and topic counts.

Each body module exports only this shape:

```typescript
export interface ArticleBody {
  html: string
  headings: Heading[]
}
```

The split is both a content-model boundary and a performance boundary. Listing surfaces pay for metadata; a reader pays for one body.

## One lazy chunk per article

The Article page uses Vite's `import.meta.glob` to discover generated body modules without importing them eagerly:

```tsx
const bodyLoaders = import.meta.glob<{ body: ArticleBody }>('../../generated/articles/*.ts')

useEffect(() => {
  setBody(null)
  if (!slug) return

  const load = bodyLoaders[`../../generated/articles/${slug}.ts`]
  if (!load) return

  let alive = true
  load().then((module) => {
    if (alive) setBody(module.body)
  })

  return () => {
    alive = false
  }
}, [slug])
```

Vite turns that glob into a map of dynamic import functions. Selecting a slug calls one function and fetches one generated article chunk. The `alive` flag prevents a late import from updating state after navigation or unmounting.

This adds two loading boundaries to a cold article visit:

1. The router fetches the lazy Article page chunk and its co-located CSS.
2. The Article component fetches the body chunk for the requested slug.

That extra request is a conscious trade-off. It keeps unrelated article bodies out of the initial and route chunks, which matters more as the archive grows.

## Rendering trusted HTML

The browser never runs a Markdown parser. It receives an HTML string generated during the build, and the `MarkdownContent` component inserts it into the document:

```tsx
export function MarkdownContent({ html }: { html: string }) {
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
```

`dangerouslySetInnerHTML` deserves the name. It is acceptable here only because all Markdown is committed and reviewed by the site owner. The current pipeline does not sanitize HTML for hostile input. If article content ever comes from users, a CMS, or another trust boundary, sanitization must happen before rendering.

## What the Article page adds at runtime

The article template combines generated content with a few small browser behaviors:

- It finds metadata by matching the route slug against the generated index.
- It loads the corresponding body module and shows a loading state in the article column.
- A passive scroll listener calculates reading progress and updates the bar at the top.
- The same listener checks rendered `h2` positions and marks the current table-of-contents entry.
- Related articles come from the metadata index, so they do not load additional bodies.
- Category colors flow through CSS custom properties such as `--accent`, keeping runtime theming out of the stylesheet bundle.

The table of contents uses native same-page hash links. Cross-route navigation uses `Link`. That distinction avoids full document reloads while keeping ordinary browser behavior for jumps inside an article.

## Deployment and deep links

Vite emits hashed JavaScript and CSS assets into `dist/`. The hosting rule in `public/_redirects` sends every unknown request to the application shell:

```text
/*  /index.html  200
```

This rewrite is what makes a direct request to `/articles/prerendering-a-markdown-blog` work on a static host. Without it, the host would look for a physical file at that path and return 404. With it, `index.html` boots React Router, which reads the URL and renders the Article route.

The cost is that the first response is an application shell rather than article HTML. Search engines and link unfurlers that do not execute JavaScript cannot see the full article body. That is the main reason real prerendering remains on the roadmap.

## What ships and what stays at build time

The dependency boundary is deliberate:

| Concern                                  | Runs where    | Ships to readers?                 |
| ---------------------------------------- | ------------- | --------------------------------- |
| React and React Router                   | Browser       | Yes                               |
| Route and article loading                | Browser       | Yes                               |
| SCSS compilation                         | Build         | No                                |
| Frontmatter parsing                      | Build         | No                                |
| Markdown and HTML syntax-tree processing | Build         | No                                |
| Content validation                       | Build         | No                                |
| Generated article HTML                   | Browser asset | Yes, one requested body at a time |

The remark, rehype, `gray-matter`, and `tsx` packages are development dependencies. They execute in Node during generation and do not inflate the shared browser bundle. The runtime dependency list stays at React, React DOM, and React Router.

## Build and CI sequence

The production path is short and reproducible:

```text
npm run build
  ├── prebuild
  │    └── NODE_ENV=production npm run generate:content
  └── build
       ├── tsc -b
       └── vite build
```

Production generation removes drafts before TypeScript and Vite see the generated modules. TypeScript checks the application and generated types. Vite compiles SCSS, resolves dynamic imports, splits chunks, and fingerprints the final assets.

CI installs from the lockfile, verifies Prettier formatting, and runs the same build. This catches invalid frontmatter, duplicate slugs, type errors, formatting drift, and bundling failures in one workflow.

## The performance model

The key optimization is not a clever caching API. It is preventing content from crossing boundaries too early.

On the Home route, the critical path is the shared shell, global CSS, the Home JavaScript chunk, Home CSS, and metadata. Article page code, Article CSS, and body HTML stay outside that path.

On an article route, the browser adds the Article page chunk and exactly one body chunk. Navigating to another article reuses the shell and page code, then downloads only the new body. Because navigation is client-side, there is no white flash or full application restart.

The build output's per-chunk size table is therefore part of the review process. A dependency imported by shared code can quietly tax every route; a page-only dependency imported from that page can remain isolated. The architecture depends on preserving those import boundaries.

## Current limitations and next steps

The current system is static-first, but it is not a finished static publishing engine.

Prerendering is the largest missing piece. The intended result is a physical `index.html` for each public route, containing the article body for first paint and crawlers while preserving React's client-side navigation after boot. That work must retain the current metadata/body split and must not turn every article into an eager initial dependency.

Other planned additions follow the same constraint:

- Pagefind can build a static search index and load its UI only when search opens.
- `sitemap.xml` and `rss.xml` can be generated from the same validated metadata index.
- Custom blocks can run in the build pipeline instead of shipping parsers.
- Mermaid can become build-time SVG output; today Mermaid fences are only ordinary code blocks.

That last point corrects an easy misconception: a static content source does not automatically mean static HTML pages, and build-time Markdown does not automatically mean build-time diagrams. Each capability needs an explicit stage in the pipeline.

## The design principle underneath it

The implementation is small because each layer has one job. Markdown owns content. The generator owns validation and compilation. Generated modules create performance boundaries. React owns page composition and interaction. Vite turns those boundaries into deployable assets. The static host serves the assets and falls back to the SPA shell.

This is enough for a fast personal publication today, without a database, CMS, API, or request-time server. The next improvements can remain build-time features—and the browser can continue downloading only what the current page needs.
