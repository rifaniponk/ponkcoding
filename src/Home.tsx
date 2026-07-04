import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const ARTICLE = '/article'
const DESIGN_SYSTEM = '/design-system'

export interface HomeProps {
  accent?: string
  showHeroIndex?: boolean
}

interface Note {
  cat: string
  color: string
  title: string
  dek: string
  date: string
  read: string
}

const NOTES: Note[] = [
  {
    cat: 'AI Engineering',
    color: '#5F6FBA',
    title: 'Designing an AI assistant server that stays out of the way',
    dek: 'Small, boring architecture beats clever agents. Notes from six months of daily use.',
    date: 'Jun 26',
    read: '11 min',
  },
  {
    cat: 'Apple / Local AI',
    color: '#7557d3',
    title: 'What Apple Silicon actually changes for local LLM inference',
    dek: 'Unified memory, thermals, and the honest numbers behind running models on a laptop.',
    date: 'Jun 19',
    read: '8 min',
  },
  {
    cat: 'Indie Dev',
    color: '#e6532f',
    title: 'Shipping Ayatura: notes from a two-week build',
    dek: 'A journal of scope cuts, small wins, and the checklist I use for every launch.',
    date: 'Jun 11',
    read: '7 min',
  },
  {
    cat: 'Independent Work',
    color: '#987510',
    title: 'Pricing freelance projects as a senior engineer',
    dek: 'Why hourly billing undersells experience, and the fixed-scope structure that works.',
    date: 'Jun 03',
    read: '9 min',
  },
]

const TOPICS = [
  { code: '01', name: 'AI engineering', count: '12', color: '#5F6FBA' },
  { code: '02', name: 'Web systems', count: '18', color: '#e6532f' },
  { code: '03', name: 'Indie dev', count: '09', color: '#7557d3' },
  { code: '04', name: 'Apple / local AI', count: '07', color: '#14816f' },
  { code: '05', name: 'Independent work', count: '06', color: '#987510' },
  { code: '06', name: 'Field notes', count: '15', color: '#c23758' },
]

const LAB = [
  {
    no: 'L—01',
    status: 'Live',
    name: 'Personal AI router',
    desc: 'One quiet endpoint for the models and workflows I use every day.',
    stack: 'Node / LLM APIs / SQLite',
  },
  {
    no: 'L—02',
    status: 'Shipped',
    name: 'Ayatura',
    desc: 'A focused reading companion, designed and built in public.',
    stack: 'Flutter / Dart / Drift',
  },
  {
    no: 'L—03',
    status: 'Ongoing',
    name: 'Useful automations',
    desc: 'Small pipelines that remove repeated work without becoming another system to manage.',
    stack: 'Shell / Cron / APIs',
  },
]

const HERO_INDEX = [
  { num: '01', label: 'Selected work', href: '#lab' },
  { num: '02', label: 'Writing & notes', href: '#notes' },
  { num: '03', label: 'What I explore', href: '#topics' },
  { num: '04', label: 'More about me', href: '#about' },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const elements = root.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  return ref
}

