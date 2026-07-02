import { useEffect, useRef, useState } from 'react'
import './Home.css'

const ARTICLE = '/article'
const DESIGN_SYSTEM = '/design-system'

export interface HomeProps {
  /** Brand accent color. Design offers #5F6B4A, #8A6A4C, #4E5F6B. */
  accent?: string
  /** Show the "In this issue" index in the hero. */
  showHeroIndex?: boolean
}

interface Note {
  cat: string
  color: string
  title: string
  dek: string
  date: string
}

const NOTES: Note[] = [
  {
    cat: 'AI Engineering',
    color: '#4A7856',
    title: 'Designing an AI assistant server that stays out of the way',
    dek: 'Small, boring architecture beats clever agents. Notes from running my own assistant backend for six months.',
    date: 'Jun 26, 2026',
  },
  {
    cat: 'MacBook / Apple',
    color: '#8752A0',
    title: 'What Apple Silicon actually changes for local LLM inference',
    dek: 'Unified memory, thermals, and the honest numbers behind running models on a MacBook.',
    date: 'Jun 19, 2026',
  },
  {
    cat: 'Indie Dev',
    color: '#C1622E',
    title: 'Shipping Ayatura: notes from a two-week build',
    dek: 'A journal of scope cuts, small wins, and the checklist I now use for every side project launch.',
    date: 'Jun 11, 2026',
  },
  {
    cat: 'Freelancing',
    color: '#B98B2E',
    title: 'Pricing Upwork projects as a senior engineer',
    dek: 'Why hourly billing undersells experience, and the fixed-scope structure that works for me.',
    date: 'Jun 03, 2026',
  },
  {
    cat: 'Ponkcoding Notes',
    color: '#A83E4D',
    title: 'How this site is built: the static engine behind Ponkcoding',
    dek: 'Documentation for the little Markdown engine that renders everything you are reading.',
    date: 'May 24, 2026',
  },
]

interface Topic {
  code: string
  name: string
  count: string
  color: string
}

const TOPICS: Topic[] = [
  { code: 'A/01', name: 'AI Engineering', count: '12 notes', color: '#4A7856' },
  { code: 'A/02', name: 'Web Development', count: '18 notes', color: '#3B6EA5' },
  { code: 'A/03', name: 'Indie Dev', count: '9 notes', color: '#C1622E' },
  { code: 'A/04', name: 'MacBook / Apple', count: '7 notes', color: '#8752A0' },
  { code: 'A/05', name: 'Freelancing', count: '6 notes', color: '#B98B2E' },
  { code: 'A/06', name: 'Finance Journal', count: '4 notes', color: '#1E8577' },
  { code: 'A/07', name: 'Ponkcoding Notes', count: '5 notes', color: '#A83E4D' },
]

interface Lab {
  status: string
  statusColor: string
  name: string
  desc: string
  stack: string
}

const LAB: Lab[] = [
  {
    status: 'In production',
    statusColor: 'var(--accent)',
    name: 'Static blog engine',
    desc: 'The Markdown → HTML pipeline that powers this site.',
    stack: 'React · Vite · TypeScript',
  },
  {
    status: 'Running daily',
    statusColor: 'var(--accent)',
    name: 'AI assistant server',
    desc: 'A small personal backend that routes my everyday AI workflows.',
    stack: 'Node · LLM APIs',
  },
  {
    status: 'Shipped v1',
    statusColor: '#4E5F6B',
    name: 'Ayatura',
    desc: 'An indie product built and shipped in public, two weeks at a time.',
    stack: 'Side project · 2026',
  },
  {
    status: 'Always evolving',
    statusColor: '#4E5F6B',
    name: 'Automation workflows',
    desc: 'Personal scripts and pipelines that quietly save hours every week.',
    stack: 'Shell · Cron · APIs',
  },
]

const HERO_INDEX = [
  { num: '01', label: 'Featured essay', href: '#featured' },
  { num: '02', label: 'Latest notes', href: '#notes' },
  { num: '03', label: 'Topics', href: '#topics' },
  { num: '04', label: 'The Lab', href: '#lab' },
  { num: '05', label: 'About Rifan', href: '#about' },
]

const RAINBOW = ['#4A7856', '#3B6EA5', '#C1622E', '#8752A0', '#B98B2E', '#1E8577', '#A83E4D']

