import { Link } from 'react-router-dom'
import './DesignSystem.scss'
import { SWATCHES, PRINCIPLES } from './DesignSystem.data.ts'
import { Button, TextLink, Pill, Tag, Callout } from '../../components'

const HOME = '/'
const ARTICLE = '/articles/prerendering-a-markdown-blog'

export function DesignSystem() {
  return (
    <div className="page">
      {/* ---------- Header ---------- */}
      <header className="header">
        <div className="header__inner">
          <Link to={HOME} className="brand">
            <span className="brand__name">Ponkcoding</span>
            <span className="dot" />
          </Link>
          <span className="ds-sub">design system · v2</span>
          <nav className="nav">
            <Link to={HOME} className="nav__link">
              Homepage
            </Link>
            <Link to={ARTICLE} className="nav__link">
              Article page
            </Link>
          </nav>
        </div>
      </header>

      <main className="ds-main">
        {/* ---------- Concept ---------- */}
        <section className="ds-section ds-section--concept">
          <p className="ds-eyebrow">00 — Design concept</p>
          <h1 className="ds-concept__title">
            Signal Notebook — an editorial system for useful technology.
            <span
              className="hero__end-dot"
              style={{ width: '0.3em', height: '0.3em', marginLeft: '0.15em' }}
            />
          </h1>
          <div className="ds-concept__row">
            <p className="ds-concept__lead">
              Ponkcoding combines an independent field journal with the visual language of signal
              maps and working diagrams: warm paper for reading, night-ink fields for immersion,
              cobalt for direction, and highlighter green for live information. Offset blocks and
              hard shadows make the pages feel assembled rather than flattened into a template.
            </p>
            <ul className="ds-principles">
              {PRINCIPLES.map((p) => (
                <li key={p.m}>
                  <span className="ds-principles__mark">{p.m}</span>
                  {p.t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Palette ---------- */}
        <section className="ds-section">
          <p className="ds-eyebrow">01 — Color palette</p>
          <div className="ds-swatches">
            {SWATCHES.map((s) => (
              <div key={s.name} className="ds-swatch">
                <div
                  className="ds-swatch__chip"
                  style={{
                    background: s.chip,
                    border: s.border ? '1px solid var(--border)' : undefined,
                  }}
                />
                <p className="ds-swatch__name">{s.name}</p>
                <p className="ds-swatch__hex">{s.hex}</p>
              </div>
            ))}
          </div>
          <p className="ds-note">
            Rule: the two accents share lightness &amp; chroma (≈ oklch 0.50 0.05) and differ only
            in hue — moss 130°, slate 240°. Never both in the same component.
          </p>
        </section>

        {/* ---------- Typography ---------- */}
        <section className="ds-section">
          <p className="ds-eyebrow">02 — Typography</p>
          <div className="ds-type">
            <div className="ds-type__row">
              <span className="ds-type__label">Display / Newsreader 400</span>
              <span className="ds-type__spec-display">Engineering notes &amp; stories</span>
            </div>
            <div className="ds-type__row">
              <span className="ds-type__label">Heading / Newsreader 500</span>
              <span className="ds-type__spec-heading">The build pipeline, explained</span>
            </div>
            <div className="ds-type__row">
              <span className="ds-type__label">Lede / Newsreader italic</span>
              <span className="ds-type__spec-lede">A quieter way to publish technical work.</span>
            </div>
            <div className="ds-type__row">
              <span className="ds-type__label">Body / Instrument Sans 400</span>
              <span className="ds-type__spec-body">
                Article body text runs at 17.5px with 1.75 line-height and a 680px measure — roughly
                70 characters per line, tuned for long technical reads.
              </span>
            </div>
            <div className="ds-type__row">
              <span className="ds-type__label">Meta / IBM Plex Mono</span>
              <span className="ds-type__spec-meta">
                02 — Latest notes · Jun 26, 2026 · 14 min read
              </span>
            </div>
          </div>
          <p className="ds-note">
            Fonts: Newsreader (headings, ledes, article titles) · Instrument Sans (UI + body) · IBM
            Plex Mono (metadata, indices, code). Never mono for headings or paragraphs.
          </p>
        </section>

        {/* ---------- Spacing & layout ---------- */}
        <section className="ds-section">
          <p className="ds-eyebrow">03 — Spacing &amp; layout rules</p>
          <div className="ds-grid">
            <div className="ds-rule-card">
              <p className="ds-rule-card__label">Page grid</p>
              <p className="ds-rule-card__body">
                Site max-width <strong>1240px</strong>, gutters <code>clamp(20px, 5vw, 56px)</code>.
                Content composes on a 12-column mental grid via flex + wrap; asymmetry (7/5, 8/4)
                preferred over centered columns.
              </p>
            </div>
            <div className="ds-rule-card">
              <p className="ds-rule-card__label">Article measure</p>
              <p className="ds-rule-card__body">
                Body column max <strong>680px</strong>; article header up to 820px; cover full-width
                21:9. TOC rail 200–240px, sticky at <code>top: 96px</code>.
              </p>
            </div>
            <div className="ds-rule-card">
              <p className="ds-rule-card__label">Vertical rhythm</p>
              <p className="ds-rule-card__body">
                Sections open with a <strong>2px ink rule</strong> + mono index label. Section
                padding 72–96px; block spacing inside articles 32px; paragraph spacing 24px.
                Hairlines (1px #EDEDEC) divide list rows.
              </p>
            </div>
            <div className="ds-rule-card">
              <p className="ds-rule-card__label">Responsive</p>
              <p className="ds-rule-card__body">
                <strong>Desktop ≥1024:</strong> asymmetric rows, sticky TOC.{' '}
                <strong>Tablet:</strong> topic grid drops to 2-up, hero index tucks under headline.{' '}
                <strong>Mobile:</strong> single column, TOC becomes a collapsible “On this page”
                above the article, nav collapses to overlay menu.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Components ---------- */}
        <section className="ds-section">
          <p className="ds-eyebrow">04 — Components</p>
          <div className="ds-comp-grid">
            {/* Buttons & pills */}
            <div className="ds-card">
              <p className="ds-card__head">Buttons · pills · tags</p>
              <div className="ds-card__body">
                <Button variant="primary">Primary action</Button>
                <Button variant="secondary">Secondary</Button>
                <TextLink>Text link →</TextLink>
                <Pill>Category pill</Pill>
                <Tag>#tag-pill</Tag>
              </div>
            </div>

            {/* Callout variants */}
            <div className="ds-card">
              <p className="ds-card__head">Callouts — note · tip · caution</p>
              <div className="ds-card__body ds-card__body--pad">
                <Callout variant="note">Neutral context the reader should not miss.</Callout>
                <Callout variant="tip">A shortcut worth stealing.</Callout>
                <Callout variant="caution">A trade-off with real costs.</Callout>
              </div>
            </div>

            {/* Mobile nav mock */}
            <div className="ds-card">
              <p className="ds-card__head">Mobile nav — open state (375px)</p>
              <div className="ds-mobile-frame">
                <div className="ds-mobile">
                  <div className="ds-mobile__bar">
                    <span className="ds-mobile__brand">
                      <span>Ponkcoding</span>
                      <span className="dot" style={{ width: 6, height: 6 }} />
                    </span>
                    <span className="ds-mobile__x">✕</span>
                  </div>
                  <nav className="ds-mobile__nav">
                    {[
                      ['01', 'Notes'],
                      ['02', 'Topics'],
                      ['03', 'Lab'],
                      ['04', 'About'],
                    ].map(([n, label]) => (
                      <span key={n} className="ds-mobile__item">
                        <span>{n}</span>
                        {label}
                      </span>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Micro-interactions */}
            <div className="ds-card">
              <p className="ds-card__head">Micro-interactions</p>
              <ul className="ds-microlist">
                <li>
                  <strong>Hover:</strong> color/border shifts only, 150ms ease. List rows tint to
                  shaded paper; cards lift 2px + ink border.
                </li>
                <li>
                  <strong>Focus:</strong> 2px moss outline, 2px offset — never removed, never a
                  glow.
                </li>
                <li>
                  <strong>Article:</strong> 2px reading-progress bar in accent; TOC scrollspy marks
                  the active heading with a moss square.
                </li>
                <li>
                  <strong>Never:</strong> parallax, typing effects, scroll-jacking, skeleton
                  shimmer.
                </li>
              </ul>
            </div>
          </div>
          <p className="ds-note">
            Live specimens of the remaining components — article cards, list items, code / terminal
            / file-tree / Mermaid blocks, TOC, and footer — are on the{' '}
            <Link to={HOME} className="ds-footlink">
              homepage
            </Link>{' '}
            and{' '}
            <Link to={ARTICLE} className="ds-footlink">
              article page
            </Link>
            .
          </p>
        </section>

        {/* ---------- React implementation ---------- */}
        <section className="ds-section" style={{ paddingBottom: 0 }}>
          <p className="ds-eyebrow">05 — Implementation notes (React + Vite)</p>
          <div className="ds-impl">
            <div className="ds-tree">
              <div className="block__head">
                <span className="block__head-label">component tree</span>
                <span className="block__head-meta">src/</span>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '20px 24px',
                  fontFamily: 'var(--mono)',
                  fontSize: 12.5,
                  lineHeight: 1.8,
                  color: '#33302a',
                  overflowX: 'auto',
                }}
              >
                {`src/
├── layout/
│   ├── SiteHeader.tsx
│   ├── MobileNav.tsx
│   └── SiteFooter.tsx
├── home/
│   ├── Hero.tsx
│   ├── FeaturedCard.tsx
│   ├── NoteListItem.tsx
│   ├── TopicGrid.tsx
│   └── LabCard.tsx
├── article/
│   ├── ArticleHeader.tsx
│   ├── Toc.tsx
│   ├── Prose.tsx        `}
                <span style={{ color: 'var(--faint)' }}># md renderer map</span>
                {`
│   └── RelatedCard.tsx
└── blocks/              `}
                <span style={{ color: 'var(--faint)' }}># md fence → component</span>
                {`
    ├── CodeBlock.tsx
    ├── Terminal.tsx
    ├── FileTree.tsx
    ├── Mermaid.tsx
    └── Callout.tsx`}
              </pre>
            </div>
            <ul className="ds-impl-list">
              <li>
                <span className="ds-principles__mark">a</span>
                <span>
                  <strong>Prose.tsx owns markdown.</strong> Map fenced-block languages (
                  <code>mermaid</code>, <code>tree</code>, <code>sh</code>) and callout directives
                  to the <code>blocks/</code> components at build time.
                </span>
              </li>
              <li>
                <span className="ds-principles__mark">b</span>
                <span>
                  <strong>Design tokens as CSS custom properties</strong> on <code>:root</code>{' '}
                  (colors, fonts, measure) — dark mode later becomes one attribute swap, no
                  component changes.
                </span>
              </li>
              <li>
                <span className="ds-principles__mark">c</span>
                <span>
                  <strong>Everything prerenders;</strong> only MobileNav, Toc scrollspy, and the
                  copy button hydrate — as tiny islands, not a page-level app.
                </span>
              </li>
              <li>
                <span className="ds-principles__mark">d</span>
                <span>
                  <strong>Fonts self-hosted</strong> with <code>font-display: swap</code> and
                  preloaded WOFF2 — the serif is the brand; it must not flash.
                </span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer--compact" style={{ marginTop: 72 }}>
        <div className="footer__inner">
          <Link to={HOME} className="brand">
            <span className="brand__name">Ponkcoding</span>
            <span className="dot" />
          </Link>
          <span className="footer__fine">
            Design system v2 · “Signal Notebook”
            <span className="dot" />
          </span>
        </div>
      </footer>
    </div>
  )
}