export function Home({ accent = '#5F6FBA', showHeroIndex = true }: HomeProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const revealRef = useReveal()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = !!target && ['INPUT', 'TEXTAREA'].includes(target.tagName)
      if (event.key === 'Escape') setSearchOpen(false)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === '/' && !typing) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  return (
    <div className="page home-page" style={{ ['--accent' as string]: accent }} ref={revealRef}>
      <header className="header home-header">
        <div className="header__inner">
          <a href="#top" className="brand" aria-label="Ponkcoding, back to top">
            <span className="brand__mark">P</span>
            <span className="brand__lockup">
              <span className="brand__name">Ponkcoding</span>
              <span className="brand__edition">Rifan Fauzi / Personal studio</span>
            </span>
          </a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="#lab" className="nav__link">Work</a>
            <a href="#notes" className="nav__link">Notes</a>
            <a href="#topics" className="nav__link">Index</a>
            <a href="#about" className="nav__link">About</a>
          </nav>
          <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Open search">
            <span className="search-btn__icon">⌕</span>
            <span>Search</span>
            <span className="kbd">⌘K</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__grid" aria-hidden="true" />
          <div className="hero__inner">
            <div className="hero__meta">
              <span className="live-label"><span /> Based in Indonesia / working worldwide</span>
              <span>Software engineer · indie builder · writer</span>
            </div>
            <div className="hero__main">
              <div className="hero__copy">
                <p className="hero__kicker">Hello, I’m Rifan Fauzi.</p>
                <h1 className="hero__title">
                  I build useful software <span>&amp;</span> share what I learn.
                </h1>
                <p className="hero__dek">
                  I’m a software engineer and independent maker turning complex ideas into focused,
                  reliable products. This is where I collect the work, decisions, and lessons behind them.
                </p>
                <div className="hero__actions">
                  <a href="#lab" className="hero__action hero__action--primary">Explore selected work <b>↘</b></a>
                  <a href="#notes" className="hero__action">Read my journal <b>↘</b></a>
                </div>
              </div>
              {showHeroIndex && (
                <aside className="issue-card">
                  <div className="issue-card__head">
                    <span>Profile / Rifan Fauzi</span>
                    <span className="issue-card__stamp">RF</span>
                  </div>
                  <nav className="issue-card__list" aria-label="On this page">
                    {HERO_INDEX.map((item) => (
                      <a key={item.num} href={item.href}>
                        <span>{item.num}</span>
                        {item.label}
                        <b>↘</b>
                      </a>
                    ))}
                  </nav>
                  <div className="issue-card__foot">Building software · learning in public · open to collaboration</div>
                </aside>
              )}
            </div>
            <div className="hero__ticker" aria-label="Current areas of interest">
              <span>I work across</span>
              <div>Product engineering <i>✦</i> Mobile & web <i>✦</i> Applied AI <i>✦</i> Independent products</div>
            </div>
          </div>
        </section>

        <section id="featured" className="home-section featured-section">
          <div className="section-shell">
            <div className="section-title">
              <div><span>01</span><p>Featured signal</p></div>
              <p>Long-form / 14 minute read</p>
            </div>
            <Link to={ARTICLE} className="featured" data-reveal>
              <div className="featured__visual">
                <div className="signal-map" aria-hidden="true">
                  <span className="signal-map__axis signal-map__axis--x" />
                  <span className="signal-map__axis signal-map__axis--y" />
                  <span className="signal-map__orbit signal-map__orbit--one" />
                  <span className="signal-map__orbit signal-map__orbit--two" />
                  <span className="signal-map__node signal-map__node--a">MD</span>
                  <span className="signal-map__node signal-map__node--b">VITE</span>
                  <span className="signal-map__node signal-map__node--c">HTML</span>
                  <span className="signal-map__pulse" />
                </div>
                <span className="featured__figure-label">FIG. 01 — THE STATIC PUBLISHING LOOP</span>
              </div>
              <div className="featured__body">
                <span className="story-label"><i /> Web systems</span>
                <h2>Prerendering a Markdown blog with React, Vite, and zero client JavaScript</h2>
                <p>How this site turns a folder of Markdown into fast static pages—and where the simple approach starts to bend.</p>
                <div className="featured__footer">
                  <span>Jun 12, 2026</span>
                  <strong>Read the field note <b>↗</b></strong>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section id="notes" className="home-section notes-section">
          <div className="section-shell">
            <div className="section-title section-title--light">
              <div><span>02</span><p>Fresh notes</p></div>
              <a href="#notes">View full archive ↗</a>
            </div>
            <div className="notes-grid">
              {NOTES.map((note, index) => (
                <Link
                  key={note.title}
                  to={ARTICLE}
                  className={`note-card${index === 0 ? ' note-card--lead' : ''}`}
                  data-reveal
                  style={{ ['--cat' as string]: note.color, transitionDelay: `${index * 60}ms` }}
                >
                  <div className="note-card__top">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{note.date} / {note.read}</span>
                  </div>
                  <span className="note-card__cat">{note.cat}</span>
                  <h3>{note.title}</h3>
                  <p>{note.dek}</p>
                  <span className="note-card__arrow">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="topics" className="topic-band">
          <div className="section-shell">
            <div className="section-title section-title--inverse">
              <div><span>03</span><p>Field index</p></div>
              <p>Browse by recurring obsession</p>
            </div>
            <div className="topic-list">
              {TOPICS.map((topic) => (
                <Link key={topic.name} to={ARTICLE} className="topic-row" style={{ ['--cat' as string]: topic.color }}>
                  <span className="topic-row__code">{topic.code}</span>
                  <span className="topic-row__dot" />
                  <span className="topic-row__name">{topic.name}</span>
                  <span className="topic-row__count">{topic.count} notes</span>
                  <span className="topic-row__arrow">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="lab" className="lab-section">
          <div className="section-shell">
            <div className="section-title section-title--dark">
              <div><span>04</span><p>Working lab</p></div>
              <p>Experiments that escaped the notebook</p>
            </div>
            <div className="lab-intro">
              <h2>Built to answer a question,<br /><em>kept only if useful.</em></h2>
              <p>Small products and internal tools. Some ship, some become essays, all leave behind a better mental model.</p>
            </div>
            <div className="lab-list">
              {LAB.map((item) => (
                <Link key={item.name} to={ARTICLE} className="lab-row" data-reveal>
                  <span className="lab-row__no">{item.no}</span>
                  <span className="lab-row__status"><i />{item.status}</span>
                  <span className="lab-row__main"><strong>{item.name}</strong><small>{item.desc}</small></span>
                  <span className="lab-row__stack">{item.stack}</span>
                  <span className="lab-row__arrow">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="section-shell about-shell">
            <div className="about-portrait" aria-label="Abstract portrait placeholder">
              <span className="about-portrait__sun" />
              <span className="about-portrait__grid" />
              <span className="about-portrait__initials">RF</span>
              <span className="about-portrait__caption">Portrait pending / identity present</span>
            </div>
            <div className="about-copy">
              <span className="story-label"><i /> The person behind the signal</span>
              <h2>I’m Rifan. I build software, write to understand it, and share the useful parts.</h2>
              <p>Ponkcoding is a public working notebook for engineering decisions, AI workflows, independent products, and the systems that make creative work sustainable.</p>
              <div className="about-links">
                <a href="#about">GitHub ↗</a>
                <a href="#about">X / Twitter ↗</a>
                <a href="#about">Email ↗</a>
                <a href="#about">RSS ↗</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="section-shell home-footer__inner">
          <div>
            <span className="home-footer__mark">P</span>
            <h2>Stay curious.<br />Build something useful.</h2>
          </div>
          <div className="home-footer__nav">
            <a href="#notes">Latest notes</a>
            <a href="#topics">Field index</a>
            <a href="#lab">The lab</a>
            <Link to={DESIGN_SYSTEM}>Design system</Link>
          </div>
          <div className="home-footer__fine">
            <span>© 2026 Rifan Fauzi</span>
            <span>React / Vite / TypeScript</span>
            <a href="#top">Back to signal ↑</a>
          </div>
        </div>
      </footer>

      {searchOpen && (
        <div className="overlay" onClick={() => setSearchOpen(false)} role="presentation">
          <div className="overlay__panel" role="dialog" aria-modal="true" aria-label="Search Ponkcoding" onClick={(event) => event.stopPropagation()}>
            <div className="overlay__head">
              <span>Search the field journal</span>
              <button onClick={() => setSearchOpen(false)}>ESC</button>
            </div>
            <div className="overlay__search">
              <span>⌕</span>
              <input ref={inputRef} placeholder="Try “local AI” or “shipping”…" aria-label="Search query" />
            </div>
            <p className="overlay__hint">POPULAR SIGNALS</p>
            <div className="overlay__tags">
              {['local models', 'static publishing', 'indie dev', 'pricing'].map((tag) => <button key={tag}>{tag} ↗</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
