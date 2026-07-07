# AGENTS.md

Guidance for AI agents (and humans) working in this repo. Ponkcoding is a
personal publication — "The Field Journal" — built as a React + Vite + TS
single-page app. **Performance is a first-class requirement: the initial
bundle must stay as small as possible, and every page is lazy-loaded.**

## Stack

- React 18, TypeScript (strict), Vite 5
- Routing: `react-router-dom` v6
- Styling: SCSS (Vite built-in, `sass` dart-sass) with design tokens as CSS
  custom properties on `:root`. No CSS framework, no CSS-in-JS runtime. Keep
  runtime theming in CSS variables; use SCSS for nesting/vars/mixins at authoring
  time only.
- No state library, no data layer — content is static.

## Commands

```
npm run dev              # generate content, then Vite dev server (HMR)
npm run build            # generate content (prod), tsc -b, vite build → dist/
npm run preview          # serve the production build (SPA fallback)
npm run generate:content # regenerate src/generated/ from content/ Markdown
npm run format           # Prettier: format the repo
npm run format:check     # Prettier: verify formatting (CI runs this)
```

Formatting is Prettier (config in `.prettierrc.json`: no semicolons, single
quotes, 100 print width). CI (`.github/workflows/ci.yml`) fails on unformatted
files, so run `npm run format` before committing.

`predev` / `prebuild` run `generate:content` automatically, so `src/generated/`
is a build artifact (gitignored) — never edit or commit it. Always run
`npm run build` before committing UI changes — it type-checks and prints the
per-chunk size table. Read that table (see Performance below).

## Project structure

```
content/
└── articles/*.md       # source of truth: one Markdown file per article
scripts/
└── generate-content-index.ts   # md → validate → html → generated TS
index.html              # single entry; Google Fonts <link> lives here
src/
├── main.tsx            # createRoot + BrowserRouter + lazy routes + Suspense
├── vite-env.d.ts
├── styles/
│   ├── tokens.scss     # design tokens: :root CSS custom properties
│   └── global.scss     # @use tokens; reset, keyframes, header/footer, …
├── pages/              # one route = one folder (component + co-located SCSS)
│   ├── Home/Home.tsx + Home.scss + Home.data.ts
│   ├── Article/Article.tsx + Article.scss
│   └── DesignSystem/DesignSystem.tsx + DesignSystem.scss + DesignSystem.data.ts
├── components/         # reusable UI library — import from the barrel
│   ├── index.ts        # barrel: Button, Pill, Tag, TextLink, Callout, Dot, …
│   ├── Button/Button.tsx + Button.scss
│   ├── Pill/…  Tag/…  TextLink/…  Callout/…  Dot/…
│   └── MarkdownContent.tsx     # renders trusted build-time HTML
├── lib/                # shared non-UI helpers
│   ├── content-types.ts        # ArticleMeta / ArticleBody / Heading
│   ├── categories.ts           # category → accent-color map
│   └── format.ts               # date helpers
└── generated/          # BUILD ARTIFACT (gitignored) — do not edit
    ├── content-index.ts        # ARTICLES: metadata only, no HTML
    └── articles/<slug>.ts       # per-article { html, headings } body chunk
```

Folders by role: `pages/` (one folder per route: component + its CSS), `components/`
(reusable UI), `lib/` (types, config, helpers — no JSX), `styles/` (shared CSS),
`generated/` (build output). Keep new files in the folder that matches their
role; don't let `src/` go flat again.

One route = one page component = one co-located CSS file. The CSS file is
imported _inside_ the page component (not in `main.tsx`), so Vite bundles it
into that route's chunk and only ships it when the route loads.

**Content data split (keep this):** listing surfaces (Home) import
`content-index.ts` — metadata only, so no article HTML ever lands in the Home
chunk. Article bodies load lazily, one chunk per slug, via
`import.meta.glob('../../generated/articles/*.ts')` in `pages/Article/Article.tsx`. Never import a
`generated/articles/*` module statically, and never add `html` to the metadata
index.

## Performance rules (do not regress these)

1. **Every page is lazy-loaded.** Routes use `React.lazy(() => import(...))`
   under a single `<Suspense>` in `main.tsx`. Never add a static top-level
   `import` of a page component — that pulls it into the initial bundle.
   New page → add a `lazy(...)` route, same pattern.

