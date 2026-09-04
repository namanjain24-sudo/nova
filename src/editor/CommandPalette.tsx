import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, CornerDownLeft, FileText, Plus, Eye, Monitor, Tablet, Smartphone,
  LayoutTemplate, Database, Undo2, Redo2, Trash2, Sparkles, Component, ClipboardPaste, type LucideIcon,
} from 'lucide-react'
import { allBlocks } from '../core/schema'
import { redo, undo, useEditor } from '../store/editor'

interface Cmd {
  id: string
  label: string
  group: string
  icon: LucideIcon
  keywords?: string
  run: () => void
}

export function CommandPalette() {
  const open = useEditor((s) => s.commandOpen)
  const setOpen = useEditor((s) => s.setCommandOpen)
  const pages = useEditor((s) => s.pages)
  const selectedId = useEditor((s) => s.selectedId)
  const hasClipboard = useEditor((s) => !!s.clipboard)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Global ⌘K / Ctrl-K to open, from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useEditor.getState().setCommandOpen(!useEditor.getState().commandOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const commands = useMemo<Cmd[]>(() => {
    const s = useEditor.getState()
    const close = () => s.setCommandOpen(false)
    const list: Cmd[] = []

    // Pages
    for (const p of pages) {
      list.push({
        id: `page-${p.id}`,
        label: `Go to ${p.name}`,
        group: 'Pages',
        icon: FileText,
        keywords: `page ${p.path}`,
        run: () => { s.switchPage(p.id); close() },
      })
    }
    list.push({ id: 'page-new', label: 'Add a new page', group: 'Pages', icon: Plus, run: () => { s.addPage(); close() } })

    // Actions
    const act = (id: string, label: string, icon: LucideIcon, run: () => void, keywords = ''): Cmd =>
      ({ id, label, group: 'Actions', icon, keywords, run: () => { run(); close() } })
    list.push(
      act('preview', s.previewMode ? 'Exit preview' : 'Preview site', Eye, () => s.togglePreview(), 'view browse'),
      act('device-desktop', 'Device: Desktop', Monitor, () => s.setDevice('desktop')),
      act('device-tablet', 'Device: Tablet', Tablet, () => s.setDevice('tablet')),
      act('device-mobile', 'Device: Phone', Smartphone, () => s.setDevice('mobile')),
      act('sections', 'Add a section', LayoutTemplate, () => s.setSectionsOpen(true), 'insert block prebuilt'),
      act('templates', 'Browse templates', LayoutTemplate, () => s.setTemplatesOpen(true), 'new site start'),
      act('cms', 'Open CMS collections', Database, () => s.setCmsOpen(true), 'content data'),
      act('undo', 'Undo', Undo2, () => undo()),
      act('redo', 'Redo', Redo2, () => redo()),
      act('clear', 'Clear this page', Trash2, () => s.clearPage(), 'empty reset'),
    )
    if (hasClipboard) list.push(act('paste', 'Paste copied block', ClipboardPaste, () => s.pasteNode(), 'clipboard'))
    if (selectedId && selectedId !== s.doc.id) {
      const sel = selectedId
      list.push({
        id: 'save-component',
        label: 'Save selection as component',
        group: 'Actions',
        icon: Component,
        keywords: 'symbol reusable global',
        run: () => {
          const name = window.prompt('Name this component (reuse it on any page):', 'Component')
          if (name?.trim()) useEditor.getState().saveAsComponent(sel, name.trim())
          s.setCommandOpen(false)
        },
      })
    }

    // Add block — every registered block.
    for (const b of allBlocks()) {
      if (b.type === 'page') continue
      list.push({
        id: `add-${b.type}`,
        label: `Add ${b.name}`,
        group: 'Add block',
        icon: Sparkles,
        keywords: `${b.category} ${(b.keywords ?? []).join(' ')}`,
        run: () => { s.addBlock(b.type); s.setCommandOpen(false) },
      })
    }
    return list
  }, [pages, selectedId, hasClipboard])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    const terms = q.split(/\s+/)
    return commands.filter((c) => {
      const hay = `${c.label} ${c.group} ${c.keywords ?? ''}`.toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }, [commands, query])

  useEffect(() => { setActive(0) }, [query])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  const runActive = () => filtered[active]?.run()

  // Group headers in render order.
  const groups: string[] = []
  for (const c of filtered) if (!groups.includes(c.group)) groups.push(c.group)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink-950/70 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-pop w-full max-w-[600px] overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink-800 px-4">
          <Search className="size-4 shrink-0 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)) }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
              else if (e.key === 'Enter') { e.preventDefault(); runActive() }
              else if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
            }}
            placeholder="Search pages, blocks and actions…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-ink-700 bg-ink-850 px-1.5 py-0.5 text-[10px] font-semibold text-ink-400">ESC</kbd>
        </div>

        <div ref={listRef} className="nova-scroll max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-[13px] text-ink-500">No matches for “{query}”.</div>
          )}
          {groups.map((g) => (
            <div key={g} className="mb-1">
              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-ink-500">{g}</div>
              {filtered.map((c, i) =>
                c.group !== g ? null : (
                  <button
                    key={c.id}
                    data-idx={i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => c.run()}
                    className={`nova-focus flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition ${
                      i === active ? 'bg-brand-600/90 text-white' : 'text-ink-200 hover:bg-ink-800'
                    }`}
                  >
                    <c.icon className={`size-4 shrink-0 ${i === active ? 'text-white' : 'text-ink-400'}`} />
                    <span className="flex-1 truncate">{c.label}</span>
                    {i === active && <CornerDownLeft className="size-3.5 opacity-80" />}
                  </button>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
