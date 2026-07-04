/** Presentation-only: accent color per content category. */
export const CATEGORY_COLORS: Record<string, string> = {
  'Web Development': '#e6532f',
  'AI Engineering': '#5F6FBA',
  'Apple / Local AI': '#7557d3',
  'Indie Dev': '#14816f',
  'Independent Work': '#987510',
}

export const categoryColor = (category: string): string =>
  CATEGORY_COLORS[category] ?? '#5F6FBA'