2. **Per-route SCSS.** Page-specific styles live in that page's own `.scss`,
   imported from the page component. Only put a rule in `styles/global.scss` when
   2+ pages genuinely share it. When something stops being shared, move it out.

3. **Keep the initial bundle minimal.** After `npm run build`, the initial
   critical path for `/` is: `index.js` (React + router + shell) + `global`
   CSS + the `Home` chunk + `Home` CSS. Article/DesignSystem JS+CSS
   must NOT appear on that path. If a change makes them load eagerly, fix it.

   Rough current baseline (gzip): shared JS ~52 KB, shared CSS ~1.4 KB, each
   page chunk ~4 KB JS + 1.5–2.6 KB CSS. The 52 KB is React + react-router;
   that is the floor — don't add heavy deps that inflate the shared chunk.

4. **Think before adding a dependency.** A new runtime dep lands in the shared
   bundle and is paid on first paint of every page. Prefer a few lines of code
   over a library. If a dep is only needed by one page, ensure it tree-shakes
   into that page's chunk (import it only from that page).

5. **Fonts** are loaded via `<link>` with `display=swap` in `index.html`.
   Keep the family list minimal.

## React conventions

- Function components + hooks only. No class components.
- Named exports for pages (`export function Home()`), matched in the lazy
  loader: `lazy(() => import('./Home.tsx').then(m => ({ default: m.Home })))`.
- Props are typed via an exported interface (`HomeProps`, `ArticleProps`) with
  sensible defaults in the signature — mirrors the design's configurable props
  (e.g. `accent`, `showHeroIndex`, `showToc`).
- Repeated markup is data-driven: define a typed array (`LAB`, `SWATCHES`,
  `PROFILE_FACTS`, …) and `.map()` it. Don't hand-repeat cards.
- Reuse the shared UI primitives from `src/components` (`import { Button, Tag,
Callout, … } from '../../components'`) instead of hand-writing their
  className strings. Each component owns its markup **and** its co-located
  `.scss`, so it drops into any page without copying styles. New primitive that
  repeats across pages → add a `components/<Name>/<Name>.tsx` + `.scss` and
  export it from the barrel; don't scatter the CSS into page files. The
  `/design-system` route is the living showcase — render specimens there via the
  real components, never re-mocked markup.
