import { useEffect, useMemo, useRef, useState } from 'react'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { formatJson, parseLineCol, prettyBytes } from './lib/json.js'
import { useTheme } from './lib/theme.js'
import { Highlighted } from './components/Highlighted.jsx'
import { ThemeToggle } from './components/ThemeToggle.jsx'
import { IndentControl } from './components/IndentControl.jsx'
import { CopyButton } from './components/CopyButton.jsx'

const SAMPLE = `{
  "name": "json",
  "version": 1,
  "items": [1, 2, 3],
  "nested": { "ok": true, "value": null }
}`

export default function App() {
  const { theme, setTheme } = useTheme()
  const [input, setInput] = useState(SAMPLE)
  const [indent, setIndent] = useState(2)
  const [schemaOpen, setSchemaOpen] = useState(false)
  const [schemaText, setSchemaText] = useState('')

  const parsed = useMemo(() => {
    if (!input.trim()) return { ok: true, empty: true, value: undefined }
    try {
      return { ok: true, value: JSON.parse(input) }
    } catch (err) {
      return { ok: false, error: err.message, pos: parseLineCol(input, err.message) }
    }
  }, [input])

  const output = useMemo(() => {
    if (!parsed.ok || parsed.empty) return ''
    return formatJson(parsed.value, indent)
  }, [parsed, indent])

  const schemaParsed = useMemo(() => {
    if (!schemaOpen || !schemaText.trim()) return null
    try {
      return { ok: true, value: JSON.parse(schemaText) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }, [schemaOpen, schemaText])

  const validation = useMemo(() => {
    if (!schemaOpen || !parsed.ok || parsed.empty || !schemaParsed?.ok) return null
    try {
      const ajv = new Ajv({ allErrors: true, strict: false })
      addFormats(ajv)
      const validate = ajv.compile(schemaParsed.value)
      const valid = validate(parsed.value)
      return { valid, errors: validate.errors || [] }
    } catch (err) {
      return { valid: false, errors: [], compileError: err.message }
    }
  }, [schemaOpen, parsed, schemaParsed])

  const stats = useMemo(() => {
    if (!parsed.ok || parsed.empty) return null
    const bytes = new TextEncoder().encode(output || input).length
    return { bytes, lines: (output || input).split('\n').length }
  }, [parsed, output, input])

  const status = parsed.empty
    ? { tone: 'idle', text: 'Paste or type JSON' }
    : !parsed.ok
      ? { tone: 'error', text: parsed.error }
      : validation
        ? validation.compileError
          ? { tone: 'error', text: `Schema: ${validation.compileError}` }
          : validation.valid
            ? { tone: 'ok', text: 'Valid against schema' }
            : { tone: 'error', text: `${validation.errors.length} schema issue${validation.errors.length === 1 ? '' : 's'}` }
        : { tone: 'ok', text: 'Valid JSON' }

  return (
    <div className="flex h-full flex-col">
      <Header theme={theme} setTheme={setTheme} />

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-3 px-4 pb-4 sm:px-6">
        <div className="grid flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-2">
          <Pane
            label="Input"
            actions={
              <button
                onClick={() => setInput('')}
                className="text-xs text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Clear
              </button>
            }
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              placeholder="{}"
              className="scroll-thin h-full w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
            {!parsed.ok && !parsed.empty && (
              <ErrorBar message={parsed.error} pos={parsed.pos} />
            )}
          </Pane>

          <Pane
            label="Output"
            actions={
              <div className="flex items-center gap-3">
                <IndentControl value={indent} onChange={setIndent} />
                <CopyButton text={output} disabled={!output} />
              </div>
            }
          >
            {output ? (
              <Highlighted code={output} />
            ) : (
              <Placeholder>
                {parsed.empty ? 'Output appears here' : 'Fix errors to see output'}
              </Placeholder>
            )}
          </Pane>
        </div>

        <SchemaSection
          open={schemaOpen}
          onToggle={() => setSchemaOpen((v) => !v)}
          schemaText={schemaText}
          setSchemaText={setSchemaText}
          schemaParsed={schemaParsed}
          validation={validation}
        />

        <StatusBar status={status} stats={stats} />
      </main>
    </div>
  )
}

function Header({ theme, setTheme }) {
  return (
    <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-5 sm:px-6">
      <h1 className="font-mono text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
        json
      </h1>
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  )
}

function Pane({ label, actions, children }) {
  return (
    <section className="flex min-h-[40vh] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:min-h-0">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        {actions}
      </header>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </section>
  )
}

function Placeholder({ children }) {
  return (
    <div className="flex h-full items-center justify-center p-4 font-mono text-sm text-zinc-400 dark:text-zinc-600">
      {children}
    </div>
  )
}

function ErrorBar({ message, pos }) {
  return (
    <div className="border-t border-rose-200 bg-rose-50 px-4 py-2 font-mono text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
      {pos ? <span className="mr-2 opacity-60">L{pos.line}:{pos.col}</span> : null}
      {message}
    </div>
  )
}

function SchemaSection({ open, onToggle, schemaText, setSchemaText, schemaParsed, validation }) {
  const ref = useRef(null)
  useEffect(() => {
    if (open && ref.current) ref.current.focus()
  }, [open])

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <span className="flex items-center gap-2">
          <Chevron open={open} />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Schema
          </span>
          {open && schemaParsed && !schemaParsed.ok && (
            <span className="font-mono text-xs text-rose-600 dark:text-rose-400">
              invalid schema
            </span>
          )}
        </span>
        {open && validation && !validation.compileError && (
          <span
            className={
              validation.valid
                ? 'font-mono text-xs text-emerald-600 dark:text-emerald-400'
                : 'font-mono text-xs text-rose-600 dark:text-rose-400'
            }
          >
            {validation.valid ? '✓ valid' : `✗ ${validation.errors.length} issue${validation.errors.length === 1 ? '' : 's'}`}
          </span>
        )}
      </button>
      {open && (
        <div className="grid grid-cols-1 border-t border-zinc-200 lg:grid-cols-2 dark:border-zinc-800">
          <textarea
            ref={ref}
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            placeholder={'{\n  "type": "object",\n  "required": ["name"],\n  "properties": {\n    "name": { "type": "string" }\n  }\n}'}
            className="scroll-thin h-56 w-full resize-none border-b border-zinc-200 bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 lg:border-b-0 lg:border-r"
          />
          <div className="scroll-thin h-56 overflow-auto p-4 font-mono text-xs">
            {!schemaText.trim() ? (
              <p className="text-zinc-400 dark:text-zinc-600">
                Provide a JSON Schema to validate the input above.
              </p>
            ) : schemaParsed && !schemaParsed.ok ? (
              <p className="text-rose-600 dark:text-rose-400">{schemaParsed.error}</p>
            ) : validation?.compileError ? (
              <p className="text-rose-600 dark:text-rose-400">{validation.compileError}</p>
            ) : validation?.valid ? (
              <p className="text-emerald-600 dark:text-emerald-400">
                Document matches schema.
              </p>
            ) : validation && validation.errors.length > 0 ? (
              <ul className="space-y-1.5">
                {validation.errors.map((e, i) => (
                  <li key={i} className="text-zinc-700 dark:text-zinc-300">
                    <span className="text-zinc-400 dark:text-zinc-600">
                      {e.instancePath || '/'}
                    </span>
                    <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-rose-600 dark:text-rose-400">{e.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-400 dark:text-zinc-600">Waiting for input…</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function StatusBar({ status, stats }) {
  const tone = {
    ok: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-rose-600 dark:text-rose-400',
    idle: 'text-zinc-500',
  }[status.tone]
  return (
    <footer className="flex items-center justify-between px-1 font-mono text-xs text-zinc-500">
      <span className={tone}>{status.text}</span>
      {stats && (
        <span className="tabular-nums">
          {stats.lines} lines · {prettyBytes(stats.bytes)}
        </span>
      )}
    </footer>
  )
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-3 w-3 text-zinc-400 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 5l6 5-6 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
