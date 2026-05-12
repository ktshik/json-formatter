import { useEffect, useMemo, useRef } from 'react'

export function LineNumbers({ count, scrollRef }) {
  const ref = useRef(null)
  const safeCount = Math.max(count, 1)

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
  }, [scrollRef, safeCount])

  const digits = useMemo(() => String(safeCount).length, [safeCount])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none shrink-0 select-none overflow-hidden border-r border-zinc-100 py-4 pl-3 pr-3 text-right font-mono text-sm leading-relaxed text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-600"
      style={{ minWidth: `calc(${digits}ch + 1.5rem)`, scrollbarWidth: 'none' }}
    >
      {Array.from({ length: safeCount }, (_, i) => (
        <div key={i} className="tabular-nums">
          {i + 1}
        </div>
      ))}
    </div>
  )
}