- Static page data lives in a co-located `<Page>.data.ts` (e.g.
  `pages/Home/Home.data.ts`, `pages/DesignSystem/DesignSystem.data.ts`), not
  inline in the component. Keep _derived_ data (computed from `ARTICLES`, e.g.
  Home's `FEATURED`/`NOTES`/`TOPICS`) in the component — it's logic, not content.
- Side effects (scroll listeners, IntersectionObserver, keydown, clipboard)
  go in `useEffect` with cleanup. Passive listeners for scroll.
- Respect `prefers-reduced-motion` (already handled for `.reveal`).
- The brand accent is driven by the `--accent` CSS variable set inline on the
  page root; category colors are passed as inline `--cat`/`--status`/
  `--row-hover` custom properties. Keep color theming in CSS variables, not
  hardcoded per element, so a future dark mode is one token swap.

## Styling conventions

- BEM-ish class names (`block__element--modifier`). No inline style objects
  except for dynamic values (a computed color, width, transition-delay).
- Sharp corners everywhere except pills (`border-radius: 999px`). 2px ink
  rules open sections. Mono font is for metadata/labels/code only — never
  headings or body. See the `/design-system` route for the full spec.

## Routing rules (SPA navigation is mandatory)

**A full-page reload / redirection on in-app navigation is NOT acceptable.**
Navigating between `/`, `/articles/:slug`, `/profile`, and `/design-system` must
stay client-side (no white flash, no document reload, shared bundle not re-fetched).

- **Cross-route links use react-router `<Link to="...">`, never `<a href>`.**
  A plain `<a>` to an internal route triggers a full document load — do not
  use it for `/`, `/articles/:slug`, `/profile`, `/design-system` (with or without a hash, e.g.
  `<Link to="/#notes">`). Applies everywhere: nav, cards, footers, tags,
  mapped lists.
- **Same-page hash jumps** (e.g. `#notes` while already on `/`) stay as
  `<a href="#notes">` — native, no reload, no router needed. `#top`
  back-to-top with an `onClick` handler also stays `<a>`.
- **Hash scrolling across routes** is handled by `ScrollManager` in
  `main.tsx` (a `useLocation` effect): on navigation it scrolls to the hash
  target, else to the top. It retries across frames because the target may
  not be mounted until the lazy page chunk resolves. Don't add per-page
  scroll hacks — extend `ScrollManager` if behavior needs to change.
- Deep links / refreshes on `/articles/:slug`, `/profile`, and `/design-system` rely on SPA
  fallback (dev server + `vite preview` provide it; configure the host the
  same way — e.g. Netlify `/* -> /index.html 200`, currently in
  `public/_redirects`).
- New page → add a `lazy(...)` route AND link to it with `<Link>`.

## Design direction

The site is a personal publication — "The Field Journal" — and should read like
a serious editorial publication by a technical person, **not** a stereotypical
programmer site. Aim for: calm, premium, editorial, content-first, readable,
distinctive.

Avoid the clichés — do not make it look like a generic dev portfolio, a
terminal-themed coding blog, a SaaS landing page, a hacker/cyberpunk site, a
Tailwind template clone, or a rendered GitHub README. Specifically avoid: matrix
rain, terminal/fake-code backgrounds, neon-green-on-black, cyberpunk effects,
excessive gradients, overused glassmorphism, generic dashboard layouts.

Prefer: warm off-white/paper background, charcoal text, muted accents, tasteful
typography, strong spacing, subtle dividers, calm transitions. The
`/design-system` route is the reference for the full visual spec.

## Content language & tone

All site content and UI copy is **English** — articles, notes, headings, labels,
and marketing/brand copy. The audience is global ("working worldwide"). Keep the
tone credible, direct, and practical; avoid over-complication. Repository docs
and code comments are English too.

## Non-goals (don't add without an explicit request)

Keep this static and dependency-light. Do not introduce a backend server,
database, CMS, hosted search service (e.g. Algolia), auth, comments system, or
request-time SSR. Do not migrate to Next.js, Astro, Gatsby, or Remix. Reading
content must never require an API. When in doubt, prefer build-time work and a
few lines of code over a new runtime service or heavy dependency.

## Content pipeline (built)

Markdown is the source of truth for articles. `scripts/generate-content-index.ts`
runs at build time (via `predev`/`prebuild`):

1. Read `content/articles/*.md`, parse frontmatter (`gray-matter`).
2. Validate frontmatter (see model below); fail the build on any error.
3. Exclude `status: draft` when `NODE_ENV=production`.
4. Convert Markdown → HTML with `unified` (remark-parse, remark-gfm,
   remark-rehype, rehype-slug, rehype-autolink-headings, rehype-stringify),
   collecting h2/h3 headings for the TOC.
5. Emit `src/generated/content-index.ts` (metadata) + one
   `src/generated/articles/<slug>.ts` body chunk each.

The whole remark/rehype stack is a **devDependency** — it runs at build time and
never ships to the browser. `MarkdownContent.tsx` renders the pre-built HTML with
`dangerouslySetInnerHTML`; this is safe because the author owns the Markdown. If
user-generated content is ever added, sanitize before rendering.

**Frontmatter model** (required unless noted): `title`, `slug` (unique),
`description`, `date` (ISO `YYYY-MM-DD`), `category`, `tags` (array),
`status` (`draft` | `published`), `author`; optional `updated` (ISO),
`cover` (absolute `/…` path), `featured` (bool — picks the Home hero).

To add an article: drop a `.md` file in `content/articles/`. Home listings,
topic counts, related links, and the `/articles/:slug` page all derive from it —
no code edits, no hardcoded content.

## Direction / not yet built

Remaining pieces of the static publishing engine:

- **Prerendering** — each route to its own static `index.html` (currently a
  client-rendered SPA with `_redirects` fallback).
- **Pagefind** static search — lazy-loaded, never in the initial bundle.
- **`sitemap.xml` / `rss.xml`** generation.
- **Custom Markdown blocks** — callout, terminal, file tree, Mermaid (today they
  degrade to standard Markdown: blockquotes and plain code fences).
- **Syntax highlighting** for code blocks (rehype-highlight or shiki).
- **Projects (`LAB`) and static pages** are still hardcoded in `Home.tsx` —
  move them to a content type when they need real detail pages.

Keep the static-first and small-initial-bundle rules above as these land, and
update this doc so it stays honest about what's real.
