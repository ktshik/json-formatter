const OPTIONS = [
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: 'min', value: 0 },
]

export function IndentControl({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Indent"
      className="flex items-center gap-0.5 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={
            'rounded px-2 py-0.5 font-mono text-xs transition ' +
            (value === opt.value
              ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
