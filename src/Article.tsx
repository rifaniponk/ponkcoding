import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Article.css'

const HOME = '/'

interface Heading {
  id: string
  label: string
}

const HEADINGS: Heading[] = [
  { id: 'why-static', label: 'Why static, why now' },
  { id: 'pipeline', label: 'The build pipeline' },
  { id: 'project-structure', label: 'Project structure' },
  { id: 'prerendering', label: 'Prerendering with Vite' },
  { id: 'trade-offs', label: 'Trade-offs and honest costs' },
  { id: 'what-next', label: "What I'd do differently" },
]

const RELATED = [
  {
    cat: 'Ponkcoding Notes',
    title: 'How this site is built: the static engine behind Ponkcoding',
    meta: 'May 24, 2026 · 9 min',
  },
  {
    cat: 'AI Engineering',
    title: 'Designing an AI assistant server that stays out of the way',
    meta: 'Jun 26, 2026 · 11 min',
  },
  {
    cat: 'Indie Dev',
    title: 'Shipping Ayatura: notes from a two-week build',
    meta: 'Jun 11, 2026 · 7 min',
  },
]

export interface ArticleProps {
  accent?: string
  showToc?: boolean
}

export function Article({ accent = '#5F6B4A', showToc = true }: ArticleProps) {
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState('why-static')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      let active = 'why-static'
      document.querySelectorAll<HTMLElement>('h2[data-toc]').forEach((h) => {
        if (h.getBoundingClientRect().top < 140) active = h.id
      })
      setActiveId(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const copyCode = () => {
    const pre = document.querySelector<HTMLElement>('.code-block pre')
    if (pre && navigator.clipboard) navigator.clipboard.writeText(pre.innerText).catch(() => {})
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  const scrollTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page" style={{ ['--accent' as string]: accent }} id="top">
      <div className="progress-bar" style={{ width: `${(progress * 100).toFixed(1)}%` }} />

      {/* ---------- Header ---------- */}
      <header className="header">
        <div className="header__inner">
          <Link to={HOME} className="brand">
            <span className="brand__name">Ponkcoding</span>
            <span className="dot" />
          </Link>
          <nav className="nav">
            <Link to={`${HOME}#notes`} className="nav__link">Notes</Link>
            <Link to={`${HOME}#topics`} className="nav__link">Topics</Link>
            <Link to={`${HOME}#lab`} className="nav__link">Lab</Link>
            <Link to={`${HOME}#about`} className="nav__link">About</Link>
          </nav>
          <span className="header__kbd">⌘K</span>
        </div>
      </header>

      {/* ---------- Article header ---------- */}
      <section className="art-head">
        <div className="art-head__inner">
          <div className="art-head__meta-top">
            <Link to={`${HOME}#topics`} className="art-head__cat">Web Development</Link>
            <span className="art-head__no">Essay · No. 42</span>
          </div>
          <h1 className="art-head__title">
            Prerendering a Markdown blog with React, Vite, and zero client JavaScript
          </h1>
          <p className="art-head__lede">
            How this site turns a folder of Markdown files into fast static pages — the build
            pipeline, the trade-offs, and what I would do differently.
          </p>
          <div className="art-head__byline">
            <span><span className="label">By</span> Rifan Fauzi</span>
            <span><span className="label">Published</span> Jun 12, 2026</span>
            <span><span className="label">Updated</span> Jun 28, 2026</span>
            <span className="read-time">14 min read</span>
          </div>
        </div>
        <div className="art-head__cover">
          <span className="placeholder-tag">
            cover image — 21:9, calm photographic or abstract paper texture
          </span>
        </div>
      </section>

      {/* ---------- Body + TOC ---------- */}
      <div className="art-layout">
        <article className="prose">
          <p className="prose__intro">
            <span className="prose__dropcap">E</span>very few years I rebuild this site, and every
            rebuild teaches me something about the gap between what the web offers and what a
            personal publication actually needs. This time the answer was almost embarrassingly
            simple: Markdown files in a folder, React as a templating language, and a build step
            that leaves nothing behind but HTML.
          </p>

          <h2 id="why-static" data-toc="Why static, why now">
            <span className="sec-no">§1</span>Why static, why now
          </h2>
          <p>
            A personal blog has maybe a dozen page templates and a few hundred documents. Nothing
            about that requires a server, a database, or client-side hydration. What it does require
            is durability — I want these notes to render identically in ten years.
          </p>
          <blockquote>The fastest JavaScript is the JavaScript you never ship.</blockquote>
          <p>
            So the constraint for this rebuild: the reader downloads HTML, CSS, and images. Nothing
            else. React still gets to do what it is genuinely good at — composing templates — but
            only at build time.
          </p>

          <h2 id="pipeline" data-toc="The build pipeline">
            <span className="sec-no">§2</span>The build pipeline
          </h2>
          <p>
            The whole engine is four stages. Markdown goes in one end; a deployable{' '}
            <code>dist/</code> folder comes out the other.
          </p>

          <figure className="fig">
            <figcaption className="fig__cap">
              <span className="fig__cap-label">fig. 01 — build pipeline</span>
              <span className="fig__cap-meta">mermaid</span>
            </figcaption>
            <div className="diagram">
              <span className="diagram__node">content/*.md</span>
              <span className="diagram__arrow">→</span>
              <span className="diagram__node">parse + frontmatter</span>
              <span className="diagram__arrow">→</span>
              <span className="diagram__node">react render</span>
              <span className="diagram__arrow">→</span>
              <span className="diagram__node diagram__node--accent">static html</span>
            </div>
          </figure>

          <h2 id="project-structure" data-toc="Project structure">
            <span className="sec-no">§3</span>Project structure
          </h2>
          <p>Everything content-related lives in one folder, so writing never touches the code tree.</p>

          <div className="block block--tree">
            <div className="block__head">
              <span className="block__head-label">file tree</span>
              <span className="block__head-meta">ponkcoding/</span>
            </div>
            <pre>{`ponkcoding/
├── content/
│   ├── ai-engineering/
│   ├── web-development/
│   └── indie-dev/
├── src/
│   ├── templates/       `}<span className="comment"># React page templates</span>{`
│   ├── engine/          `}<span className="comment"># md → html pipeline</span>{`
│   └── styles/
├── public/
└── vite.config.ts`}</pre>
          </div>

          <h2 id="prerendering" data-toc="Prerendering with Vite">
            <span className="sec-no">§4</span>Prerendering with Vite
          </h2>
          <p>
            A small Vite plugin walks the content folder at build time, renders each document
            through <code>renderToStaticMarkup</code>, and emits one HTML file per route.
          </p>

          <figure className="code-block">
            <figcaption className="code-block__cap">
              <span className="code-block__file">engine/prerender.ts</span>
              <span className="code-block__lang">typescript</span>
              <button className="code-block__copy" onClick={copyCode}>
                {copied ? 'copied ✓' : 'copy'}
              </button>
            </figcaption>
            <pre>
<span className="cm">{'// Render every markdown route to a static file'}</span>{'\n'}
<span className="kw">export async function</span> <span className="fn">prerender</span>{'(routes: '}<span className="ty">Route</span>{'[]) {\n'}
{'  '}<span className="kw">for</span>{' ('}<span className="kw">const</span>{' route '}<span className="kw">of</span>{' routes) {\n'}
{'    '}<span className="kw">const</span>{' html = renderToStaticMarkup(\n'}
{'      <'}<span className="ty">ArticlePage</span>{' doc={route.doc} />\n'}
{'    );\n'}
{'    '}<span className="kw">await</span>{' writeFile(route.outFile, '}<span className="st">'&lt;!doctype html&gt;'</span>{' + html);\n'}
{'  }\n'}
{'}'}
            </pre>
          </figure>

          <div className="block block--term">
            <div className="block__head">
              <span className="block__head-label">terminal</span>
              <span className="block__head-meta">zsh</span>
            </div>
            <pre>
<span className="term__prompt">{'$ '}</span>{'npm run build\n'}
<span className="term__out">{'✓ 214 documents rendered in 3.1s'}</span>{'\n'}
<span className="term__prompt">{'$ '}</span>{'netlify deploy --prod'}
            </pre>
          </div>

          <aside className="callout">
            <p className="callout__label">
              <span className="dot" />
              <span style={{ color: 'var(--accent)' }}>Note</span>
            </p>
            <p className="callout__body">
              Mermaid diagrams are rendered to SVG at build time too, so readers never download the
              Mermaid runtime. The source stays in the Markdown file as a fenced block.
            </p>
          </aside>

          <h2 id="trade-offs" data-toc="Trade-offs and honest costs">
            <span className="sec-no">§5</span>Trade-offs and honest costs
          </h2>
          <p>
            Static means every interactive idea has to justify a build-time answer. Search became a
            prebuilt index. Comments became email. The discipline is the feature — but it is a real
            constraint, and it will not suit every project.
          </p>

          <aside className="callout">
            <p className="callout__label">
              <span className="dot" style={{ background: '#4E5F6B' }} />
              <span style={{ color: '#4E5F6B' }}>Caution</span>
            </p>
            <p className="callout__body">
              Prerendering 200+ pages on every deploy sounds slow, but isn’t — the render is the
              cheap part. Watch your image pipeline instead; that is where build minutes go to die.
            </p>
          </aside>

          <h2 id="what-next" data-toc="What I'd do differently">
            <span className="sec-no">§6</span>What I’d do differently
          </h2>
          <p>
            Start with the content model, not the stack. The engine took a weekend; deciding what a
            “note” versus an “essay” versus a “lab entry” is took a month of writing to figure out.
            Next rebuild, the folder structure comes first.
            <span className="prose__end-dot" />
          </p>

          <div className="art-tags">
            <span className="art-tags__label">Tags</span>
            {['#react', '#vite', '#static-sites', '#markdown'].map((t) => (
              <Link key={t} to={`${HOME}#topics`} className="art-tag">
                {t}
              </Link>
            ))}
          </div>

          <div className="author">
            <div className="author__avatar" />
            <div className="author__meta">
              <p className="author__name">Rifan Fauzi</p>
              <p className="author__bio">
                Software engineer, content creator, indie developer, and technical explorer. Writing
                Ponkcoding one note at a time.
              </p>
            </div>
            <Link to={`${HOME}#about`} className="author__link">About →</Link>
          </div>
        </article>

        {/* ---------- Sticky TOC ---------- */}
        {showToc && (
          <aside className="toc">
            <p className="toc__label">On this page</p>
            <nav className="toc__nav">
              {HEADINGS.map((h) => {
                const active = h.id === activeId
                return (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="toc__item"
                    style={{ color: active ? 'var(--ink)' : 'var(--faint)', fontWeight: active ? 600 : 400 }}
                  >
                    <span
                      className="toc__marker"
                      style={{ background: active ? 'var(--accent)' : 'transparent' }}
                    />
                    {h.label}
                  </a>
                )
              })}
            </nav>
            <div className="toc__top">
              <a href="#top" onClick={scrollTop}>↑ Back to top</a>
            </div>
          </aside>
        )}
      </div>

      {/* ---------- Related ---------- */}
      <section className="related">
        <div className="related__inner">
          <p className="related__label">Keep reading</p>
          <div className="related__grid">
            {RELATED.map((r) => (
              <Link key={r.title} to={`${HOME}#notes`} className="related-card">
                <span className="related-card__cat">{r.cat}</span>
                <span className="related-card__body">
                  <span className="related-card__title">{r.title}</span>
                  <span className="related-card__meta">{r.meta}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Footer (compact) ---------- */}
      <footer className="footer--compact">
        <div className="footer__inner">
          <Link to={HOME} className="brand">
            <span className="brand__name">Ponkcoding</span>
            <span className="dot" />
          </Link>
          <span className="footer__fine">© 2026 · Built with React, Vite &amp; Markdown · Netlify</span>
        </div>
      </footer>
    </div>
  )
}
