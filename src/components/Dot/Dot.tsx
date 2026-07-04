/**
 * Small square brand marker. The `.dot` class is a shared primitive defined in
 * styles/global.scss (it's also used bare in markup across the site).
 */
export function Dot({ pulse = false }: { pulse?: boolean }) {
  return <span className={`dot${pulse ? ' dot--pulse' : ''}`} />
}
