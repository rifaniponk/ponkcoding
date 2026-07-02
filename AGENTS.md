# AGENTS.md

Guidance for AI agents (and humans) working in this repo. Ponkcoding is a
personal publication — "The Field Journal" — built as a React + Vite + TS
single-page app. **Performance is a first-class requirement: the initial
bundle must stay as small as possible, and every page is lazy-loaded.**

## Stack

- React 18, TypeScript (strict), Vite 5
- Routing: `react-router-dom` v6
- Styling: plain CSS with design tokens as CSS custom properties on `:root`.
  No CSS framework, no CSS-in-JS runtime.
- No state library, no data layer — content is static.

## Commands

```
npm run dev        # Vite dev server (HMR)
npm run build      # tsc -b type-check, then vite build → dist/
npm run preview    # serve the production build (SPA fallback)
```

Always run `npm run build` before committing UI changes — it type-checks and
prints the per-chunk size table. Read that table (see Performance below).

## Project structure

```
index.html          # single entry; Google Fonts <link> lives here
src/
├── main.tsx         # createRoot + BrowserRouter + lazy routes + Suspense
├── index.css        # shared: tokens, reset, keyframes, header/footer,
│                    #   pill, callout, block — anything used by 2+ pages
├── Home.tsx / Home.css
├── Article.tsx / Article.css
└── DesignSystem.tsx / DesignSystem.css
```

One route = one page component = one co-located CSS file. The CSS file is
imported *inside* the page component (not in `main.tsx`), so Vite bundles it
into that route's chunk and only ships it when the route loads.

## Performance rules (do not regress these)

1. **Every page is lazy-loaded.** Routes use `React.lazy(() => import(...))`
   under a single `<Suspense>` in `main.tsx`. Never add a static top-level
   `import` of a page component — that pulls it into the initial bundle.
   New page → add a `lazy(...)` route, same pattern.

2. **Per-route CSS.** Page-specific styles live in that page's own `.css`,
   imported from the page component. Only put a rule in `index.css` when 2+
   pages genuinely share it. When something stops being shared, move it out.

3. **Keep the initial bundle minimal.** After `npm run build`, the initial
   critical path for `/` is: `index.js` (React + router + shell) +
   `index.css` + the `Home` chunk + `Home.css`. Article/DesignSystem JS+CSS
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
- Repeated markup is data-driven: define a typed array (`NOTES`, `TOPICS`,
  `LAB`, `HEADINGS`, …) and `.map()` it. Don't hand-repeat cards.
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
Navigating between `/`, `/article`, and `/design-system` must stay client-side
(no white flash, no document reload, shared bundle not re-fetched).

- **Cross-route links use react-router `<Link to="...">`, never `<a href>`.**
  A plain `<a>` to an internal route triggers a full document load — do not
  use it for `/`, `/article`, `/design-system` (with or without a hash, e.g.
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
- Deep links / refreshes on `/article` and `/design-system` rely on SPA
  fallback (dev server + `vite preview` provide it; configure the host the
  same way — e.g. Netlify `/* -> /index.html 200`).
- New page → add a `lazy(...)` route AND link to it with `<Link>`.
