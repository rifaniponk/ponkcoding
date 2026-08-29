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

function openImageLightbox({ src, alt, title }: { src: string; alt: string; title: string }) {
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  const lightbox = document.createElement('div')
  lightbox.className = 'markdown-lightbox'
  lightbox.setAttribute('role', 'dialog')
  lightbox.setAttribute('aria-modal', 'true')
  lightbox.setAttribute('aria-label', `${title} screenshot preview`)

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'markdown-lightbox__close'
  closeButton.setAttribute('aria-label', 'Close screenshot preview')
  closeButton.textContent = '×'

  const figure = document.createElement('figure')
  figure.className = 'markdown-lightbox__figure'

  const image = document.createElement('img')
  image.className = 'markdown-lightbox__image'
  image.src = src
  image.alt = alt

  const caption = document.createElement('figcaption')
  caption.className = 'markdown-lightbox__caption'
  caption.textContent = title

  figure.append(image, caption)
  lightbox.append(closeButton, figure)
  document.body.append(lightbox)
  closeButton.focus()

  const close = () => {
    document.body.style.overflow = previousOverflow
    window.removeEventListener('keydown', onKeyDown)
    lightbox.remove()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
  }

  lightbox.addEventListener('click', close)
  closeButton.addEventListener('click', close)
  figure.addEventListener('click', (event) => event.stopPropagation())
  window.addEventListener('keydown', onKeyDown)
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

      let wrapper = pre.parentElement
      if (!wrapper?.classList.contains('markdown__code-block')) {
        wrapper = document.createElement('div')
        wrapper.className = 'markdown__code-block'
        pre.before(wrapper)
        wrapper.append(pre)
      }

      let button = wrapper.querySelector<HTMLButtonElement>(':scope > .markdown__copy')
      if (!button) {
        button = document.createElement('button')
        button.type = 'button'
        button.className = 'markdown__copy'
        button.textContent = 'Copy'
        button.setAttribute('aria-label', 'Copy code to clipboard')
        wrapper.append(button)
      }

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

    root.querySelectorAll('table').forEach((table) => {
      let wrapper = table.parentElement
      if (!wrapper?.classList.contains('markdown__table-scroll')) {
        wrapper = document.createElement('div')
        wrapper.className = 'markdown__table-scroll'
        wrapper.tabIndex = 0
        wrapper.setAttribute('role', 'region')
        wrapper.setAttribute('aria-label', 'Scrollable table')
        table.before(wrapper)
        wrapper.append(table)
      }

      const imageCells = Array.from(
        table.querySelectorAll<HTMLTableCellElement>('tbody td'),
      ).filter((cell) => cell.querySelector('img'))

      if (imageCells.length === 0) return

      wrapper.classList.add('markdown__table-scroll--image-compare')
      table.classList.add('markdown__image-compare')
      wrapper.setAttribute('aria-label', 'Screenshot comparison gallery')

      const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'))

      imageCells.forEach((cell) => {
        const img = cell.querySelector<HTMLImageElement>('img')
        if (!img || img.closest('.markdown__image-card')) return

        const row = cell.parentElement
        const cellIndex = row ? Array.from(row.children).indexOf(cell) : -1
        const title = headers[cellIndex]?.textContent?.trim() || img.alt || 'Screenshot'
        const source = img.getAttribute('src') ?? img.src
        const alt = img.alt || `${title} screenshot`

        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'markdown__image-card'
        button.setAttribute('aria-label', `Open ${title} screenshot`)
        button.dataset.lightboxSrc = source
        button.dataset.lightboxAlt = alt
        button.dataset.lightboxTitle = title

        const titleEl = document.createElement('span')
        titleEl.className = 'markdown__image-card-title'
        titleEl.textContent = title

        const hintEl = document.createElement('span')
        hintEl.className = 'markdown__image-card-hint'
        hintEl.textContent = 'Click to enlarge'

        img.loading = 'lazy'
        img.decoding = 'async'
        img.alt = alt
        button.append(img, titleEl, hintEl)
        cell.replaceChildren(button)
      })
    })

    const openImageCard = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const card = target.closest<HTMLButtonElement>('.markdown__image-card')
      if (!card) return

      const source = card.dataset.lightboxSrc
      if (!source) return

      openImageLightbox({
        src: source,
        alt: card.dataset.lightboxAlt ?? card.getAttribute('aria-label') ?? 'Screenshot',
        title: card.dataset.lightboxTitle ?? 'Screenshot',
      })
    }

    root.addEventListener('click', openImageCard)
    cleanups.push(() => root.removeEventListener('click', openImageCard))

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [html])

  return <div ref={rootRef} className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
