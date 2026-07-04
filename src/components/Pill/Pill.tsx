import type { ReactNode } from 'react'
import './Pill.scss'

/** Uppercase mono category label. */
export function Pill({ children }: { children: ReactNode }) {
  return <span className="category-pill">{children}</span>
}
