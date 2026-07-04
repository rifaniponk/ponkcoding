/**
 * Renders build-time-generated article HTML. The Markdown source is owned by
 * the author, so the pre-rendered HTML is trusted (see AGENTS.md). If
 * user-generated content is ever introduced, sanitize before this point.
 */
export function MarkdownContent({ html }: { html: string }) {
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
