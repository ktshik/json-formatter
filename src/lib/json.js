export function formatJson(value, indent) {
  const ind = indent === 0 ? undefined : indent
  return JSON.stringify(value, null, ind ?? 0)
}

export function parseLineCol(text, message) {
  const m = /position (\d+)/i.exec(message)
  if (!m) return null
  const pos = Number(m[1])
  if (Number.isNaN(pos)) return null
  let line = 1
  let col = 1
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text[i] === '\n') {
      line++
      col = 1
    } else {
      col++
    }
  }
  return { line, col }
}

export function prettyBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
