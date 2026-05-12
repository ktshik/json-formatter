import { useState } from 'react'

export function CopyButton({ text, disabled }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <button
      onClick={onCopy}
      disabled={disabled}
      className="font-mono text-xs text-zinc-500 transition hover:text-zinc-900 disabled:opacity-40 disabled:hover:text-zinc-500 dark:hover:text-zinc-100 dark:disabled:hover:text-zinc-500"
    >
      {copied ? 'copied' : 'copy'}
    </button>
  )
}
