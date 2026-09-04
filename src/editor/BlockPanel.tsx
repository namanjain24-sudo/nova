import { useMemo, useState } from 'react'
import { Component, LayoutTemplate, Pencil, Search, Trash2 } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { allBlocks, type BlockDefinition } from '../core/schema'
import { useEditor } from '../store/editor'
import { cn } from '../lib/cn'

const CATEGORY_ORDER: BlockDefinition['category'][] = [
  'layout',
  'content',
  'media',
  'form',
  'section',
]
const CATEGORY_LABEL: Record<string, string> = {
  layout: 'Layout',
  content: 'Content',
  media: 'Media',
  form: 'Forms',
  section: 'Sections',
}

export function BlockPanel() {
  const [query, setQuery] = useState('')
  const addBlock = useEditor((s) => s.addBlock)

  const grouped = useMemo(() => {
    const blocks = allBlocks().filter((b) => b.type !== 'page' && b.type !== 'instance')
    const q = query.trim().toLowerCase()
    const filtered = q
      ? blocks.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.keywords?.some((k) => k.includes(q)),
        )
      : blocks
    const map = new Map<string, BlockDefinition[]>()
    for (const b of filtered) {
      const arr = map.get(b.category) ?? []
      arr.push(b)
      map.set(b.category, arr)
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      blocks: map.get(c)!,
    }))
  }, [query])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={() => useEditor.getState().setSectionsOpen(true)}
          className="nova-focus mb-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
        >
          <LayoutTemplate className="size-3.5" />
          Add a section
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks…"
            className="nova-focus w-full rounded-lg border border-ink-700 bg-ink-850 py-1.5 pl-8 pr-2.5 text-[13px] text-ink-100 placeholder:text-ink-500"
          />
        </div>
      </div>

      <div className="nova-scroll flex-1 overflow-y-auto px-3 pb-6">
        <ComponentsSection query={query} />
        {grouped.map(({ category, blocks }) => (
          <div key={category} className="mb-4">
            <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
              {CATEGORY_LABEL[category]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {blocks.map((b) => (
                <PaletteItem key={b.type} block={b} onAdd={() => addBlock(b.type)} />
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="mt-8 text-center text-[12px] text-ink-500">
            No blocks match “{query}”.
          </div>
        )}
      </div>
    </div>
  )
}

function ComponentsSection({ query }: { query: string }) {
  const components = useEditor((s) => s.components)
  const insertComponent = useEditor((s) => s.insertComponent)
  const q = query.trim().toLowerCase()
  const list = Object.values(components).filter((c) => !q || c.name.toLowerCase().includes(q))
  if (list.length === 0) return null
  return (
    <div className="mb-4">
      <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
        Components
      </div>
      <div className="flex flex-col gap-1.5">
        {list.map((c) => (
          <div
            key={c.id}
            className="group flex items-center gap-2 rounded-lg border border-ink-700/70 bg-ink-850 px-2.5 py-2 text-ink-200 transition hover:border-brand-500/60 hover:bg-ink-800"
          >
            <Component className="size-4 shrink-0 text-brand-400" />
            <button
              onClick={() => insertComponent(c.id)}
              onDoubleClick={() => {
                const name = window.prompt('Rename component:', c.name)
                if (name?.trim()) useEditor.getState().renameComponent(c.id, name.trim())
              }}
              className="nova-focus min-w-0 flex-1 truncate text-left text-[12.5px] font-medium"
              title={`Insert ${c.name} · double-click to rename`}
            >
              {c.name}
            </button>
            <button
              onClick={() => useEditor.getState().enterComponent(c.id)}
              aria-label={`Edit component ${c.name}`}
              title="Edit component"
              className="nova-focus grid size-6 shrink-0 place-items-center rounded text-ink-500 opacity-0 transition hover:text-brand-300 group-hover:opacity-100"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete “${c.name}”? Every instance of it (incl. on other pages) will be removed.`))
                  useEditor.getState().deleteComponent(c.id)
              }}
              aria-label={`Delete component ${c.name}`}
              className="nova-focus grid size-6 shrink-0 place-items-center rounded text-ink-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaletteItem({ block, onAdd }: { block: BlockDefinition; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${block.type}`,
    data: { kind: 'new', type: block.type },
  })
  return (
    <button
      ref={setNodeRef}
      onClick={onAdd}
      {...listeners}
      {...attributes}
      className={cn(
        'nova-focus group flex cursor-grab flex-col items-center gap-2 rounded-xl border border-ink-700/70 bg-ink-850 px-2 py-3.5 active:cursor-grabbing',
        'text-ink-300 transition hover:-translate-y-0.5 hover:border-brand-500/60 hover:bg-ink-800 hover:text-ink-100 hover:shadow-lg hover:shadow-brand-500/10',
        isDragging && 'opacity-40',
      )}
      title={`Click to add, or drag ${block.name} onto the canvas`}
    >
      <block.icon className="size-4.5 transition group-hover:text-brand-400" />
      <span className="text-[11px] font-medium">{block.name}</span>
    </button>
  )
}
