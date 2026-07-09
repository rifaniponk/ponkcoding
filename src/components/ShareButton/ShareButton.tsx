import { useState, useRef, useEffect } from 'react'
import './ShareButton.scss'

interface ShareButtonProps {
  slug: string
  shortId: string
}

export function ShareButton({ slug, shortId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState<'short' | 'long' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shortUrl = `${origin}/s/${shortId}`
  const longUrl = `${origin}/articles/${slug}`

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  async function copyToClipboard(text: string, type: 'short' | 'long') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div className="share-button" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={`share-button__trigger${copied ? ' share-button__trigger--copied' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={copied ? 'Copied!' : 'Share this article'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {copied ? (
          <span className="share-button__copied-text">copied</span>
        ) : (
          <svg className="share-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="share-button__dropdown" ref={dropdownRef} role="menu">
          <button
            type="button"
            className={`share-button__option share-button__item${copied === 'short' ? ' share-button__option--copied' : ''}`}
            role="menuitem"
            onClick={() => copyToClipboard(shortUrl, 'short')}
            disabled={copied === 'short'}
          >
            <div className="share-button__option-label">
              <svg className="share-button__option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Short URL
            </div>
            <div className="share-button__option-url">{shortUrl}</div>
            {copied === 'short' && (
              <svg className="share-button__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div className="share-button__divider" role="separator" />

          <button
            type="button"
            className={`share-button__option share-button__item${copied === 'long' ? ' share-button__option--copied' : ''}`}
            role="menuitem"
            onClick={() => copyToClipboard(longUrl, 'long')}
            disabled={copied === 'long'}
          >
            <div className="share-button__option-label">
              <svg className="share-button__option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Full URL
            </div>
            <div className="share-button__option-url">{longUrl}</div>
            {copied === 'long' && (
              <svg className="share-button__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}