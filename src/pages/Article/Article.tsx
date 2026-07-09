import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './Article.scss'
import { ARTICLES } from '../../generated/content-index.ts'
import { categoryColor } from '../../lib/categories.ts'
import { MarkdownContent, Tag, ShareButton } from '../../components'
import { formatDate } from '../../lib/format.ts'
import type { ArticleBody } from '../../lib/content-types.ts'

const HOME = '/'

/* One lazy chunk per article body — only the requested slug is fetched. */
const bodyLoaders = import.meta.glob<{ body: ArticleBody }>('../../generated/articles/*.ts')

export function Article() {
  const { slug } = useParams<{ slug: string }>()
  const meta = ARTICLES.find((a) => a.slug === slug)

  const [body, setBody] = useState<ArticleBody | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState('')
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    setBody(null)
    if (!slug) return
    const load = bodyLoaders[`../../generated/articles/${slug}.ts`]
    if (!load) return
    let alive = true
    load().then((mod) => {
      if (alive) setBody(mod.body)
    })
    return () => {
      alive = false
    }
  }, [slug])

  useEffect(() => {
    if (!body) return
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      let active = body.headings[0]?.id ?? ''
      document.querySelectorAll<HTMLElement>('.prose h2[id]').forEach((h) => {
        if (h.getBoundingClientRect().top < 140) active = h.id
      })
      setActiveId(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [body])

  useEffect(() => {
    if (!tocOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTocOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [tocOpen])

  const scrollTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!meta) {
    return (
      <div className="page" id="top">
        <header className="header">
          <div className="header__inner">
            <Link to={HOME} className="brand">
              <span className="brand__name">Ponkcoding</span>
              <span className="dot" />
            </Link>
          </div>
        </header>
        <section className="art-head">
          <div className="art-head__inner">
            <h1 className="art-head__title">Article not found</h1>
            <p className="art-head__lede">
              This note doesn’t exist or has been unpublished.{' '}
              <Link to={HOME}>Back to the journal →</Link>
            </p>
          </div>
        </section>
      </div>
    )
  }

  const accent = categoryColor(meta.category)
  const headings = body?.headings ?? []
  const related = ARTICLES.filter((a) => a.slug !== meta.slug).slice(0, 3)

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
            <Link to={`${HOME}#notes`} className="nav__link">
              Notes
            </Link>
            <Link to={`${HOME}#topics`} className="nav__link">
              Topics
            </Link>
            <Link to={`${HOME}#lab`} className="nav__link">
              Lab
            </Link>
            <Link to={`${HOME}#about`} className="nav__link">
              About
            </Link>
          </nav>
          {headings.length > 0 && (
            <button
              type="button"
              className="toc-trigger"
              aria-expanded={tocOpen}
              aria-label="On this page"
              onClick={() => setTocOpen((o) => !o)}
            >
              <span className="toc-trigger__lines" aria-hidden="true" />
              <span className="toc-trigger__text">Contents</span>
            </button>
          )}
        </div>
      </header>

      {/* ---------- Article header ---------- */}
      <section className="art-head">
        <div className="art-head__inner">
          <div className="art-head__meta-top">
            <Link to={`${HOME}#topics`} className="art-head__cat">
              {meta.category}
            </Link>
            <span className="art-head__no">Field note</span>
          </div>
          <h1 className="art-head__title">{meta.title}</h1>
          <p className="art-head__lede">{meta.description}</p>
          <div className="art-head__byline">
            <span>
              <span className="label">By</span> {meta.author}
            </span>
            <span>
              <span className="label">Published</span> {formatDate(meta.date)}
            </span>
            {meta.updated && (
              <span>
                <span className="label">Updated</span> {formatDate(meta.updated)}
              </span>
            )}
            <span className="read-time">{meta.readingTime} min read</span>
          </div>
        </div>

        {/* ---------- Share button ---------- */}
        <div className="art-head__share">
          <ShareButton slug={meta.slug} shortId={meta.shortId} />
        </div>
        <div className="art-head__cover">
          {meta.cover ? (
            <img
              className="art-head__cover-image"
              src={meta.cover}
              alt=""
              width="1672"
              height="941"
            />
          ) : (
            <div className="art-signal" aria-hidden="true">
              <span className="art-signal__ring art-signal__ring--outer" />
              <span className="art-signal__ring art-signal__ring--inner" />
              <span className="art-signal__line art-signal__line--one" />
              <span className="art-signal__line art-signal__line--two" />
              <span className="art-signal__node art-signal__node--md">MD</span>
              <span className="art-signal__node art-signal__node--react">REACT</span>
              <span className="art-signal__node art-signal__node--html">HTML</span>
            </div>
          )}
          <span className="art-head__cover-label">{meta.category.toUpperCase()}</span>
        </div>
      </section>

      {/* ---------- Body + TOC ---------- */}
      <div className="art-layout">
        <article className="prose">
          {body ? <MarkdownContent html={body.html} /> : <p>Loading…</p>}

          <div className="art-tags">
            <span className="art-tags__label">Tags</span>
            {meta.tags.map((t) => (
              <Tag key={t} to={`${HOME}#topics`}>
                #{t}
              </Tag>
            ))}
          </div>

          <ShareButton slug={meta.slug} shortId={meta.shortId} />

          <div className="author">
            <div className="author__avatar" />
            <div className="author__meta">
              <p className="author__name">{meta.author}</p>
              <p className="author__bio">
                Software engineer, content creator, indie developer, and technical explorer. Writing
                Ponkcoding one note at a time.
              </p>
            </div>
            <Link to={`${HOME}#about`} className="author__link">
              About →
            </Link>
          </div>
        </article>

        {/* ---------- TOC: sticky sidebar on desktop, right drawer on mobile ---------- */}
        {headings.length > 0 && (
          <>
            <div
              className={`toc-overlay${tocOpen ? ' toc-overlay--open' : ''}`}
              onClick={() => setTocOpen(false)}
              aria-hidden="true"
            />
            <aside className={`toc${tocOpen ? ' toc--open' : ''}`}>
              <div className="toc__bar">
                <p className="toc__label">On this page</p>
                <button
                  type="button"
                  className="toc__close"
                  aria-label="Close"
                  onClick={() => setTocOpen(false)}
                >
                  ×
                </button>
              </div>
              <nav className="toc__nav">
                {headings.map((h) => {
                  const active = h.id === activeId
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className="toc__item"
                      onClick={() => setTocOpen(false)}
                      style={{
                        color: active ? 'var(--ink)' : 'var(--faint)',
                        fontWeight: active ? 600 : 400,
                        paddingLeft: h.depth > 2 ? 14 : 0,
                      }}
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
                <a href="#top" onClick={scrollTop}>
                  ↑ Back to top
                </a>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* ---------- Related ---------- */}
      <section className="related">
        <div className="related__inner">
          <p className="related__label">Keep reading</p>
          <div className="related__grid">
            {related.map((r) => (
              <Link key={r.slug} to={`/articles/${r.slug}`} className="related-card">
                <span className="related-card__cat">{r.category}</span>
                <span className="related-card__body">
                  <span className="related-card__title">{r.title}</span>
                  <span className="related-card__meta">
                    {formatDate(r.date)} · {r.readingTime} min
                  </span>
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
          <span className="footer__fine">
            © 2026 · Built with React, Vite &amp; Markdown · Netlify
          </span>
        </div>
      </footer>
    </div>
  )
}
