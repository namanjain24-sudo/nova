import { useRef, useState } from 'react'
import { Loader2, Trash2, Type, Upload } from 'lucide-react'
import { getTheme } from '../theme/engine'
import { COLOR_THEMES, FONT_PAIRS } from '../theme/engine'
import { useEditor } from '../store/editor'
import { FONT_ACCEPT, familyStack, fileToFont, stackUsesFamily } from '../theme/fonts'
import { cn } from '../lib/cn'

export function ThemePanel() {
  const doc = useEditor((s) => s.doc)
  const setTheme = useEditor((s) => s.setTheme)
  const theme = getTheme(doc)

  return (
    <div className="nova-scroll flex-1 overflow-y-auto px-4 py-4">
      <p className="mb-4 text-[12px] leading-relaxed text-ink-400">
        Restyle the entire page in one click. Accent colours and fonts update everywhere at once.
      </p>

      {/* Color themes */}
      <div className="mb-6">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
          Accent color
        </div>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_THEMES.map((c) => {
            const active = theme.accent.toLowerCase() === c.accent.toLowerCase()
            return (
              <button
                key={c.name}
                title={c.name}
                onClick={() => setTheme({ accent: c.accent, accent2: c.accent2 })}
                className={cn(
                  'nova-focus group relative flex aspect-square items-center justify-center rounded-xl transition',
                  active ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-900' : 'hover:scale-105',
                )}
                style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }}
              >
                {active && <span className="size-1.5 rounded-full bg-white shadow" />}
              </button>
            )
          })}
        </div>

        {/* custom accent */}
        <label className="mt-3 flex items-center gap-2.5 rounded-lg border border-ink-700 bg-ink-850 px-2.5 py-2">
          <span
            className="size-5 shrink-0 rounded-md ring-1 ring-black/20"
            style={{ backgroundColor: theme.accent }}
          />
          <span className="flex-1 text-[12px] text-ink-300">Custom accent</span>
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(theme.accent) ? theme.accent : '#7c3aed'}
            onChange={(e) => setTheme({ accent: e.target.value, accent2: e.target.value })}
            className="size-6 cursor-pointer rounded bg-transparent"
          />
        </label>
      </div>

      {/* Font pairings */}
      <div>
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
          Font pairing
        </div>
        <div className="flex flex-col gap-2">
          {FONT_PAIRS.map((f) => {
            const active = theme.fontHead === f.head && theme.fontBody === f.body
            return (
              <button
                key={f.name}
                onClick={() => setTheme({ fontHead: f.head, fontBody: f.body })}
                className={cn(
                  'nova-focus flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition',
                  active
                    ? 'border-brand-500/60 bg-brand-500/10'
                    : 'border-ink-700 bg-ink-850 hover:border-ink-600 hover:bg-ink-800',
                )}
              >
                <div className="min-w-0">
                  <div
                    className="truncate text-[19px] leading-tight text-ink-100"
                    style={{ fontFamily: f.head }}
                  >
                    {f.name}
                  </div>
                  <div className="truncate text-[12px] text-ink-400" style={{ fontFamily: f.body }}>
                    The quick brown fox jumps
                  </div>
                </div>
                {active && <span className="ml-2 size-2 shrink-0 rounded-full bg-brand-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom fonts */}
      <CustomFonts />
    </div>
  )
}

function CustomFonts() {
  const fonts = useEditor((s) => s.fonts)
  const doc = useEditor((s) => s.doc)
  const theme = getTheme(doc)

  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        const font = await fileToFont(file)
        useEditor.getState().addFont(font)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that font.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const apply = (name: string, slot: 'head' | 'body') =>
    useEditor.getState().setTheme(
      slot === 'head' ? { fontHead: familyStack(name) } : { fontBody: familyStack(name) },
    )

  return (
    <div className="mt-6">
      <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
        Custom fonts
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={FONT_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => void onFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          'nova-focus flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-700 bg-ink-850/50 px-3 py-3 text-[12.5px] font-medium text-ink-300 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-ink-100',
          busy && 'cursor-wait opacity-70',
        )}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 text-brand-400" />}
        {busy ? 'Adding…' : 'Upload a font'}
      </button>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
        .woff2, .woff, .ttf or .otf — embedded in your export so it works anywhere.
      </p>

      {error && (
        <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-400">
          {error}
        </div>
      )}

      {fonts.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {fonts.map((f) => {
            const stack = familyStack(f.name)
            const isHead = stackUsesFamily(theme.fontHead, f.name)
            const isBody = stackUsesFamily(theme.fontBody, f.name)
            return (
              <div
                key={f.id}
                className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-900 text-[17px] leading-none text-ink-100"
                    style={{ fontFamily: stack, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal' }}
                  >
                    Ag
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-ink-100" style={{ fontFamily: stack }}>
                      {f.name}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      {f.weight} · {f.italic ? 'italic' : 'normal'} · {f.format}
                    </div>
                  </div>
                  <button
                    onClick={() => useEditor.getState().removeFont(f.id)}
                    aria-label={`Remove ${f.name}`}
                    className="nova-focus grid size-7 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <ApplyBtn active={isHead} onClick={() => apply(f.name, 'head')} label="Headings" />
                  <ApplyBtn active={isBody} onClick={() => apply(f.name, 'body')} label="Body" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ApplyBtn({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'nova-focus flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold transition',
        active
          ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
          : 'border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600 hover:text-ink-100',
      )}
    >
      <Type className="size-3" />
      {label}
      {active && <span className="size-1.5 rounded-full bg-brand-400" />}
    </button>
  )
}
