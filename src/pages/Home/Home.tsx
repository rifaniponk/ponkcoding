import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.scss'
import { ARTICLES } from '../../generated/content-index.ts'
import { categoryColor } from '../../lib/categories.ts'
import { formatDateShort } from '../../lib/format.ts'
import { LAB, NOW, NOW_PERIOD } from './Home.data.ts'

const DESIGN_SYSTEM = '/design-system'
const SHOW_LAB = false // toggle when ready

export interface HomeProps {
  accent?: string
  showHeroIndex?: boolean
}

/* All content below is derived from the generated Markdown index. */
const FEATURED = ARTICLES.find((a) => a.featured) ?? ARTICLES[0]
const NOTES = ARTICLES.filter((a) => a.slug !== FEATURED?.slug)

const TOPICS = (() => {
  const counts = new Map<string, number>()
  for (const a of ARTICLES) counts.set(a.category, (counts.get(a.category) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count], i) => ({
      code: String(i + 1).padStart(2, '0'),
      name,
      count,
      color: categoryColor(name),
      articles: ARTICLES.filter((a) => a.category === name),
    }))
})()

interface Topic {
  code: string
  name: string
  count: number
  color: string
  articles: typeof ARTICLES
}

function TopicRow({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false)
  const [height, setHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    } else {
      setHeight(0)
    }
  }, [open])

  return (
    <div>
      <button
        type="button"
        className="topic-row topic-row--btn"
        style={{ ['--cat' as string]: topic.color }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="topic-row__code">{topic.code}</span>
        <span className="topic-row__dot" />
        <span className="topic-row__name">{topic.name}</span>
        <span className="topic-row__count">
          {topic.count} {topic.count === 1 ? 'note' : 'notes'}
        </span>
        <span className="topic-row__arrow">{open ? '−' : '+'}</span>
      </button>
      <div className="topic-expand" style={{ maxHeight: height ? `${height}px` : '0px' }}>
        <div ref={contentRef}>
          {topic.articles.map((a) => (
            <Link key={a.slug} to={`/articles/${a.slug}`} className="topic-expand__item">
              <span className="topic-expand__title">{a.title}</span>
              <span className="topic-expand__date">{formatDateShort(a.date)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  const revealRef = useReveal()

  return (
    <div className="page home-page" style={{ ['--accent' as string]: accent }} ref={revealRef}>
      <header className="header home-header">
        <div className="header__inner">
          <a href="#top" className="brand" aria-label="Ponkcoding, back to top">
            <span className="brand__mark">P</span>
            <span className="brand__lockup">
              <span className="brand__name">Ponkcoding</span>
              <span className="brand__edition">Rifan's engineering journal</span>
            </span>
          </a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="#lab" className="nav__link">
              Work
            </a>
            <a href="#notes" className="nav__link">
              Notes
            </a>
            <a href="#topics" className="nav__link">
              Index
            </a>
            <a href="#about" className="nav__link">
              About
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__grid" aria-hidden="true" />
          <div className="hero__inner">
            <div className="hero__meta">
              <span className="live-label">
                <span /> Bandung, Indonesia / working worldwide
              </span>
              <span>Senior software engineer · product & AI systems</span>
            </div>
            <div className="hero__main">
              <div className="hero__copy">
                <p className="hero__kicker">Rifan Muhamad Fauzi</p>
                <h1 className="hero__title">
                  I build scalable web <span>&amp;</span> mobile products.
                </h1>
                <p className="hero__dek">
                  Senior software engineer with 15+ years of experience shipping high-quality
                  product, delivering high performance system, leading teams, and shipping reliable
                  systems across healthcare, fintech, and logistics, while also designing AI
                  development workflows that make engineering and everyday operations more
                  effective.
                </p>
                <div className="hero__expertise" aria-label="Core expertise">
                  {[
                    'Cross-platform development',
                    'Technical leadership',
                    'High performance system',
                    'AI-assisted engineering',
                  ].map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="hero__actions">
                  <a href="##notes" className="hero__action hero__action--primary">
                    Read my journal <b>↘</b>
                  </a>
                </div>
              </div>
              {showHeroIndex && (
                <aside className="issue-card">
                  <div className="issue-card__head">
                    <span className="issue-card__title">
                      Now
                      <span className="issue-card__period">{NOW_PERIOD}</span>
                    </span>
                    <span className="issue-card__stamp">RF</span>
                  </div>
                  <dl className="issue-card__facts">
                    {NOW.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        {Array.isArray(item.value) ? (
                          <dd>
                            <ol className="issue-card__list">
                              {item.value.map((v) => (
                                <li key={v}>{v}</li>
                              ))}
                            </ol>
                          </dd>
                        ) : (
                          <dd>{item.value}</dd>
                        )}
                      </div>
                    ))}
                  </dl>
                  <div className="issue-card__foot">A living snapshot · updated monthly</div>
                </aside>
              )}
            </div>
            <div className="hero__ticker" aria-label="Current areas of interest">
              <span>Core toolkit</span>
              <div>
                TypeScript &amp; Go on the backend.
                <br />
                Angular, React &amp; Flutter on the client.
                <br />
                AI agents in between.
              </div>
            </div>
          </div>
        </section>

        <section id="featured" className="home-section featured-section">
          <div className="section-shell">
            <div className="section-title">
              <div>
                <span>01</span>
                <p>Featured signal</p>
              </div>
              <p>Long-form / {FEATURED?.readingTime ?? 0} minute read</p>
            </div>
            <Link to={`/articles/${FEATURED?.slug}`} className="featured" data-reveal>
              <div className="featured__visual">
                {FEATURED?.cover ? (
                  <img
                    className="featured__cover"
                    src={FEATURED.cover}
                    alt=""
                    width="1672"
                    height="941"
                    loading="lazy"
                  />
                ) : (
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
                )}
                <span className="featured__figure-label">FIG. 01 — THE STATIC PUBLISHING LOOP</span>
              </div>
              <div className="featured__body">
                <span className="story-label">
                  <i /> {FEATURED?.category}
                </span>
                <h2>{FEATURED?.title}</h2>
                <p>{FEATURED?.description}</p>
                <div className="featured__footer">
                  <span>{FEATURED ? formatDateShort(FEATURED.date) : ''}</span>
                  <strong>
                    Read the field note <b>↗</b>
                  </strong>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section id="notes" className="home-section notes-section">
          <div className="section-shell">
            <div className="section-title section-title--light">
              <div>
                <span>02</span>
                <p>Fresh notes</p>
              </div>
              <a href="#notes">View full archive ↗</a>
            </div>
            <div className="notes-grid">
              {NOTES.map((note, index) => (
                <Link
                  key={note.slug}
                  to={`/articles/${note.slug}`}
                  className={`note-card${index === 0 ? ' note-card--lead' : ''}`}
                  data-reveal
                  style={{
                    ['--cat' as string]: categoryColor(note.category),
                    transitionDelay: `${index * 60}ms`,
                  }}
                >
                  <div className="note-card__top">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      {formatDateShort(note.date)} / {note.readingTime} min
                    </span>
                  </div>
                  <span className="note-card__cat">{note.category}</span>
                  <h3>{note.title}</h3>
                  <p>{note.description}</p>
                  <span className="note-card__arrow">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="topics" className="topic-band">
          <div className="section-shell">
            <div className="section-title section-title--inverse">
              <div>
                <span>03</span>
                <p>Field index</p>
              </div>
              <p>Browse by recurring obsession</p>
            </div>
            <div className="topic-list">
              {TOPICS.map((topic) => (
                <TopicRow key={topic.name} topic={topic} />
              ))}
            </div>
          </div>
        </section>

        {SHOW_LAB && (
          <section id="lab" className="lab-section">
            <div className="section-shell">
              <div className="section-title section-title--dark">
                <div>
                  <span>04</span>
                  <p>Working lab</p>
                </div>
                <p>Experiments that escaped the notebook</p>
              </div>
              <div className="lab-intro">
                <h2>
                  Built to answer a question,
                  <br />
                  <em>kept only if useful.</em>
                </h2>
                <p>
                  Small products and internal tools. Some ship, some become essays, all leave behind
                  a better mental model.
                </p>
              </div>
              <div className="lab-list">
                {LAB.map((item) => (
                  <a key={item.name} href="#lab" className="lab-row" data-reveal>
                    <span className="lab-row__no">{item.no}</span>
                    <span className="lab-row__status">
                      <i />
                      {item.status}
                    </span>
                    <span className="lab-row__main">
                      <strong>{item.name}</strong>
                      <small>{item.desc}</small>
                    </span>
                    <span className="lab-row__stack">{item.stack}</span>
                    <span className="lab-row__arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="about" className="about-section">
          <div className="section-shell about-shell">
            <div className="about-portrait">
              <img
                src="/images/rifan-profile.jpg"
                alt="Rifan Fauzi standing in an office"
                width="1086"
                height="1448"
                loading="lazy"
              />
            </div>
            <div className="about-copy">
              <span className="story-label">
                <i /> The person behind the signal
              </span>
              <h2>Senior engineer delivering end-to-end products, from design to deployment.</h2>
              <p>
                Across 15+ years, I’ve delivered healthcare, payment, logistics, and enterprise
                systems; led engineering teams; and worked across frontend, mobile, backend, cloud,
                and AI development workflow. Ponkcoding is where I document the useful decisions
                behind that work.
              </p>
              <div className="about-links">
                <Link to="/profile">Full profile →</Link>
                <a href="https://github.com/rifaniponk" target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a
                  href="https://www.upwork.com/freelancers/rifanfauzi"
                  target="_blank"
                  rel="noreferrer"
                >
                  Upwork ↗
                </a>
                <a href="https://x.com/rifaniponk" target="_blank" rel="noreferrer">
                  X / Twitter ↗
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="section-shell home-footer__inner">
          <div>
            <span className="home-footer__mark">P</span>
            <h2>
              Stay curious.
              <br />
              Build something useful.
            </h2>
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
    </div>
  )
}
