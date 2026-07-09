import './PageSkeleton.scss'

export function PageSkeleton() {
  return (
    <div className="page-skeleton">
      <div className="page-skeleton__meta">
        <div className="page-skeleton__pill" />
        <div className="page-skeleton__pill page-skeleton__pill--sm" />
      </div>
      <div className="page-skeleton__title" />
      <div className="page-skeleton__lede" />
      <div className="page-skeleton__byline">
        <div className="page-skeleton__pill page-skeleton__pill--xs" />
        <div className="page-skeleton__pill page-skeleton__pill--xs" />
        <div className="page-skeleton__pill page-skeleton__pill--xs" />
      </div>
      <div className="page-skeleton__cover" />
      <div className="page-skeleton__body">
        <div className="page-skeleton__line" />
        <div className="page-skeleton__line" />
        <div className="page-skeleton__line page-skeleton__line--short" />
        <div className="page-skeleton__line" />
        <div className="page-skeleton__line" />
        <div className="page-skeleton__line" />
        <div className="page-skeleton__line page-skeleton__line--short" />
      </div>
    </div>
  )
}
