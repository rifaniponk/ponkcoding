/**
 * Build-time content pipeline.
 *
 * Reads content/articles/*.md, validates frontmatter, converts Markdown to
 * HTML, and emits generated TypeScript:
 *   src/generated/content-index.ts       — listing metadata (no HTML)
 *   src/generated/articles/<slug>.ts      — one lazy body chunk per article
 *
 * Drafts are excluded when NODE_ENV=production. Run via `npm run generate:content`.
 */
import { readdir, readFile, writeFile, rm, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { toString as hastToString } from 'hast-util-to-string'
import type { ArticleMeta, Heading } from '../src/lib/content-types.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = join(ROOT, 'content/articles')
const OUT_DIR = join(ROOT, 'src/generated')
const BODY_DIR = join(OUT_DIR, 'articles')
const IS_PROD = process.env.NODE_ENV === 'production'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Collects heading elements (h2/h3) into the passed array after slug ids exist. */
function collectHeadings(out: Heading[]) {
  return () => (tree: unknown) => {
    visit(tree as never, 'element', (node: any) => {
      if ((node.tagName === 'h2' || node.tagName === 'h3') && node.properties?.id) {
        out.push({
          depth: Number(node.tagName.slice(1)),
          id: String(node.properties.id),
          label: hastToString(node),
        })
      }
    })
  }
}

async function markdownToHtml(md: string, headings: Heading[]): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(collectHeadings(headings))
    .use(rehypeStringify)
    .process(md)
  return String(file)
}

function readingTime(md: string): number {
  const words = md.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function fail(file: string, message: string): never {
  throw new Error(`[content] ${file}: ${message}`)
}

function validate(file: string, data: Record<string, unknown>) {
  if (!data.title || typeof data.title !== 'string') fail(file, 'title is required')
  if (!data.slug || typeof data.slug !== 'string') fail(file, 'slug is required')
  if (!data.description || typeof data.description !== 'string')
    fail(file, 'description is required')
  if (typeof data.date !== 'string' || !ISO_DATE.test(data.date))
    fail(file, 'date must be an ISO date (YYYY-MM-DD)')
  if (
    data.updated !== undefined &&
    (typeof data.updated !== 'string' || !ISO_DATE.test(data.updated))
  )
    fail(file, 'updated must be an ISO date (YYYY-MM-DD)')
  if (!data.category || typeof data.category !== 'string') fail(file, 'category is required')
  if (!Array.isArray(data.tags)) fail(file, 'tags must be an array')
  if (data.status !== 'draft' && data.status !== 'published')
    fail(file, 'status must be "draft" or "published"')
  if (!data.author || typeof data.author !== 'string') fail(file, 'author is required')
  if (data.cover !== undefined && (typeof data.cover !== 'string' || !data.cover.startsWith('/')))
    fail(file, 'cover must be an absolute path from public (e.g. /images/x.png)')
}

async function run() {
  let files: string[]
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'))
  } catch {
    fail(CONTENT_DIR, 'content directory not found')
  }
  if (files.length === 0) fail(CONTENT_DIR, 'no markdown files found')

  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(BODY_DIR, { recursive: true })

  const metas: ArticleMeta[] = []
  const seenSlugs = new Set<string>()

  for (const file of files.sort()) {
    const raw = await readFile(join(CONTENT_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    validate(file, data)

    const slug = data.slug as string
    if (seenSlugs.has(slug)) fail(file, `duplicate slug "${slug}"`)
    seenSlugs.add(slug)

    const status = data.status as 'draft' | 'published'
    if (IS_PROD && status !== 'published') continue

    const headings: Heading[] = []
    const html = await markdownToHtml(content, headings)

    const meta: ArticleMeta = {
      title: data.title as string,
      slug,
      description: data.description as string,
      date: data.date as string,
      updated: data.updated as string | undefined,
      category: data.category as string,
      tags: data.tags as string[],
      status,
      cover: data.cover as string | undefined,
      author: data.author as string,
      featured: data.featured === true,
      readingTime: readingTime(content),
    }
    metas.push(meta)

    await writeFile(
      join(BODY_DIR, `${slug}.ts`),
      `// AUTO-GENERATED by scripts/generate-content-index.ts — do not edit.\n` +
        `import type { ArticleBody } from '../../lib/content-types.ts'\n\n` +
        `export const body: ArticleBody = ${JSON.stringify({ html, headings }, null, 2)}\n`,
    )
  }

  // Newest first.
  metas.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  await writeFile(
    join(OUT_DIR, 'content-index.ts'),
    `// AUTO-GENERATED by scripts/generate-content-index.ts — do not edit.\n` +
      `import type { ArticleMeta } from '../lib/content-types.ts'\n\n` +
      `export const ARTICLES: ArticleMeta[] = ${JSON.stringify(metas, null, 2)}\n`,
  )

  console.log(
    `[content] generated ${metas.length} article(s)${IS_PROD ? ' (production: drafts excluded)' : ''}`,
  )
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
