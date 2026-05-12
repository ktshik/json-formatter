export function formatJson(value, indent) {
  const ind = indent === 0 ? undefined : indent
  return JSON.stringify(value, null, ind ?? 0)
}

export function caretFromIndex(text, index) {
  let line = 1
  let col = 1
  const max = Math.min(index, text.length)
  for (let i = 0; i < max; i++) {
    if (text.charCodeAt(i) === 10) {
      line++
      col = 1
    } else {
      col++
    }
  }
  return { line, col }
}

export function computeFolds(lines) {
  const folds = new Map()
  const stack = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()
    const first = trimmed[0]
    if (first === '}' || first === ']') {
      const openLine = stack.pop()
      if (openLine != null && i > openLine + 1) {
        folds.set(openLine, { end: i, close: first })
      }
    }
    const trimmedEnd = line.trimEnd()
    const last = trimmedEnd[trimmedEnd.length - 1]
    if (last === '{' || last === '[') {
      stack.push(i)
    }
  }
  return folds
}

export function getVisibleLineIndices(lineCount, folds, folded) {
  const visible = []
  let i = 0
  while (i < lineCount) {
    visible.push(i)
    if (folded.has(i) && folds.has(i)) {
      i = folds.get(i).end + 1
    } else {
      i++
    }
  }
  return visible
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
