import { useEffect, useRef } from 'react'

async function copyToClipboard(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Permission can be denied even when the Clipboard API exists.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

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
        const copied = await copyToClipboard(code.textContent ?? '')
        if (copied) {
          button.textContent = 'Copied!'
          button.dataset.state = 'success'
          button.setAttribute('aria-label', 'Code copied to clipboard')
        } else {
          button.textContent = 'Copy failed'
          button.dataset.state = 'error'
        }

        window.clearTimeout(resetTimer)
        resetTimer = window.setTimeout(() => {
          button.textContent = 'Copy'
          delete button.dataset.state
          button.setAttribute('aria-label', 'Copy code to clipboard')
        }, 2500)
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
