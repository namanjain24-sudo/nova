import { useEffect, useRef, useState } from 'react'
import { Plus, X, Home, File, Copy, Search, ImagePlus } from 'lucide-react'
import { useEditor } from '../store/editor'
import { cn } from '../lib/cn'

export function PagesBar() {
  const pages = useEditor((s) => s.pages)
  const activeId = useEditor((s) => s.activePageId)
  const switchPage = useEditor((s) => s.switchPage)
  const addPage = useEditor((s) => s.addPage)
  const renamePage = useEditor((s) => s.renamePage)
  const deletePage = useEditor((s) => s.deletePage)
  const duplicatePage = useEditor((s) => s.duplicatePage)

  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex h-9 shrink-0 items-center gap-1 border-b border-ink-800 bg-ink-900 px-3">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
        Pages
      </span>
      <div className="nova-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {pages.map((p, i) => (
          <PageChip
            key={p.id}
            name={p.name}
            isHome={i === 0}
            active={p.id === activeId}
            editing={editingId === p.id}
            canDelete={pages.length > 1}
            onClick={() => switchPage(p.id)}
            onRename={(name) => {
              renamePage(p.id, name)
              setEditingId(null)
            }}
            onStartRename={() => setEditingId(p.id)}
            onCancelRename={() => setEditingId(null)}
            onDuplicate={() => duplicatePage(p.id)}
            onDelete={() => {
              if (window.confirm(`Delete page “${p.name}”?`)) deletePage(p.id)
            }}
          />
        ))}
      </div>
      <PageSettings />
      <button
        onClick={() => addPage()}
        title="Add a page"
        className="nova-focus flex shrink-0 items-center gap-1 rounded-md border border-ink-700 px-2 py-1 text-[12px] font-medium text-ink-300 transition hover:border-brand-500/60 hover:bg-ink-800 hover:text-white"
      >
        <Plus className="size-3.5" />
        Page
      </button>
    </div>
  )
}

