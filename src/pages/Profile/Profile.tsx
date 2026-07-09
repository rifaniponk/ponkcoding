import { Link } from 'react-router-dom'
import './Profile.scss'
import { Button, Tag } from '../../components'
import { PROFILE, SUMMARY, EXPERTISE, EXPERIENCE, EDUCATION, INTERESTS } from './Profile.data.ts'

const HOME = '/'

export function Profile() {
  return (
    <div className="page profile-page">
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
            {/*<Link to={`${HOME}#lab`} className="nav__link">
              Lab
            </Link>*/}
            <Link to={HOME} className="nav__link">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="profile">
        {/* ---------- Hero ---------- */}
        <section className="profile-hero">
          <div className="profile-hero__layout">
            <div>
              <p className="profile-hero__eyebrow">Profile / Overview</p>
              <h1 className="profile-hero__name">{PROFILE.name}</h1>
              <p className="profile-hero__title">{PROFILE.title}</p>
              <ul className="profile-hero__meta">
                <li>{PROFILE.location}</li>
                <li>
                  <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer">
                    GitHub @{PROFILE.github}
                  </a>
                </li>
                <li>
                  <a href={PROFILE.xUrl} target="_blank" rel="noreferrer">
                    X @{PROFILE.x}
                  </a>
                </li>
              </ul>
              <div className="profile-hero__actions">
                <Button href={PROFILE.upworkUrl} target="_blank" rel="noreferrer">
                  Hire on Upwork ↗
                </Button>
                <Button variant="secondary" href={PROFILE.xUrl} target="_blank" rel="noreferrer">
                  Message on X ↗
                </Button>
              </div>
            </div>
            <div className="profile-hero__portrait-frame">
              <img
                className="profile-hero__portrait"
                src="/images/rifan-profile.jpg"
                alt="Rifan Fauzi standing in an office"
                width="1086"
                height="1448"
              />
            </div>
          </div>
        </section>

        {/* ---------- Summary ---------- */}
        <section className="profile-section">
          <div className="profile-section__head">
            <span className="profile-section__no">01</span>
            <h2>Professional summary</h2>
          </div>
          <div className="profile-prose">
            {SUMMARY.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* ---------- Core expertise ---------- */}
        <section className="profile-section">
          <div className="profile-section__head">
            <span className="profile-section__no">02</span>
            <h2>Core expertise</h2>
          </div>
          <div className="profile-expertise">
            {EXPERTISE.map((group) => (
              <div key={group.domain} className="profile-expertise__group">
                <h3 className="profile-expertise__domain">{group.domain}</h3>
                <div className="profile-expertise__skills">
                  {group.skills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Experience (overview only) ---------- */}
        <section className="profile-section">
          <div className="profile-section__head">
            <span className="profile-section__no">03</span>
            <h2>Experience overview</h2>
          </div>
          <ol className="profile-timeline">
            {EXPERIENCE.map((job) => (
              <li key={`${job.company}-${job.role}`} className="profile-job">
                <div className="profile-job__body">
                  <h3 className="profile-job__role">{job.role}</h3>
                  <p className="profile-job__company">{job.company}</p>
                  <p className="profile-job__domain">{job.domain}</p>
                  <ul className="profile-job__points">
                    {job.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Education + interests ---------- */}
        <section className="profile-section profile-section--split">
          <div className="profile-split">
            <div>
              <div className="profile-section__head">
                <span className="profile-section__no">04</span>
                <h2>Education</h2>
              </div>
              <p className="profile-edu__degree">{EDUCATION.degree}</p>
              <p className="profile-edu__school">{EDUCATION.school}</p>
            </div>
            <div>
              <div className="profile-section__head">
                <span className="profile-section__no">05</span>
                <h2>Current interests</h2>
              </div>
              <div className="profile-expertise__skills">
                {INTERESTS.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Freelance ---------- */}
        <section className="profile-cta">
          <h2>Available for freelance & consulting</h2>
          <p>Part-time software engineering through Upwork and independent engagements.</p>
          <Button href={PROFILE.upworkUrl} target="_blank" rel="noreferrer">
            View Upwork profile ↗
          </Button>
        </section>
      </main>

      <footer className="footer--compact">
        <div className="footer__inner">
          <Link to={HOME} className="brand">
            <span className="brand__name">Ponkcoding</span>
            <span className="dot" />
          </Link>
          <span className="footer__fine">© 2026 Rifan Fauzi · Bandung, Indonesia</span>
        </div>
      </footer>
    </div>
  )
}
