import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Tag.scss'

/** Mono tag pill. Renders a router link when `to` is set, otherwise a span. */
export function Tag({ children, to }: { children: ReactNode; to?: string }) {
  if (to) {
    return (
      <Link to={to} className="tag">
        {children}
      </Link>
    )
  }
  return <span className="tag">{children}</span>
}