/** Popover to edit the active page's SEO title, description, and social image. */
function PageSettings() {
  const doc = useEditor((s) => s.doc)
  const updateProps = useEditor((s) => s.updateProps)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const name = (doc.props?.name as string) || 'Untitled Page'
  const seoTitle = (doc.props?.seoTitle as string) ?? ''
  const desc = (doc.props?.seoDescription as string) ?? ''
  const image = (doc.props?.ogImage as string) ?? ''
  const set = (patch: Record<string, any>) => updateProps(doc.id, patch)

  const displayTitle = seoTitle || name
  const displayDesc = desc || 'Add a description so search engines and social cards show a compelling summary of this page.'

  const onImageFile = (file: File | undefined) => {
    if (!file) return
    if (file.size > 3_000_000) {
      alert('Please choose an image under 3 MB (it is embedded directly in your page).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => set({ ogImage: String(reader.result) })
    reader.readAsDataURL(file)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Page SEO & social settings"
        aria-expanded={open}
        className={cn(
          'nova-focus flex items-center gap-1 rounded-md border px-2 py-1 text-[12px] font-medium transition',
          open
            ? 'border-brand-500/60 bg-ink-800 text-white'
            : 'border-ink-700 text-ink-300 hover:border-brand-500/60 hover:bg-ink-800 hover:text-white',
        )}
      >
        <Search className="size-3.5" />
        SEO
      </button>

      {open && (
        <div className="animate-pop absolute right-0 top-[calc(100%+8px)] z-40 w-[340px] overflow-hidden rounded-xl border border-ink-700 bg-ink-900 p-4 shadow-2xl shadow-black/50">
          <div className="mb-3 flex items-center gap-2">
            <Search className="size-4 text-brand-400" />
            <span className="text-[13px] font-semibold text-ink-100">Page SEO</span>
            <span className="ml-auto truncate text-[11px] text-ink-500">{name}</span>
          </div>

          {/* Google-style live preview */}
          <div className="mb-4 rounded-lg border border-ink-800 bg-ink-850/60 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">Search preview</div>
            <div className="mt-2 truncate text-[13px] font-medium text-[#8ab4f8]">{displayTitle}</div>
            <div className="truncate text-[11px] text-emerald-500/80">yoursite.com › {name.toLowerCase().replace(/\s+/g, '-')}</div>
            <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-ink-400">{displayDesc}</div>
          </div>

          <label className="block text-[11px] font-semibold text-ink-300">Title tag</label>
          <input
            value={seoTitle}
            onChange={(e) => set({ seoTitle: e.target.value || undefined })}
            placeholder={name}
            className="nova-focus mt-1 w-full rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1.5 text-[12.5px] text-ink-100 placeholder:text-ink-500"
          />

          <div className="mt-3 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-ink-300">Meta description</label>
            <span className={cn('text-[10.5px]', desc.length > 158 ? 'text-red-400' : 'text-ink-500')}>
              {desc.length}/158
            </span>
          </div>
          <textarea
            value={desc}
            onChange={(e) => set({ seoDescription: e.target.value || undefined })}
            placeholder="Auto-generated from your page content if left blank."
            rows={3}
            className="nova-focus mt-1 w-full resize-none rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1.5 text-[12.5px] leading-snug text-ink-100 placeholder:text-ink-500"
          />

          <label className="mt-3 block text-[11px] font-semibold text-ink-300">Social share image</label>
          <div className="mt-1 flex items-center gap-2.5">
            <div className="grid h-11 w-[76px] shrink-0 place-items-center overflow-hidden rounded-lg border border-ink-700 bg-ink-850">
              {image ? (
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-4 text-ink-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <input
                value={image.startsWith('data:') ? '' : image}
                onChange={(e) => set({ ogImage: e.target.value || undefined })}
                placeholder={image.startsWith('data:') ? 'Uploaded ✓' : 'https://…/cover.png'}
                className="nova-focus w-full rounded-md border border-ink-700 bg-ink-850 px-2 py-1 text-[12px] text-ink-100 placeholder:text-ink-500"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <label className="nova-focus cursor-pointer rounded-md border border-ink-700 bg-ink-850 px-2 py-1 text-[11px] font-medium text-ink-200 transition hover:border-brand-500/60 hover:text-white">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onImageFile(e.target.files?.[0])}
                  />
                </label>
                {image && (
                  <button
                    onClick={() => set({ ogImage: undefined })}
                    className="text-[11px] font-medium text-ink-500 transition hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-500">
            These power the browser tab, Google results, and link previews on X, Slack, iMessage, and more.
          </p>
        </div>
      )}
    </div>
  )
}

function PageChip({
  name,
  isHome,
  active,
  editing,
  canDelete,
  onClick,
  onRename,
  onStartRename,
  onCancelRename,
  onDuplicate,
  onDelete,
}: {
  name: string
  isHome: boolean
  active: boolean
  editing: boolean
  canDelete: boolean
  onClick: () => void
  onRename: (name: string) => void
  onStartRename: () => void
  onCancelRename: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [val, setVal] = useState(name)

  useEffect(() => {
    if (editing) {
      setVal(name)
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, name])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onRename(val)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onRename(val)
          if (e.key === 'Escape') onCancelRename()
        }}
        className="nova-focus w-28 rounded-md border border-brand-500/60 bg-ink-850 px-2 py-1 text-[12px] text-ink-100"
      />
    )
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onStartRename}
      className={cn(
        'group flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] transition',
        active
          ? 'bg-ink-700 text-ink-100'
          : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200',
        'cursor-pointer',
      )}
      title="Click to open · double-click to rename"
    >
      {isHome ? <Home className="size-3" /> : <File className="size-3" />}
      <span className="max-w-[120px] truncate font-medium">{name}</span>
      {active && (
        <span className="flex items-center gap-0.5 pl-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            title="Duplicate page"
            className="grid size-4 place-items-center rounded text-ink-400 hover:text-white"
          >
            <Copy className="size-3" />
          </button>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              title="Delete page"
              className="grid size-4 place-items-center rounded text-ink-400 hover:text-red-400"
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      )}
    </div>
  )
}
