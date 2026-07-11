import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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
    const blocks = allBlocks().filter((b) => b.type !== 'page')
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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <span className="text-[13px] font-semibold tracking-wide text-ink-200">
          Add blocks
        </span>
      </div>
      <div className="px-3 pb-3">
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
        {grouped.map(({ category, blocks }) => (
          <div key={category} className="mb-4">
            <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
              {CATEGORY_LABEL[category]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {blocks.map((b) => (
                <button
                  key={b.type}
                  onClick={() => addBlock(b.type)}
                  className={cn(
                    'nova-focus group flex flex-col items-center gap-2 rounded-xl border border-ink-700/70 bg-ink-850 px-2 py-3.5',
                    'text-ink-300 transition hover:-translate-y-0.5 hover:border-brand-500/60 hover:bg-ink-800 hover:text-ink-100 hover:shadow-lg hover:shadow-brand-500/10',
                  )}
                >
                  <b.icon className="size-4.5 transition group-hover:text-brand-400" />
                  <span className="text-[11px] font-medium">{b.name}</span>
                </button>
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
    </aside>
  )
}
