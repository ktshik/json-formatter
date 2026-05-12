import { useMemo } from 'react'

const TOKEN_RE =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlight(src) {
  let out = ''
  let last = 0
  src.replace(TOKEN_RE, (match, key, str, bool, nul, num, punct, offset) => {
    out += escapeHtml(src.slice(last, offset))
    if (key) out += `<span class="tk-key">${escapeHtml(key)}</span>`
    else if (str) out += `<span class="tk-str">${escapeHtml(str)}</span>`
    else if (bool) out += `<span class="tk-bool">${bool}</span>`
    else if (nul) out += `<span class="tk-null">${nul}</span>`
    else if (num) out += `<span class="tk-num">${num}</span>`
    else if (punct) out += `<span class="tk-punct">${punct}</span>`
    last = offset + match.length
    return match
  })
  out += escapeHtml(src.slice(last))
  return out
}

export function Highlighted({ code }) {
  const html = useMemo(() => highlight(code), [code])
  return (
    <pre
      className="scroll-thin m-0 h-full w-full overflow-auto whitespace-pre p-4 font-mono text-sm leading-relaxed"
      style={{ tabSize: 2 }}
    >
      <code
        className="[&_.tk-key]:text-zinc-900 [&_.tk-key]:dark:text-zinc-100 [&_.tk-str]:text-emerald-700 [&_.tk-str]:dark:text-emerald-400 [&_.tk-num]:text-amber-700 [&_.tk-num]:dark:text-amber-400 [&_.tk-bool]:text-violet-700 [&_.tk-bool]:dark:text-violet-400 [&_.tk-null]:text-rose-600 [&_.tk-null]:dark:text-rose-400 [&_.tk-punct]:text-zinc-400 [&_.tk-punct]:dark:text-zinc-500 text-zinc-600 dark:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  )
}
