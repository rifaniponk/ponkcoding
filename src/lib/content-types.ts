export type ContentStatus = 'draft' | 'published'

export interface Heading {
  depth: number
  id: string
  label: string
}

/** Listing metadata — safe to import anywhere; carries no rendered HTML. */
export interface ArticleMeta {
  title: string
  slug: string
  description: string
  date: string
  updated?: string
  category: string
  tags: string[]
  status: ContentStatus
  cover?: string
  author: string
  featured: boolean
  readingTime: number
  shortId: string
}

/** Per-article body — loaded lazily, one chunk per article. */
export interface ArticleBody {
  html: string
  headings: Heading[]
}
