import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './Home.tsx'
import { Article } from './Article.tsx'
import { DesignSystem } from './DesignSystem.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article" element={<Article />} />
        <Route path="/design-system" element={<DesignSystem />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
