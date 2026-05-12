import { useEffect, useMemo, useRef } from 'react'

export function LineNumbers({ count, numbers, folds, folded, onToggleFold, scrollRef }) {
  const ref = useRef(null)
  const items = useMemo(() => {
    if (numbers) return numbers
    const n = Math.max(count ?? 1, 1)
    const out = new Array(n)
    for (let i = 0; i < n; i++) out[i] = i + 1
    return out
  }, [numbers, count])

  useEffect(() => {
    const target = scrollRef.current
    const inner = ref.current
    if (!target || !inner) return
    const sync = () => {
      inner.scrollTop = target.scrollTop
    }
    sync()
    target.addEventListener('scroll', sync, { passive: true })
    return () => target.removeEventListener('scroll', sync)
  }, [scrollRef, items.length])

  const digits = useMemo(
    () => String(items[items.length - 1] ?? 1).length,
    [items],
  )

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none shrink-0 select-none overflow-hidden border-r border-zinc-100 py-4 pl-2 pr-2 text-right font-mono text-sm leading-relaxed text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-600"
      style={{ minWidth: `calc(${digits}ch + 1.75rem)`, scrollbarWidth: 'none' }}
    >
      {items.map((n) => {
        const idx = n - 1
        const foldable = folds?.has(idx)
        const isFolded = folded?.has(idx)
        return (
          <div key={n} className="tabular-nums">
            {foldable ? (
              <span
                role="button"
                aria-label={isFolded ? 'Expand' : 'Collapse'}
                onClick={() => onToggleFold?.(idx)}
                className="pointer-events-auto mr-1 inline-block w-3 cursor-pointer text-center text-zinc-400 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
              >
                {isFolded ? '▸' : '▾'}
              </span>
            ) : (
              <span className="mr-1 inline-block w-3" />
            )}
            {n}
          </div>
        )
      })}
    </div>
  )
}
