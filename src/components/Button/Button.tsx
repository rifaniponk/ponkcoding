import type { ReactNode } from 'react'
import './Button.scss'

export interface ButtonProps {
  variant?: 'primary' | 'secondary'
  /** When set, renders an anchor styled as a button. */
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  href,
  target,
  rel,
  type,
  onClick,
  className,
  children,
}: ButtonProps) {
  const cls = `btn btn--${variant}${className ? ` ${className}` : ''}`
  if (href) {
    return (
      <a className={cls} href={href} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <button className={cls} type={type} onClick={onClick}>
      {children}
    </button>
  )
}
