import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

/* Route-based code splitting: each page is its own chunk, fetched on
   navigation. The initial bundle carries only React, the router, and
   this shell. */
const Home = lazy(() => import('./Home.tsx').then((m) => ({ default: m.Home })))
const Article = lazy(() => import('./Article.tsx').then((m) => ({ default: m.Article })))
const DesignSystem = lazy(() =>
  import('./DesignSystem.tsx').then((m) => ({ default: m.DesignSystem })),
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article" element={<Article />} />
          <Route path="/design-system" element={<DesignSystem />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
