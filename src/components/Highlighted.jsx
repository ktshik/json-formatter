import { useMemo } from 'react'

const TOKEN_RE =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightLine(src) {
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
  return out || '​'
}

function render(src, indent) {
  if (indent <= 0) return highlightLine(src)
  const lines = src.split('\n')
  return lines
    .map((line) => {
      const lead = line.match(/^( *)/)[0]
      const rest = line.slice(lead.length)
      const levels = Math.floor(lead.length / indent)
      const extra = lead.length - levels * indent
      let guides = ''
      for (let i = 0; i < levels; i++) {
        guides += `<span class="ind" style="width:${indent}ch">${' '.repeat(indent)}</span>`
      }
      if (extra > 0) guides += ' '.repeat(extra)
      return `<div class="ln">${guides}${highlightLine(rest)}</div>`
    })
    .join('')
}

export function Highlighted({ code, indent, scrollRef }) {
  const html = useMemo(() => render(code, indent), [code, indent])
  return (
    <pre
      ref={scrollRef}
      className="scroll-thin m-0 h-full w-full flex-1 overflow-auto whitespace-pre p-4 font-mono text-sm leading-relaxed"
      style={{ tabSize: indent || 2 }}
    >
      <code
        className="[&_.tk-key]:text-zinc-900 [&_.tk-key]:dark:text-zinc-100 [&_.tk-str]:text-emerald-700 [&_.tk-str]:dark:text-emerald-400 [&_.tk-num]:text-amber-700 [&_.tk-num]:dark:text-amber-400 [&_.tk-bool]:text-violet-700 [&_.tk-bool]:dark:text-violet-400 [&_.tk-null]:text-rose-600 [&_.tk-null]:dark:text-rose-400 [&_.tk-punct]:text-zinc-400 [&_.tk-punct]:dark:text-zinc-500 text-zinc-600 dark:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  )
}
