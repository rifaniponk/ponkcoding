import React, { lazy, Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './styles/global.css'

/* Route-based code splitting: each page is its own chunk, fetched on
   navigation. The initial bundle carries only React, the router, and
   this shell. */
const Home = lazy(() => import('./pages/Home.tsx').then((m) => ({ default: m.Home })))
const Article = lazy(() => import('./pages/Article.tsx').then((m) => ({ default: m.Article })))
const DesignSystem = lazy(() =>
  import('./pages/DesignSystem.tsx').then((m) => ({ default: m.DesignSystem })),
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollManager />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles/:slug" element={<Article />} />
          <Route path="/design-system" element={<DesignSystem />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
