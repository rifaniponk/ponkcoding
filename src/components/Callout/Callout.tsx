import type { ReactNode } from 'react'
import './Callout.scss'

export type CalloutVariant = 'note' | 'tip' | 'caution'

const LABELS: Record<CalloutVariant, string> = {
  note: 'Note',
  tip: 'Tip',
  caution: 'Caution',
}

export function Callout({
  variant = 'note',
  children,
}: {
  variant?: CalloutVariant
  children: ReactNode
}) {
  return (
    <aside className={`callout callout--${variant}`}>
      <p className="callout__label">
        <span className="callout__marker" />
        <span>{LABELS[variant]}</span>
      </p>
      <p className="callout__body">{children}</p>
    </aside>
  )
}
