import { useEffect, useRef } from 'react'

/**
 * Renders build-time-generated article HTML. The Markdown source is owned by
 * the author, so the pre-rendered HTML is trusted (see AGENTS.md). If
 * user-generated content is ever introduced, sanitize before this point.
 */
export function MarkdownContent({ html }: { html: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const cleanups: Array<() => void> = []

    root.querySelectorAll('pre').forEach((pre) => {
      const code = pre.querySelector('code')
      if (!code) return

      const wrapper = document.createElement('div')
      wrapper.className = 'markdown__code-block'
      pre.before(wrapper)
      wrapper.append(pre)

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'markdown__copy'
      button.textContent = 'Copy'
      button.setAttribute('aria-label', 'Copy code to clipboard')
      wrapper.append(button)

      let resetTimer = 0
      const copy = async () => {
        try {
          await navigator.clipboard.writeText(code.textContent ?? '')
          button.textContent = 'Copied'
          button.setAttribute('aria-label', 'Code copied to clipboard')
          window.clearTimeout(resetTimer)
          resetTimer = window.setTimeout(() => {
            button.textContent = 'Copy'
            button.setAttribute('aria-label', 'Copy code to clipboard')
          }, 2000)
        } catch {
          button.textContent = 'Copy failed'
        }
      }

      button.addEventListener('click', copy)
      cleanups.push(() => {
        window.clearTimeout(resetTimer)
        button.removeEventListener('click', copy)
      })
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [html])

  return <div ref={rootRef} className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
