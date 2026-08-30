import { Link } from 'react-router-dom'
import './Profile.scss'
import { Tag } from '../../components'
import { PROFILE, SUMMARY, EXPERTISE, EXPERIENCE, EDUCATION, INTERESTS } from './Profile.data.ts'

const HOME = '/'

type SocialIconName = 'github' | 'x' | 'upwork'

function SocialIcon({ name }: { name: SocialIconName }) {
  return (
    <svg
      className="profile-hero__social-icon"
      viewBox={name === 'upwork' ? '0 0 448 512' : '0 0 16 16'}
      aria-hidden="true"
    >
      {name === 'github' && (
        <path d="M8 1.2a6.8 6.8 0 0 0-2.15 13.25c.34.06.47-.15.47-.33v-1.2c-1.9.41-2.3-.8-2.3-.8-.31-.79-.76-1-.76-1-.62-.43.05-.42.05-.42.68.05 1.04.7 1.04.7.61 1.04 1.6.74 1.99.57.06-.44.24-.74.43-.91-1.52-.17-3.12-.76-3.12-3.38 0-.75.27-1.36.7-1.84-.07-.17-.3-.87.07-1.82 0 0 .57-.18 1.87.7a6.5 6.5 0 0 1 3.4 0c1.3-.88 1.87-.7 1.87-.7.37.95.14 1.65.07 1.82.43.48.7 1.09.7 1.84 0 2.63-1.6 3.2-3.13 3.37.25.22.46.63.46 1.27v1.8c0 .18.12.4.48.33A6.8 6.8 0 0 0 8 1.2Z" />
      )}
      {name === 'x' && (
        <path d="M2.2 2.1h3.05l2.5 3.5 2.94-3.5h1.1L8.3 6.28l3.5 5.52H8.75L6.02 8 2.85 11.8H1.74l3.78-4.54L2.2 2.1Zm1.64.9 5.4 7.9h.94L4.8 3h-.96Z" />
      )}
      {name === 'upwork' && (
        <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM270.8 274.3c5.2 8.4 23.6 29.9 51.5 29.9v0c25.2 0 44.9-20.2 44.9-49.7s-19.4-49.7-44.9-49.7s-44.9 16.7-51.5 69.5zm-26.7-41.8c7.3-30.5 32.7-60.1 78.2-60.1l0 0c45.1 0 80.9 35.2 80.9 82.2s-35.9 81.9-80.9 81.9c-.6 0-1.1 0-1.7 0c-.5 0-1.1 0-1.6 0h-.1c-14.5-.5-28.7-4.8-40.9-12.6c-4.7-2.8-9.1-6-13.4-9.5l-12.8 78.4H214.9l19.4-110.6c-20.8-29.1-31.6-62.4-36.2-79.7V255c0 48-30.5 81.5-74.2 81.5c-22 0-41-8-54.8-23.3c-13.4-14.8-20.8-35.5-20.8-58.3V176.8H84.5l-.3 78.2c0 28.4 14.5 49.3 39.8 49.3s38.2-20.9 38.2-49.3V176.8h62.8c4.8 19.3 10.9 40.1 19.2 55.6z" />
      )}
    </svg>
  )
}

export function Profile() {
  return (
    <div className="page profile-page">
      <header className="header">
        <div className="header__inner">
          <Link to={HOME} className="brand">
            <img
              src="/images/avatar-logo.jpg"
              alt="Ponkcoding"
              className="brand__logo"
              width="32"
              height="32"
            />
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
                    <SocialIcon name="github" />@{PROFILE.github}
                  </a>
                </li>
                <li>
                  <a href={PROFILE.xUrl} target="_blank" rel="noreferrer">
                    <SocialIcon name="x" />@{PROFILE.x}
                  </a>
                </li>
                <li>
                  <a href={PROFILE.upworkUrl} target="_blank" rel="noreferrer">
                    <SocialIcon name="upwork" />
                    rifanfauzi
                  </a>
                </li>
              </ul>
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
      </main>

      <footer className="footer--compact">
        <div className="footer__inner">
          <Link to={HOME} className="brand">
            <img
              src="/images/avatar-logo.jpg"
              alt="Ponkcoding"
              className="brand__logo"
              width="32"
              height="32"
            />
            <span className="brand__name">Ponkcoding</span>
            <span className="dot" />
          </Link>
          <span className="footer__fine">© 2026 Rifan Fauzi · Bandung, Indonesia</span>
        </div>
      </footer>
    </div>
  )
}
