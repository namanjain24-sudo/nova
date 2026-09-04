import { useEffect, useState } from 'react'
import { Database, Layers, Plus, Trash2, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { useEditor } from '../store/editor'

export function CmsModal() {
  const open = useEditor((s) => s.cmsOpen)
  const collections = useEditor((s) => s.collections)
  const [activeId, setActiveId] = useState<string | null>(null)

  const close = () => useEditor.getState().setCmsOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open && !activeId && collections.length) setActiveId(collections[0].id)
  }, [open, collections, activeId])

  if (!open) return null

  const active = collections.find((c) => c.id === activeId) ?? null

  const newCollection = () => {
    const name = window.prompt('Name your collection (e.g. Blog posts, Products):', 'Posts')
    if (name?.trim()) setActiveId(useEditor.getState().addCollection(name.trim()))
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-pop flex h-[min(720px,92vh)] w-full max-w-[880px] overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50">
        {/* collections sidebar */}
        <div className="flex w-56 shrink-0 flex-col border-r border-ink-800 bg-ink-950/40">
          <div className="flex items-center gap-2 px-4 py-4">
            <Database className="size-4 text-brand-400" />
            <span className="text-[13px] font-bold text-ink-100">CMS</span>
          </div>
          <div className="nova-scroll flex-1 overflow-y-auto px-2">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'nova-focus mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium transition',
                  c.id === activeId ? 'bg-ink-800 text-ink-100' : 'text-ink-400 hover:bg-ink-850 hover:text-ink-200',
                )}
              >
                <Layers className="size-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="text-[10.5px] text-ink-500">{c.items.length}</span>
              </button>
            ))}
          </div>
          <button
            onClick={newCollection}
            className="nova-focus m-2 flex items-center justify-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-[12px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
          >
            <Plus className="size-3.5" />
            New collection
          </button>
        </div>

        {/* items editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-3 border-b border-ink-800 px-5 py-3.5">
            {active ? (
              <>
                <input
                  value={active.name}
                  onChange={(e) => useEditor.getState().renameCollection(active.id, e.target.value)}
                  className="nova-focus min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-[15px] font-bold text-ink-100"
                />
                <button
                  onClick={() => useEditor.getState().insertCollectionList(active.id)}
                  className="nova-focus shrink-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
                >
                  Insert on page
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete collection “${active.name}”?`)) {
                      useEditor.getState().deleteCollection(active.id)
                      setActiveId(null)
                    }
                  }}
                  aria-label="Delete collection"
                  className="nova-focus grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </>
            ) : (
              <span className="text-[14px] font-semibold text-ink-300">No collection selected</span>
            )}
            <button
              onClick={close}
              aria-label="Close"
              className="nova-focus grid size-8 shrink-0 place-items-center rounded-lg text-ink-300 transition hover:bg-ink-800 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="nova-scroll flex-1 overflow-y-auto p-4">
            {!active ? (
              <div className="grid h-full place-items-center text-center text-[13px] text-ink-500">
                <div>
                  <Database className="mx-auto mb-3 size-8 text-ink-600" />
                  Create a collection to manage content — then drop a Collection list on any page.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {active.items.map((it, i) => (
                  <div key={it.id} className="rounded-xl border border-ink-800 bg-ink-850/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
                        Item {i + 1}
                      </span>
                      <button
                        onClick={() => useEditor.getState().deleteItem(active.id, it.id)}
                        aria-label="Delete item"
                        className="nova-focus ml-auto grid size-6 place-items-center rounded text-ink-500 transition hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Title" value={it.title} onChange={(v) => set(active.id, it.id, { title: v })} span />
                      <Field label="Subtitle" value={it.subtitle} onChange={(v) => set(active.id, it.id, { subtitle: v })} span />
                      <Field label="Tag" value={it.tag} onChange={(v) => set(active.id, it.id, { tag: v })} />
                      <Field label="Link URL" value={it.url} onChange={(v) => set(active.id, it.id, { url: v })} />
                      <Field label="Image URL" value={it.image} onChange={(v) => set(active.id, it.id, { image: v })} span />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => useEditor.getState().addItem(active.id)}
                  className="nova-focus flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-700 py-3 text-[12.5px] font-medium text-ink-300 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
                >
                  <Plus className="size-4" />
                  Add item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function set(cid: string, iid: string, patch: Record<string, string>) {
  useEditor.getState().updateItem(cid, iid, patch)
}

function Field({
  label,
  value,
  onChange,
  span,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  span?: boolean
}) {
  return (
    <label className={cn('block', span && 'col-span-2')}>
      <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-wide text-ink-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="nova-focus w-full rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-[12.5px] text-ink-100 placeholder:text-ink-600"
      />
    </label>
  )
}
