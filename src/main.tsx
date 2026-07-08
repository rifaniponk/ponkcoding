import React, { lazy, Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom'
import './styles/global.scss'

/* Route-based code splitting: each page is its own chunk, fetched on
   navigation. The initial bundle carries only React, the router, and
   this shell. */
const Home = lazy(() => import('./pages/Home/Home.tsx').then((m) => ({ default: m.Home })))
const Article = lazy(() =>
  import('./pages/Article/Article.tsx').then((m) => ({ default: m.Article })),
)
const DesignSystem = lazy(() =>
  import('./pages/DesignSystem/DesignSystem.tsx').then((m) => ({ default: m.DesignSystem })),
)
const Profile = lazy(() =>
  import('./pages/Profile/Profile.tsx').then((m) => ({ default: m.Profile })),
)

/* On client-side navigation: scroll to the hash target if present, else to
   the top. The target may not exist yet on the first frame when a lazy page
   chunk is still loading, so retry across a few frames. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    let frame = 0
    let tries = 0
    const tick = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) el.scrollIntoView()
      else if (tries++ < 30) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  return null
}

/* Short URL redirect: /s/:shortId -> /articles/:slug */
function ShortUrlRedirect() {
  const { shortId } = useParams<{ shortId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!shortId) return
    import('./generated/content-index.ts').then(({ ARTICLES }) => {
      const article = ARTICLES.find((a) => a.shortId === shortId)
      if (article) {
        navigate(`/articles/${article.slug}`, { replace: true })
      }
    })
  }, [shortId, navigate])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollManager />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles/:slug" element={<Article />} />
          <Route path="/s/:shortId" element={<ShortUrlRedirect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/design-system" element={<DesignSystem />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