/** Alpha wash used on note-row hover, per category color. */
function wash(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Reveal-on-scroll: adds .is-visible when the element enters the viewport. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

export function Home({ accent = '#5F6B4A', showHeroIndex = true }: HomeProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const revealRef = useReveal()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === '/') {
        const t = e.target as HTMLElement | null
        const typing =
          !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
        if (!typing) {
          e.preventDefault()
          setSearchOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  return (
    <div className="page" style={{ ['--accent' as string]: accent }} ref={revealRef}>
      {/* ---------- Header ---------- */}
      <header className="header">
        <div className="header__inner">
          <a href="#top" className="brand">
            <span className="brand__name">Ponkcoding</span>
            <span className="dot dot--pulse" />
          </a>
          <nav className="nav">
            <a href="#notes" className="nav__link">Notes</a>
            <a href="#topics" className="nav__link">Topics</a>
            <a href="#lab" className="nav__link">Lab</a>
            <a href="#about" className="nav__link">About</a>
          </nav>
          <button className="search-btn" onClick={() => setSearchOpen(true)}>
            <span>Search</span>
            <span className="kbd">⌘K</span>
          </button>
        </div>
      </header>

      <div className="rainbow" aria-hidden="true">
        {RAINBOW.map((c) => (
          <div key={c} style={{ background: c }} />
        ))}
      </div>

      <main id="top" className="wrap">
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <div className="hero__kicker">
            <span className="dot dot--pulse" />
            <span>A personal publication by Rifan Fauzi</span>
          </div>
          <div className="hero__row">
            <h1 className="hero__title">
              Engineering <em className="accent">notes</em>, AI workflows, indie dev experiments,
              and technical <em>stories</em>.<span className="hero__end-dot" />
            </h1>
            {showHeroIndex && (
              <nav className="hero__index">
                <p className="hero__index-label">In this issue</p>
                <div className="hero__index-list">
                  {HERO_INDEX.map((item) => (
                    <a key={item.num} href={item.href} className="index-item">
                      <span className="index-item__num">{item.num}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </nav>
            )}
          </div>
        </section>

        {/* ---------- Featured ---------- */}
        <section id="featured" className="section section--featured">
          <div className="section-head" style={{ marginBottom: 36 }}>
            <p className="eyebrow">01 — Featured essay</p>
            <span className="meta-mono">Jun 2026</span>
          </div>
          <a href={ARTICLE} className="featured reveal reveal--lg" data-reveal>
            <div className="featured__cover">
              <span className="placeholder-tag">cover — featured essay, 3:2</span>
            </div>
            <div className="featured__body">
              <span className="pill" style={{ color: '#3B6EA5' }}>
                <span className="pill__dot" style={{ background: '#3B6EA5' }} />
                Web Development
              </span>
              <h2 className="featured__title">
                Prerendering a Markdown blog with React, Vite, and zero client JavaScript
              </h2>
              <p className="featured__dek">
                How this site turns a folder of Markdown files into fast static pages — the build
                pipeline, the trade-offs, and what I would do differently.
              </p>
              <div className="featured__byline">
                <span>Jun 12, 2026</span>
                <span>·</span>
                <span>14 min read</span>
              </div>
              <span className="read-more">Read the essay →</span>
            </div>
          </a>
        </section>

        {/* ---------- Latest notes ---------- */}
        <section id="notes" className="section section--notes">
          <div className="section-head" style={{ marginBottom: 20 }}>
            <p className="eyebrow">02 — Latest notes</p>
            <a href="#notes" className="link-mono">All notes →</a>
          </div>
          {NOTES.map((note, i) => (
            <a
              key={note.title}
              href={ARTICLE}
              className="note-row reveal"
              data-reveal
              style={{
                transitionDelay: `${i * 60}ms`,
                ['--row-hover' as string]: wash(note.color, 0.08),
              }}
            >
              <span className="note-row__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="note-row__cat" style={{ color: note.color }}>
                {note.cat}
              </span>
              <span className="note-row__main">
                <span className="note-row__title">{note.title}</span>
                <span className="note-row__dek">{note.dek}</span>
              </span>
              <time className="note-row__date">{note.date}</time>
            </a>
          ))}
        </section>
      </main>

      {/* ---------- Topics (full-bleed shaded band) ---------- */}
      <section id="topics" className="topics">
        <div className="topics__inner">
          <div className="section-head" style={{ marginBottom: 36 }}>
            <p className="eyebrow">03 — Topics</p>
            <span className="meta-mono">7 areas</span>
          </div>
          <div className="topics__grid">
            {TOPICS.map((t, i) => (
              <a
                key={t.name}
                href={ARTICLE}
                className="topic reveal"
                data-reveal
                style={{
                  transitionDelay: `${i * 40}ms`,
                  ['--cat' as string]: t.color,
                  ['--cat-wash' as string]: wash(t.color, 0.07),
                }}
              >
                <span className="topic__code">{t.code}</span>
                <span className="topic__label">
                  <span className="topic__name">{t.name}</span>
                  <span className="topic__count">{t.count}</span>
                </span>
              </a>
            ))}
            <a
              href="#notes"
              className="topic topic--archive reveal"
              data-reveal
              style={{ transitionDelay: '280ms' }}
            >
              <span className="topic__code">A/∞</span>
              <span className="topic__archive-name">Browse the archive →</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Lab ---------- */}
      <section id="lab" className="lab">
        <div className="lab__head">
          <p className="eyebrow">04 — The Lab</p>
          <span className="meta-mono">experiments in production</span>
        </div>
        <p className="lab__intro">
          Things I build to learn — some become tools, some become essays.
        </p>
        <div className="lab__grid">
          {LAB.map((l) => (
            <a
              key={l.name}
              href={ARTICLE}
              className="lab-card"
              style={{ ['--status' as string]: l.statusColor }}
            >
              <span className="lab-card__status">
                <span className="pill__dot" />
                {l.status}
              </span>
              <span className="lab-card__body">
                <span className="lab-card__name">{l.name}</span>
                <span className="lab-card__desc">{l.desc}</span>
                <span className="lab-card__stack">{l.stack}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="about">
        <div className="about__inner">
          <div className="about__side">
            <p className="eyebrow">05 — About</p>
            <div className="about__portrait">
              <span className="placeholder-tag">portrait — Rifan</span>
            </div>
          </div>
          <div className="about__body">
            <p className="about__lead">
              I’m Rifan — a software engineer, content creator, indie developer, and technical
              explorer.
            </p>
            <p className="about__text">
              Ponkcoding is my public notebook. I write to understand what I build: engineering
              decisions, AI workflows, the economics of freelancing, and the small experiments that
              keep this work interesting.
            </p>
            <div className="about__links">
              <a href="#about" className="chip">GitHub ↗</a>
              <a href="#about" className="chip">X / Twitter ↗</a>
              <a href="#about" className="chip">Email</a>
              <a href="#about" className="chip">RSS</a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__brand-name">
              <span>Ponkcoding</span>
              <span className="dot" />
            </span>
            <p className="footer__blurb">
              Engineering notes, AI workflows, indie dev experiments, and technical stories.
            </p>
          </div>
          <nav className="footer__nav">
            <span className="footer__nav-head">Read</span>
            <a href="#notes" className="footer__link">Latest notes</a>
            <a href="#topics" className="footer__link">Topics</a>
            <a href="#lab" className="footer__link">The Lab</a>
            <a href="#about" className="footer__link">About</a>
          </nav>
          <nav className="footer__nav">
            <span className="footer__nav-head">Elsewhere</span>
            <a href="#about" className="footer__link">GitHub</a>
            <a href="#about" className="footer__link">X / Twitter</a>
            <a href="#about" className="footer__link">RSS</a>
            <a href="#about" className="footer__link">Email</a>
          </nav>
          <nav className="footer__nav">
            <span className="footer__nav-head">Meta</span>
            <a href={ARTICLE} className="footer__link">Article page</a>
            <a href={DESIGN_SYSTEM} className="footer__link">Design system</a>
          </nav>
        </div>
        <div className="footer__bar">
          <div className="footer__bar-inner">
            <span className="footer__fine">© 2026 Ponkcoding · Rifan Fauzi</span>
            <span className="footer__fine">
              Built with React, Vite &amp; Markdown · Deployed on Netlify
              <span className="dot" />
            </span>
          </div>
        </div>
      </footer>

      {/* ---------- Search overlay ---------- */}
      {searchOpen && (
        <div className="overlay" onClick={() => setSearchOpen(false)}>
          <div className="overlay__panel" onClick={(e) => e.stopPropagation()}>
            <div className="overlay__search">
              <span className="dot" />
              <input
                ref={inputRef}
                className="overlay__input"
                placeholder="Search notes, topics, projects…"
              />
              <button className="overlay__esc" onClick={() => setSearchOpen(false)}>
                esc
              </button>
            </div>
            <div className="overlay__block">
              <p className="overlay__block-label">Popular right now</p>
              <div className="overlay__tags">
                {['static prerendering', 'apple silicon', 'upwork pricing', 'ayatura'].map((t) => (
                  <button key={t} className="tag-btn">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="overlay__recent">
              <p className="overlay__recent-label">Recent notes</p>
              {NOTES.slice(0, 3).map((note) => (
                <a key={note.title} href={ARTICLE} className="recent-item">
                  <span className="recent-item__title">{note.title}</span>
                  <span className="recent-item__cat">{note.cat}</span>
                </a>
              ))}
            </div>
            <div className="overlay__foot">
              <span>↵ open</span>
              <span>esc close</span>
              <span>⌘K anywhere</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
