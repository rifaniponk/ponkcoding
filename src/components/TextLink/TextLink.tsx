import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './TextLink.scss'

/** Underlined text link. Router link when `to` is set, otherwise a span. */
export function TextLink({ children, to }: { children: ReactNode; to?: string }) {
  if (to) {
    return (
      <Link to={to} className="text-link">
        {children}
      </Link>
    )
  }
  return <span className="text-link">{children}</span>
}
